import { DictionaryParserConfig } from "@features/dictionary/types";

export const CUSTOM_FN_EXAMPLE = `// Return string[]
function parseMeanings(rawContent) {
  // Your parsing logic here
  return Array.isArray(rawContent) ? rawContent : [];
}
return parseMeanings(rawContent);
`;

export const DEFAULT_CONFIG: DictionaryParserConfig = {
  name: "Custom Parser",
  version: "1.0.0",
  sqlQuery: `
SELECT DISTINCT * FROM terms 
WHERE "0" = ? 
ORDER BY length("0") DESC 
LIMIT 20
  `.trim(),
  columnMapping: {
    word: 0,
    reading: 1,
    type: 2,
    meanings: 5,
  },
  meaningParser: {
    type: "array",
    customFunction: CUSTOM_FN_EXAMPLE,
  },
  searchStrategy: {
    type: "exact",
  },
};
