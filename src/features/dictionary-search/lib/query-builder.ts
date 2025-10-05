export function buildMultiColumnQuery(
  columns: number[],
  partial = true
): { sql: string; paramCountPerColumn: number } {
  // for partial === true we bind 3 params per column for the conditions
  // (equals, starts-with, contains). For ordering CASE we bind 1 equality
  // param per column.
  const condForCol = (c: number) =>
    partial
      ? `CAST("${c}" AS TEXT) = CAST(? AS TEXT) OR CAST("${c}" AS TEXT) LIKE ? || '%' OR CAST("${c}" AS TEXT) LIKE '%' || ? || '%'`
      : `CAST("${c}" AS TEXT) = CAST(? AS TEXT)`;

  const where = columns.map((c) => `(${condForCol(c)})`).join(" OR ");

  // CASE: check equality for any column
  const caseWhen = columns
    .map((c) => `CAST("${c}" AS TEXT) = CAST(? AS TEXT)`)
    .join(" OR ");

  const sql = `
SELECT DISTINCT * FROM terms
WHERE ${where}
ORDER BY
  CASE WHEN (${caseWhen}) THEN 1 ELSE 2 END,
  length(CAST("${columns[0]}" AS TEXT)) DESC
LIMIT ?;`;

  return { sql, paramCountPerColumn: partial ? 3 : 1 };
}
