import AdmZip from "adm-zip";
import { writeFileSync } from "fs";
import path from "path";

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
const OUTPUT_FILE = path.join(
  SOURCE_DIR,
  `combined_terms_${DICTIONARY_NAME}.json`
);

const zip = new AdmZip(ZIP_FILE);
const zipEntries = zip.getEntries();

let combined: any = [];

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

writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2));
console.log(`✅ Combined JSON created! Total entries: ${combined.length}`);
