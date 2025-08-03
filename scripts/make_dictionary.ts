import AdmZip from "adm-zip";
import { writeFileSync } from "fs";
import path from "path";
import initSqlJs from "sql.js";

const args = process.argv.slice(2);
const fileArg = args.find((arg) => arg.startsWith("-file="));

if (!fileArg) {
  console.error(
    '❌ Error: Please provide a file path using -file="path_to_file".'
  );
  process.exit(1);
}

const DICTIONARY_NAME = fileArg.split("=")[1];

const SOURCE_DIR = path.join(__dirname, "../src/shared/data/dict/JMdict");
const ZIP_FILE = path.join(SOURCE_DIR, `${DICTIONARY_NAME}.zip`);
const OUTPUT_JSON_FILE = path.join(
  SOURCE_DIR,
  `combined_terms_${DICTIONARY_NAME}.json`
);
const OUTPUT_SQLITE_FILE = path.join(
  SOURCE_DIR,
  `combined_terms_${DICTIONARY_NAME}.sqlite`
);

// Step 1: Unzip and combine JSON
const zip = new AdmZip(ZIP_FILE);
const zipEntries = zip.getEntries();

let combined: any[] = [];

zipEntries.forEach((entry) => {
  if (
    entry.entryName.startsWith("term_bank_") &&
    entry.entryName.endsWith(".json")
  ) {
    console.log(`Processing: ${entry.entryName}`);
    const content = entry.getData().toString("utf-8");
    const data = JSON.parse(content);
    combined = combined.concat(data);
  }
});

writeFileSync(OUTPUT_JSON_FILE, JSON.stringify(combined, null, 2));
console.log(`✅ Combined JSON created! Total entries: ${combined.length}`);

// Step 2: Convert to SQLite
(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const sample = combined[0];
  if (!sample || typeof sample !== "object") {
    console.error("❌ No valid sample data to create schema.");
    return;
  }

  const keys = Object.keys(sample);
  const quotedKeys = keys.map((k) => `"${k}"`);
  const columns = quotedKeys.map((k) => `${k} TEXT`).join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  const insertSql = `INSERT INTO terms (${quotedKeys.join(
    ", "
  )}) VALUES (${placeholders})`;

  db.run(`CREATE TABLE terms (${columns});`);
  const stmt = db.prepare(insertSql);

  for (const item of combined) {
    const row = keys.map((k) => {
      const val = item[k];
      return typeof val === "object" ? JSON.stringify(val) : val ?? null;
    });
    stmt.run(row);
  }
  stmt.free();

  const binaryArray = db.export();
  writeFileSync(OUTPUT_SQLITE_FILE, Buffer.from(binaryArray));
  console.log(`✅ SQLite DB created: ${OUTPUT_SQLITE_FILE}`);
})();
