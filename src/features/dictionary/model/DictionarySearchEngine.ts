import type { Database, SqlJsStatic } from "sql.js";
import {
  DictionaryEntry,
  DictionaryParserConfig,
} from "../types/dictionary.types";

export class DictionarySearchEngine {
  private db: Database;
  private config: DictionaryParserConfig;

  constructor(
    private sqlClient: SqlJsStatic,
    dbFile: ArrayBuffer,
    config: DictionaryParserConfig
  ) {
    this.db = new sqlClient.Database(new Uint8Array(dbFile));
    this.config = config;
  }

  search(tokens: string[], deepMode: boolean = false): DictionaryEntry[] {
    const results: DictionaryEntry[] = [];
    const seenEntries = new Set<string>();

    // Разные лимиты для разных режимов
    const tokenLimit = deepMode ? 15 : 5;
    const resultLimit = deepMode ? 100 : 50;
    const perTokenLimit = deepMode ? 20 : 10;

    const limitedTokens = tokens.slice(0, tokenLimit);

    for (const token of limitedTokens) {
      const tokenResults = this.searchToken(token, deepMode, perTokenLimit);

      for (const result of tokenResults) {
        const key = `${result.word}-${result.reading}`;
        if (!seenEntries.has(key)) {
          seenEntries.add(key);
          results.push(result);
        }
      }
      
      // Общий лимит результатов
      if (results.length >= resultLimit) break;
    }

    return results.sort((a, b) => b.word.length - a.word.length);
  }

  private searchToken(token: string, deepMode: boolean = false, limit: number = 10): DictionaryEntry[] {
    const results: DictionaryEntry[] = [];

    try {
      // В глубоком режиме используем расширенные запросы
      const query = deepMode 
        ? this.getDeepQuery() 
        : (this.config.sqlQuery || this.getSimpleQuery());
      
      const stmt = this.db.prepare(query);
      
      if (deepMode) {
        // Для глубокого поиска добавляем частичное совпадение
        stmt.bind([token, token + '%', '%' + token + '%']);
      } else {
        stmt.bind([token]);
      }

      let count = 0;
      while (stmt.step() && count < limit) {
        const row = stmt.getAsObject();
        const values = Object.values(row);
        const parsed = this.parseEntry(values, deepMode);

        if (parsed) {
          results.push(parsed);
          count++;
        }
      }

      stmt.free();
    } catch (error) {
      console.warn(`Search error for token "${token}":`, error);
    }

    return results;
  }

  private getSimpleQuery(): string {
    // Простой запрос точного соответствия
    return `
      SELECT * FROM terms 
      WHERE "0" = ? 
      ORDER BY length("0") DESC 
      LIMIT 10
    `;
  }

  private getDeepQuery(): string {
    // Расширенный запрос для глубокого поиска
    return `
      SELECT DISTINCT * FROM terms 
      WHERE "0" = ? 
         OR "0" LIKE ? 
         OR "0" LIKE ?
      ORDER BY 
        CASE 
          WHEN "0" = ? THEN 1
          WHEN "0" LIKE ? || '%' THEN 2
          ELSE 3 
        END,
        length("0") DESC 
      LIMIT 25
    `;
  }

  private parseEntry(values: any[], deepMode: boolean = false): DictionaryEntry | null {
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
              // В глубоком режиме показываем больше значений
              meanings = meanings.slice(0, deepMode ? 10 : 5);
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
        meanings: Array.isArray(meanings) 
          ? meanings.slice(0, deepMode ? 10 : 5) 
          : [],
      };
    } catch (error) {
      console.warn("Parse entry error:", error);
      return null;
    }
  }

  close(): void {
    try {
      this.db.close();
    } catch (error) {
      console.warn("Error closing database:", error);
    }
  }
}