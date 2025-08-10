import type { Database, SqlJsStatic } from "sql.js";
import {
  DictionaryEntry,
  DictionaryParserConfig,
  SearchResult,
  SearchOptions,
} from "../types/types";
import { SearchTermGenerator, RelevanceCalculator } from "../lib/search-utils";
import { SEARCH_LIMITS } from "../lib/constants";

export class EnhancedDictionarySearchEngine {
  private db: Database;
  private config: DictionaryParserConfig;
  private dictionaryName: string;

  constructor(
    private sqlClient: SqlJsStatic,
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

    // Генерируем все поисковые термины для данного токена
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

      while (stmt.step()) {
        const row = stmt.getAsObject();
        const values = Object.values(row);
        const parsed = this.parseEntry(values);

        if (parsed && this.isValidResult(parsed, term)) {
          results.push(parsed);
        }
      }

      stmt.free();
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

  private parseEntry(values: any[]): DictionaryEntry | null {
    try {
      const word = values[this.config.columnMapping.word as number] || "";
      const reading = values[this.config.columnMapping.reading as number] || "";
      const type = values[this.config.columnMapping.type as number] || "";
      const rawMeanings = values[this.config.columnMapping.meanings as number];

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
              : JSON.parse(rawMeanings);
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

      return {
        word: String(word),
        reading: String(reading),
        type: String(type),
        meanings: Array.isArray(meanings) ? meanings.filter(Boolean) : [],
      };
    } catch (error) {
      console.warn("Parse entry error:", error);
      return null;
    }
  }

  private isValidResult(result: DictionaryEntry, searchTerm: string): boolean {
    return (
      result.word.trim().length > 0 &&
      result.meanings.length > 0 &&
      // Фильтруем слишком длинные результаты для коротких поисковых терминов
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
