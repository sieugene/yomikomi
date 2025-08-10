import { DictionaryTemplate } from "../types/types";


export const CUSTOM_FN_EXAMPLE = `function parseMeanings(rawContent) {
  // Your parsing logic here
  return Array.isArray(rawContent) ? rawContent : [];
}
return parseMeanings(rawContent);
`

const BASE_SQL_QUERY = `
SELECT
  DISTINCT *
FROM
  terms
WHERE
  "0" = ?
  OR "0" LIKE ? || '%'
  OR "0" LIKE '%' || ? || '%'
ORDER BY
  CASE
    WHEN "0" = ? THEN 1
    WHEN "0" LIKE ? || '%' THEN 2
    ELSE 3
  END,
  length("0") DESC
LIMIT
  ?
`;

export const DICTIONARY_TEMPLATES: Record<string, DictionaryTemplate> = {
  jmdict_en: {
    id: "jmdict_en",
    name: "JMdict English",
    language: "en",
    description: "Standard JMdict English dictionary format",
    example: `
Word: 日本語 (nihongo)
Type: noun
Meanings: Japanese language, Japanese
    `,
    config: {
      name: "JMdict English Parser",
      version: "1.0.0",
      sqlQuery: BASE_SQL_QUERY,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: {
        type: "custom",
        customFunction: `
          function parseMeanings(rawContent) {
            try {
              if (Array.isArray(rawContent)) return rawContent;
              const structured = JSON.parse(rawContent);
              const meanings = [];
              for (const block of structured) {
                if (block.type === 'structured-content') {
                  const roots = Array.isArray(block.content) ? block.content : [block.content];
                  for (const root of roots) {
                    meanings.push(...extractLiMeanings(root));
                  }
                }
              }
              return meanings;
            } catch { return []; }
          }
          function extractLiMeanings(node) {
            const result = [];
            if (node.tag === 'ul' && node.data?.content === 'glossary') {
              const items = Array.isArray(node.content) ? node.content : [node.content];
              for (const li of items) {
                if (typeof li === 'object' && li.tag === 'li' && typeof li.content === 'string') {
                  result.push(li.content);
                }
              }
            }
            const children = Array.isArray(node.content) ? node.content : [node.content];
            for (const child of children) {
              if (typeof child === 'object' && child !== null) {
                result.push(...extractLiMeanings(child));
              }
            }
            return result;
          }
          return parseMeanings(rawContent);
        `,
      },
      searchStrategy: { type: "partial", includeSubstrings: true },
    },
  },
  jmdict_ru: {
    id: "jmdict_ru",
    name: "JMdict Russian",
    language: "ru",
    description: "Standard JMdict Russian dictionary format",
    example: `
Слово: 日本語 (нихонго)
Тип: существительное
Значения: японский язык
    `,
    config: {
      name: "JMdict Russian Parser",
      version: "1.0.0",
      sqlQuery: BASE_SQL_QUERY,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: { type: "string" },
      searchStrategy: { type: "partial", includeSubstrings: true },
    },
  },
};

export const SEARCH_LIMITS = {
  FAST_MODE: {
    MAX_TOKENS: 10,
    MAX_RESULTS_PER_TOKEN: 15,
    MAX_TOTAL_RESULTS: 50,
    MAX_SUBSTRINGS: 3,
  },
  DEEP_MODE: {
    MAX_TOKENS: 25,
    MAX_RESULTS_PER_TOKEN: 30,
    MAX_TOTAL_RESULTS: 150,
    MAX_SUBSTRINGS: 8,
  },
} as const;
