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

  constructor(
    private readonly sqlClient: SqlJsStatic,
    dbFile: ArrayBuffer,
    config: DictionaryParserConfig,
    dictionaryName: string
  ) {
    this.db = new sqlClient.Database(new Uint8Array(dbFile));
    this.config = config;
    this.dictionaryName = dictionaryName;
  }

  /**
   * Поиск по одному конкретному токену с расширенными возможностями
   */
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

    const searchTerms = options.includeSubstrings
      ? SearchTermGenerator.generateSearchTerms(searchTerm, {
          maxSubstrings: limits.MAX_SUBSTRINGS,
          includeReversed: options.deepMode,
          minLength: 1,
        })
      : [searchTerm];

    console.log(`Searching for "${searchTerm}" with terms:`, searchTerms);

    for (const term of searchTerms) {
      const termResults = this.executeSingleTermSearch(term, options);

      // Определяем тип соответствия
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

      // Прерываем поиск если достигли лимита
      if (results.length >= limits.MAX_TOTAL_RESULTS) break;
    }

    // Сортируем по релевантности и убираем дубли по ключу word+reading
    return this.deduplicateAndSort(results).slice(0, options.maxResults);
  }

  public hasTokenBulk(tokens: string[]): DictionaryEntry[] {
    if (!tokens.length) return [];
    try {
      // TODO
      const placeholders = tokens.map(() => "?").join(",");
      const query = `SELECT * FROM terms WHERE "0" IN (${placeholders})`;
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
    term: string,
    options: SearchOptions
  ): DictionaryEntry[] {
    const results: DictionaryEntry[] = [];

    try {
      const query = this.buildSearchQuery(options);
      const stmt = this.db.prepare(query);

      // Биндим параметры в зависимости от типа запроса
      if (options.includePartialMatches) {
        // Для partial search: exact, prefix, contains
        stmt.bind([term, term, term, term, term, options.maxResults || 50]);
      } else {
        // Для exact search
        stmt.bind([term, options.maxResults || 20]);
      }

      let processedCount = 0;
      while (stmt.step() && processedCount < (options.maxResults || 50)) {
        const row = stmt.getAsObject();
        const values = Object.values(row);

        console.log(`Raw row data for "${term}":`, values.slice(0, 6)); // Debug log

        const parsed = this.parseEntry(values);

        if (parsed && this.isValidResult(parsed, term)) {
          results.push(parsed);
          processedCount++;
        } else if (parsed) {
          console.log(`Filtered out result for "${term}":`, parsed); // Debug log
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

      console.log(
        `Parsing entry - Word: "${word}", Reading: "${reading}", Type: "${type}", Raw meanings:`,
        rawMeanings
      );

      let meanings: string[] = [];

      // Строго следуем настройкам шаблона
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
              : // TODO rawMeanings is?
                JSON.parse(rawMeanings as unknown as string);
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
      };

      console.log(`Parsed result:`, result);
      return result;
    } catch (error) {
      console.warn("Parse entry error:", error, "Values:", values);
      return null;
    }
  }

  private isValidResult(result: DictionaryEntry, searchTerm: string): boolean {
    const isValid =
      result.word.length > 0 &&
      result.meanings.length > 0 &&
      // Фильтруем слишком длинные результаты для коротких поисковых терминов
      !(searchTerm.length === 1 && result.word.length > 6);

    if (!isValid) {
      console.log(
        `Result filtered out - Word: "${result.word}", Meanings count: ${result.meanings.length}`
      );
    }

    return isValid;
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
