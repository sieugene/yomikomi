import type { Database, SqlJsStatic, SqlValue } from "sql.js";
import type {
  DictionaryEntry,
  DictionaryParserConfig,
} from "@/features/dictionary/types";
import { SearchTermGenerator } from "./search-term-generator";

import { RelevanceCalculator } from "@/features/dictionary-search/lib/search-utils";
import type {
  SearchOptions,
  SearchResult,
} from "@/features/dictionary-search/types";
import { DEFAULT_SEARCH_LIMITS } from "../lib/constants";
import { buildMultiColumnQuery } from "../lib/query-builder";
import { dedupeAndSort } from "../lib/result-utils";
import { normalizeTerm } from "../lib/text-utils";

export class EnhancedDictionarySearchEngine {
  private db: Database;
  private config: DictionaryParserConfig;
  private dictionaryName: string;
  private isKanjiDict: boolean;

  constructor(
    sqlClient: SqlJsStatic,
    dbFile: ArrayBuffer,
    config: DictionaryParserConfig,
    dictionaryName: string,
    dictionaryType?: "standard" | "kanji"
  ) {
    this.db = new sqlClient.Database(new Uint8Array(dbFile));
    this.config = config;
    this.dictionaryName = dictionaryName;
    this.isKanjiDict =
      dictionaryType === "kanji" ||
      config.searchStrategy?.searchByCharacter === true;
  }

  searchToken(
    searchTerm: string,
    options: SearchOptions = {
      deepMode: false,
      maxResults: 50,
      includePartialMatches: true,
      includeSubstrings: true,
    }
  ): SearchResult[] {
    const limits = options.deepMode
      ? DEFAULT_SEARCH_LIMITS.DEEP_MODE
      : DEFAULT_SEARCH_LIMITS.FAST_MODE;
    const maxVariants = options.deepMode
      ? limits.MAX_SUBSTRINGS
      : limits.MAX_SUBSTRINGS;

    const normalized = normalizeTerm(searchTerm);
    if (!normalized) return [];

    // Determine which columns to search. При отсутствии явно берем колонку word и reading если задано
    const columnsForSearch: number[] =
      (this.config?.searchStrategy?.columnsForSearch as number[]) ||
      [
        this.config.columnMapping.word as number,
        this.config.columnMapping.reading as number,
      ].filter((c) => typeof c === "number");

    // Prepare SQL
    const { sql, paramCountPerColumn } = buildMultiColumnQuery(
      columnsForSearch,
      true
    );

    const stmt = this.db.prepare(sql);
    const results: SearchResult[] = [];

    const variants = SearchTermGenerator.generateVariants(
      normalized,
      {
        minLen: 1,
        maxVariants,
      },
      this.isKanjiDict
    );

    for (const variant of variants) {
      try {
        // Build bind params: for each column add paramCountPerColumn copies (condition section)
        const binds: (string | number)[] = [];
        for (let i = 0; i < columnsForSearch.length; i++) {
          if (paramCountPerColumn === 3) {
            binds.push(variant, variant, variant);
          } else {
            binds.push(variant);
          }
        }
        // for CASE WHEN equal checks we need 1 param per column (equality)
        for (let i = 0; i < columnsForSearch.length; i++) binds.push(variant);
        // final LIMIT
        binds.push(options.maxResults ?? 50);

        stmt.bind(binds);

        let count = 0;
        while (stmt.step() && count < (options.maxResults ?? 50)) {
          const row = stmt.getAsObject();
          const values = Object.values(row) as SqlValue[];

          const parsed = this.parseEntry(values);
          if (!parsed) continue;

          const matchType: SearchResult["matchType"] =
            variant === normalized
              ? "exact"
              : variant.length >= Math.max(2, Math.floor(normalized.length / 2))
              ? "partial"
              : "substring";

          const relevanceScore = RelevanceCalculator.calculateRelevance(
            parsed,
            normalized,
            matchType
          );

          results.push({
            ...parsed,
            source: this.dictionaryName,
            relevanceScore,
            matchType,
          });

          count++;
        }

        stmt.reset();

        if (results.length >= limits.MAX_TOTAL_RESULTS) break;
      } catch (err) {
        console.warn(
          `Search error for variant "${variant}" in ${this.dictionaryName}:`,
          err
        );
        try {
          stmt.reset();
        } catch (e) {
          console.warn("Statement reset error:", e);
        }
      }
    }

    try {
      stmt.free();
    } catch (e) {
      console.warn("Statement free error:", e);
    }

    return dedupeAndSort(results).slice(0, options.maxResults ?? 50);
  }

  public hasTokenBulk(tokens: string[]): DictionaryEntry[] {
    if (!tokens || tokens.length === 0) return [];

    try {
      // dynamic table name discovery
      const match = (this.config.sqlQuery || "").match(/FROM\s+([\w"]+)/i);
      const tableName = match ? match[1] : "terms";
      // We will search by the primary 'word' column
      const wordCol = this.config.columnMapping.word as number;
      const placeholders = tokens.map(() => "?").join(",");
      const query = `SELECT * FROM ${tableName} WHERE CAST("${wordCol}" AS TEXT) IN (${placeholders})`;

      const stmt = this.db.prepare(query);
      stmt.bind(tokens.map(normalizeTerm));

      const results: DictionaryEntry[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const parsed = this.parseEntry(Object.values(row));
        if (parsed) results.push(parsed);
      }
      stmt.free();
      return results;
    } catch (err) {
      console.warn("hasTokenBulk error:", err);
      return [];
    }
  }

  private parseEntry(values: SqlValue[]): DictionaryEntry | null {
    try {
      const wordIdx = this.config.columnMapping.word as number;
      const readingIdx = this.config.columnMapping.reading as number;
      const typeIdx = this.config.columnMapping.type as number;
      const meaningsIdx = this.config.columnMapping.meanings as number;
      const metadataIdx = this.config.columnMapping.metadata as
        | number
        | undefined;

      const word = values[wordIdx] ?? "";
      const reading = readingIdx !== undefined ? values[readingIdx] ?? "" : "";
      const type = typeIdx !== undefined ? values[typeIdx] ?? "" : "";
      const rawMeanings =
        meaningsIdx !== undefined ? values[meaningsIdx] : undefined;

      let metadata: Record<string, unknown> | undefined;
      if (metadataIdx !== undefined) {
        const raw = values[metadataIdx];
        if (raw && typeof raw === "object") {
          metadata = raw as unknown as Record<string, unknown>;
        } else if (typeof raw === "string") {
          try {
            metadata = JSON.parse(raw);
          } catch {
            metadata = { raw };
          }
        }
      }

      let meanings: string[] = [];
      const parser = this.config.meaningParser || { type: "string" };

      switch (parser.type) {
        case "array":
          meanings = Array.isArray(rawMeanings)
            ? (rawMeanings as string[])
            : [];
          break;

        case "string":
          meanings =
            typeof rawMeanings === "string" ? [rawMeanings as string] : [];
          break;

        case "json":
          try {
            const parsed =
              typeof rawMeanings === "string"
                ? JSON.parse(rawMeanings)
                : rawMeanings;
            meanings = Array.isArray(parsed)
              ? parsed
              : typeof parsed === "string"
              ? [parsed]
              : [];
          } catch {
            meanings = [];
          }
          break;

        case "custom":
          if (parser.customFunction) {
            try {
              // Вызов пользовательской функции, которая возвращает массив значений
              const fn = new Function("rawContent", parser.customFunction);
              const parsed = fn(rawMeanings);
              if (Array.isArray(parsed)) meanings = parsed;
              else if (typeof parsed === "string") meanings = [parsed];
              else meanings = [];
            } catch (error) {
              console.warn("Custom parser function error:", error);
              meanings = [];
            }
          }
          break;

        default:
          // fallback: поддерживаем как массив, так и строку
          if (Array.isArray(rawMeanings)) meanings = rawMeanings as string[];
          else if (typeof rawMeanings === "string") meanings = [rawMeanings];
          else meanings = [];
      }

      const result: DictionaryEntry = {
        word: String(word),
        reading: String(reading || ""),
        type: String(type || ""),
        meanings: Array.isArray(meanings) ? meanings.filter(Boolean) : [],
        metadata,
      };

      return result;
    } catch (error) {
      console.warn("Parse entry error:", error, "Values:", values);
      return null;
    }
  }

  // Обёртка для утилиты дедупа и сортировки (сохраняет публичный интерфейс)
  dedupeAndSort(results: SearchResult[]) {
    return dedupeAndSort(results);
  }

  close(): void {
    try {
      this.db.close();
    } catch (error) {
      console.warn(`Error closing database ${this.dictionaryName}:`, error);
    }
  }
}
