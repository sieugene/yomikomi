import type { Database } from "sql.js";

export function termsSelectSqlQuery<GlossaryEntry>(
  tokens: string[],
  db: Database
) {
  const placeholders = tokens.map(() => "?").join(",");
  const stmt = db.prepare(`SELECT * FROM terms WHERE "0" IN (${placeholders})`);
  stmt.bind(tokens);
  const results: GlossaryEntry[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject() as unknown as {};
    if (row) {
      results.push(Object.values(row) as GlossaryEntry);
    }
  }
  stmt.free();
  return results;
}
