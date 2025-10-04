import { DictionaryTemplate } from "../types";

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

const KANJI_SQL_QUERY = `
SELECT DISTINCT *
FROM terms
WHERE
  CAST("0" AS TEXT) = CAST(? AS TEXT)                -- kanji exact match
  OR CAST("1" AS TEXT) LIKE '%' || ? || '%'         -- onyomi search
  OR CAST("2" AS TEXT) LIKE '%' || ? || '%'         -- hiragana search
ORDER BY
  CASE
    WHEN CAST("0" AS TEXT) = CAST(? AS TEXT) THEN 1  -- exact kanji match
    WHEN CAST("1" AS TEXT) LIKE '%' || ? || '%' THEN 2
  END
LIMIT ?
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
  kanji_dict: {
    id: "kanji_dict",
    name: "Kanji Dictionary",
    language: "en",
    description: "Kanji dictionary with character-based search and metadata",
    dictionaryType: "kanji",
    example: `
Kanji: 辞
Reading: ジ (や.める いな.む)
Grade: Jouyou
Meanings: resign, word, term, expression
Metadata: strokes: 13, freq: 633
  `,
    config: {
      name: "Kanji Dictionary Parser",
      version: "1.0.0",
      sqlQuery: KANJI_SQL_QUERY,
      columnMapping: {
        word: 0, // '辞'
        reading: 1, // 'ジ'
        type: 2, // 'や.める いな.む'
        meanings: 4, // '["resign","word","term","expression"]'
        metadata: 5, // '{"deroo":"2255","strokes":"13",...}'
      },
      meaningParser: {
        type: "custom",
        customFunction: `
        function parseKanjiMeanings(rawContent) {
          try {
            if (Array.isArray(rawContent)) {
              return rawContent;
            }
            
            if (typeof rawContent === 'string') {
              try {
                const parsed = JSON.parse(rawContent);
                if (Array.isArray(parsed)) {
                  return parsed;
                }
              } catch (e) {
                return [rawContent];
              }
            }
            
            return [];
          } catch (error) {
            console.warn('Kanji meanings parser error:', error);
            return [];
          }
        }
        return parseKanjiMeanings(rawContent);
      `,
      },
      searchStrategy: {
        type: "partial",
        includeSubstrings: true,
        searchByCharacter: true,
      },
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
  jmdict_dutch: {
    id: "jmdict_nl",
    name: "JMdict Dutch",
    language: "nl",
    description: "Standard JMdict Dutch dictionary format",
    example: `
Woord: 日本語 (nihongo)
Type: zelfstandig naamwoord
Betekenissen: Japanse taal
  `,
    config: {
      name: "JMdict Dutch Parser",
      version: "1.0.0",
      sqlQuery: BASE_SQL_QUERY,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: { type: "string" },
      searchStrategy: { type: "partial", includeSubstrings: true },
    },
  },
  jmdict_spanish: {
    id: "jmdict_es",
    name: "JMdict Spanish",
    language: "es",
    description: "Standard JMdict Spanish dictionary format",
    example: `
Palabra: 日本語 (nihongo)
Tipo: sustantivo
Significados: idioma japonés
  `,
    config: {
      name: "JMdict Spanish Parser",
      version: "1.0.0",
      sqlQuery: BASE_SQL_QUERY,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: { type: "string" },
      searchStrategy: { type: "partial", includeSubstrings: true },
    },
  },
};
