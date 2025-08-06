import type { Database, SqlJsStatic } from "sql.js";
import { DictionaryEntry } from "../../types";

export class DictionaryLookup {
  private readonly db: Database;
  constructor(
    private readonly dictionaryName: string,
    dbFile: ArrayBuffer,
    private readonly sqlClient: SqlJsStatic
  ) {
    this.db = new sqlClient.Database(new Uint8Array(dbFile));
  }

  public find(tokenizedWords: string[]): string[] {
    const placeholders = tokenizedWords.map(() => "?").join(",");
    const stmt = this.db.prepare(
      `SELECT * FROM terms WHERE "0" IN (${placeholders})`
    );
    stmt.bind(tokenizedWords);
    const results: any[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject() as unknown as string[];
      results.push(row);
    }
    stmt.free();
    return results;
  }
}
