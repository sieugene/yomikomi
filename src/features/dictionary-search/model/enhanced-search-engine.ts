import type { Database, SqlJsStatic, SqlValue } from "sql.js";
import {
  DictionaryEntry,
  DictionaryParserConfig,
} from "../../dictionary/types";
import { SearchTermGenerator, RelevanceCalculator } from "../lib/search-utils";
import { SearchOptions, SearchResult } from "../types";
import { SEARCH_LIMITS } from "../lib/constants";

export class EnhancedDictionarySearchEngine {
  private db: Database;
  private config: DictionaryParserConfig;
  private dictionaryName: string;
  private isKanjiDict: boolean;

  constructor(
    private readonly sqlClient: SqlJsStatic,
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
      config.searchStrategy.searchByCharacter === true;
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
    const results: SearchResult[] = [];
    const limits = options.deepMode
      ? SEARCH_LIMITS.DEEP_MODE
      : SEARCH_LIMITS.FAST_MODE;

    const searchTerms = this.isKanjiDict
      ? this.generateSearchTerms(searchTerm)
      : options.includeSubstrings
      ? SearchTermGenerator.generateSearchTerms(searchTerm, {
          maxSubstrings: limits.MAX_SUBSTRINGS,
          includeReversed: options.deepMode,
          minLength: 1,
        })
      : [searchTerm];

    console.log(
      `[${
        this.isKanjiDict ? "Kanji" : "Standard"
      }] Searching for "${searchTerm}" with terms:`,
      searchTerms
    );

    for (const term of searchTerms) {
      const termResults = this.executeSingleTermSearch(term, options);

      const matchType: SearchResult["matchType"] =
        term === searchTerm
          ? "exact"
          : searchTerm.startsWith(term) || searchTerm.endsWith(term)
          ? "partial"
          : "substring";

      for (const result of termResults) {
        const relevanceScore = RelevanceCalculator.calculateRelevance(
          result,
          searchTerm,
          matchType
        );

        results.push({
          ...result,
          source: this.dictionaryName,
          relevanceScore,
          matchType,
        });
      }

      if (results.length >= limits.MAX_TOTAL_RESULTS) break;
    }

    return this.deduplicateAndSort(results).slice(0, options.maxResults);
  }

  private generateSearchTerms(text: string): string[] {
    const terms = new Set<string>();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      const isKanji =
        (code >= 0x4e00 && code <= 0x9fff) ||
        (code >= 0x3400 && code <= 0x4dbf) ||
        (code >= 0xf900 && code <= 0xfaff);

      if (isKanji) {
        terms.add(char);
      } else {
        // for hiragana and katakana, add the whole word
        terms.add(text);
        break;
      }
    }

    return Array.from(terms);
  }

  public hasTokenBulk(tokens: string[]): DictionaryEntry[] {
    if (!tokens.length) return [];
    try {
      // TODO dynamic way for getting table name, is good ?
      const match = this.config.sqlQuery.match(/FROM\s+([^\s;]+)/i);
      const tableName = match ? match[1] : null;
      const placeholders = tokens.map(() => "?").join(",");
      const query = `SELECT * FROM ${tableName} WHERE "${this.config.columnMapping.word}" IN (${placeholders})`;
      const stmt = this.db.prepare(query);
      stmt.bind(tokens);

      const results: DictionaryEntry[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const entry = this.parseEntry(Object.values(row));
        if (entry) results.push(entry);
      }

      stmt.free();
      return results;
    } catch (error) {
      console.warn(`hasTokenBulk error:`, error);
      return [];
    }
  }

  private executeSingleTermSearch(
    rawTerm: string,
    options: SearchOptions
  ): DictionaryEntry[] {
    const term = rawTerm.normalize("NFKC").trim();
    const results: DictionaryEntry[] = [];

    try {
      const query = this.config.sqlQuery || this.buildSearchQuery(options);
      const stmt = this.db.prepare(query);

      if (options.includePartialMatches) {
        stmt.bind([term, term, term, term, term, options.maxResults || 50]);
      } else {
        stmt.bind([term, options.maxResults || 20]);
      }

      let processedCount = 0;
      while (stmt.step() && processedCount < (options.maxResults || 50)) {
        const row = stmt.getAsObject();
        const values = Object.values(row);

        console.log(`Raw row data for "${term}":`, values.slice(0, 6));

        const parsed = this.parseEntry(values);

        if (parsed && this.isValidResult(parsed, term)) {
          results.push(parsed);
          processedCount++;
        } else if (parsed) {
          console.log(`Filtered out result for "${term}":`, parsed);
        }
      }

      stmt.free();
      console.log(`Found ${results.length} valid results for term "${term}"`);
    } catch (error) {
      console.warn(
        `Search error for term "${term}" in ${this.dictionaryName}:`,
        error
      );
    }

    return results;
  }

  private buildSearchQuery(options: SearchOptions): string {
    if (options.includePartialMatches) {
      // TODO
      return `
        SELECT DISTINCT * FROM terms 
        WHERE "0" = ? 
           OR "0" LIKE ? || '%' 
           OR "0" LIKE '%' || ? || '%'
        ORDER BY 
          CASE 
            WHEN "0" = ? THEN 1
            WHEN "0" LIKE ? || '%' THEN 2
            ELSE 3 
          END,
          length("0") DESC 
        LIMIT ?
      `;
    } else {
      return `
        SELECT * FROM terms 
        WHERE "0" = ? 
        ORDER BY length("0") DESC 
        LIMIT ?
      `;
    }
  }

  private parseEntry(values: SqlValue[]): DictionaryEntry | null {
    try {
      const word = values[this.config.columnMapping.word as number] || "";
      const reading = values[this.config.columnMapping.reading as number] || "";
      const type = values[this.config.columnMapping.type as number] || "";
      const rawMeanings = values[this.config.columnMapping.meanings as number];

      let metadata: Record<string, string | number> | undefined;
      if (this.config.columnMapping.metadata !== undefined) {
        const rawMetadata =
          values[this.config.columnMapping.metadata as number];
        if (rawMetadata && typeof rawMetadata === "object") {
          metadata = rawMetadata as unknown as Record<string, string | number>;
        }
      }

      let meanings: string[] = [];

      switch (this.config.meaningParser.type) {
        case "array":
          meanings = Array.isArray(rawMeanings) ? rawMeanings : [];
          break;
        case "string":
          meanings = typeof rawMeanings === "string" ? [rawMeanings] : [];
          break;
        case "json":
          try {
            meanings = Array.isArray(rawMeanings)
              ? rawMeanings
              : JSON.parse(rawMeanings as unknown as string);
          } catch {
            meanings = [];
          }
          break;
        case "custom":
          if (this.config.meaningParser.customFunction) {
            try {
              const fn = new Function(
                "rawContent",
                this.config.meaningParser.customFunction
              );
              meanings = fn(rawMeanings) || [];
            } catch (error) {
              console.warn("Custom parser function error:", error);
              meanings = [];
            }
          }
          break;
      }

      const result: DictionaryEntry = {
        word: String(word),
        reading: String(reading),
        type: String(type),
        meanings: Array.isArray(meanings) ? meanings.filter(Boolean) : [],
        metadata,
      };

      return result;
    } catch (error) {
      console.warn("Parse entry error:", error, "Values:", values);
      return null;
    }
  }

  private isValidResult(result: DictionaryEntry, searchTerm: string): boolean {
    if (this.isKanjiDict) {
      return result.word.length > 0 && result.meanings.length > 0;
    }

    return (
      result.word.length > 0 &&
      result.meanings.length > 0 &&
      !(searchTerm.length === 1 && result.word.length > 6)
    );
  }

  private deduplicateAndSort(results: SearchResult[]): SearchResult[] {
    const uniqueMap = new Map<string, SearchResult>();

    for (const result of results) {
      const key = `${result.word}|${result.reading}|${result.source}`;
      const existing = uniqueMap.get(key);

      // Берем результат с лучшим скором релевантности
      if (!existing || result.relevanceScore > existing.relevanceScore) {
        uniqueMap.set(key, result);
      }
    }

    return Array.from(uniqueMap.values()).sort(
      (a, b) => b.relevanceScore - a.relevanceScore
    );
  }

  close(): void {
    try {
      this.db.close();
    } catch (error) {
      console.warn(`Error closing database ${this.dictionaryName}:`, error);
    }
  }
}
