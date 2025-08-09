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

  search(tokens: string[]): DictionaryEntry[] {
    const results: DictionaryEntry[] = [];
    const seenEntries = new Set<string>();

    for (const token of tokens) {
      const tokenResults = this.searchToken(token);

      for (const result of tokenResults) {
        const key = `${result.word}-${result.reading}`;
        if (!seenEntries.has(key)) {
          seenEntries.add(key);
          results.push(result);
        }
      }
    }

    return results.sort((a, b) => b.word.length - a.word.length);
  }

  private searchToken(token: string): DictionaryEntry[] {
    const results: DictionaryEntry[] = [];

    try {
      let query = this.config.sqlQuery;


      // Если не указан кастомный запрос, используем улучшенный поиск по умолчанию
      if (!query || query.includes("SELECT * FROM")) {
        query = this.buildAdvancedSearchQuery(token);
      }

      const stmt = this.db.prepare(query);
      stmt.bind([token]);

      while (stmt.step()) {
        const row = stmt.getAsObject();
        const values = Object.values(row);
        const parsed = this.parseEntry(values);

        if (parsed) {
          results.push(parsed);
        }
      }

      stmt.free();
    } catch (error) {
      console.warn(`Search error for token "${token}":`, error);
    }

    return results;
  }

  private buildAdvancedSearchQuery(token: string): string {
    switch (this.config.searchStrategy.type) {
      case "partial":
        return `
          WITH RECURSIVE token_parts AS (
            SELECT ? as token, length(?) as original_length
            UNION ALL
            SELECT substr(token, 1, length(token)-1), original_length
            FROM token_parts 
            WHERE length(token) > 1
          )
          SELECT DISTINCT t.*, 
                 length(t."0") as match_length,
                 (length(t."0") * 100.0 / original_length) as relevance_score
          FROM terms t
          JOIN token_parts tp ON (
            t."0" = tp.token OR 
            t."0" LIKE tp.token || '%' OR
            tp.token LIKE t."0" || '%'
          )
          ORDER BY relevance_score DESC, match_length DESC
          LIMIT 50
        `;

      case "ngram":
        const ngramSize = this.config.searchStrategy.ngramSize || 2;
        return `
          SELECT DISTINCT t.*, 
                 length(t."0") as match_length
          FROM terms t
          WHERE t."0" LIKE '%' || substr(?, 1, ${ngramSize}) || '%'
             OR t."0" LIKE '%' || substr(?, 2, ${ngramSize}) || '%'
             OR t."0" = ?
          ORDER BY 
            CASE WHEN t."0" = ? THEN 1 
                 WHEN t."0" LIKE ? || '%' THEN 2
                 ELSE 3 END,
            length(t."0") DESC
          LIMIT 50
        `;

      default: // exact
        return `SELECT * FROM terms WHERE "0" = ? LIMIT 10`;
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
        meanings: Array.isArray(meanings) ? meanings : [],
      };
    } catch (error) {
      console.warn("Parse entry error:", error);
      return null;
    }
  }

  close(): void {
    this.db.close();
  }
}
