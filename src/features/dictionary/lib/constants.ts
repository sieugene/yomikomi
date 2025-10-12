import { DictionaryTemplate } from "../types";

const BASE_SQL_QUERY = `
SELECT DISTINCT *
FROM terms
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
LIMIT ?;
`;

const KANJI_SQL_QUERY = `
SELECT DISTINCT *
FROM terms
WHERE
  CAST("0" AS TEXT) = CAST(? AS TEXT)                -- exact kanji match
  OR CAST("1" AS TEXT) LIKE '%' || ? || '%'          -- onyomi search
  OR CAST("2" AS TEXT) LIKE '%' || ? || '%'          -- kunyomi search
ORDER BY
  CASE
    WHEN CAST("0" AS TEXT) = CAST(? AS TEXT) THEN 1
    WHEN CAST("1" AS TEXT) LIKE '%' || ? || '%' THEN 2
    ELSE 3
  END
LIMIT ?;
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
      searchStrategy: {
        type: "partial",
        includeSubstrings: true,
        columnsForSearch: [0, 1], // ✅ word + reading
      },
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
        word: 0,
        reading: 1,
        type: 2,
        meanings: 4,
        metadata: 5,
      },
      meaningParser: {
        type: "custom",
        customFunction: `
          function parseKanjiMeanings(rawContent) {
            try {
              if (Array.isArray(rawContent)) return rawContent;
              if (typeof rawContent === 'string') {
                try {
                  const parsed = JSON.parse(rawContent);
                  if (Array.isArray(parsed)) return parsed;
                } catch {
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
        columnsForSearch: [0, 1, 2], // ✅ kanji, onyomi, kunyomi
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
      searchStrategy: {
        type: "partial",
        includeSubstrings: true,
        columnsForSearch: [0, 1],
      },
    },
  },

  nyars: {
    id: "nyars",
    name: "Nyars Dictionary (Russian)",
    language: "ru",
    description:
      "Nyars Japanese-Russian dictionary with structured content format",
    example: `
Word: 金環日食 (きんかんにっしょく)
Type: сущ.
Meanings: кольцеобразное солнечное затмение
  `,
    config: {
      name: "Nyars Dictionary Parser",
      version: "1.0.0",
      sqlQuery: BASE_SQL_QUERY,
      columnMapping: {
        word: 0, // 金環日食
        reading: 1, // きんかんにっしょく
        type: 2, // сущ.
        meanings: 5, // JSON структура с meanings
      },
      meaningParser: {
        type: "custom",
        customFunction: `
        function parseNyarsMeanings(rawContent) {
          try {
            // Парсим JSON если это строка
            const structured = typeof rawContent === 'string' 
              ? JSON.parse(rawContent) 
              : rawContent;
            
            const meanings = [];
            
            // Обрабатываем массив элементов
            if (Array.isArray(structured)) {
              for (const item of structured) {
                // Structured content формат
                if (item && item.type === 'structured-content' && item.content) {
                  meanings.push(...extractFromStructuredContent(item.content));
                }
              }
            }
            
            // Убираем дубликаты и пустые строки
            return [...new Set(meanings.filter(m => m && m.trim()))];
          } catch (error) {
            console.warn('Nyars parser error:', error);
            return [];
          }
        }
        
        function extractFromStructuredContent(content) {
          const results = [];
          if (!content) return results;
          
          const items = Array.isArray(content) ? content : [content];
          
          for (const item of items) {
            // Обработка ul с data.content === "glossary"
            if (item && item.tag === 'ul' && item.data?.content === 'glossary') {
              const liItems = Array.isArray(item.content) ? item.content : [item.content];
              
              // Обрабатываем каждый li элемент
              for (const li of liItems) {
                if (li && li.tag === 'li') {
                  const text = extractTextFromNode(li.content);
                  if (text) results.push(text);
                }
              }
            }
          }
          
          return results;
        }
        
        function extractTextFromNode(node) {
          if (!node) return '';
          
          // Простая строка
          if (typeof node === 'string') {
            return node.trim();
          }
          
          // Массив нод
          if (Array.isArray(node)) {
            return node.map(n => extractTextFromNode(n)).filter(Boolean).join(' ');
          }
          
          // Объект с content
          if (typeof node === 'object' && node.content) {
            // Span с несколькими content элементами
            if (node.tag === 'span') {
              if (Array.isArray(node.content)) {
                const texts = [];
                for (const child of node.content) {
                  // Пропускаем серые метки (разговорное, ономатопея и т.д.)
                  if (child && child.style?.color === '#71717b') continue;
                  // Пропускаем зеленые метки (муз., выч. и т.д.)
                  if (child && child.style?.color === '#5ea500') continue;
                  
                  const text = extractTextFromNode(child);
                  if (text) texts.push(text);
                }
                return texts.join(' ').trim();
              }
              return extractTextFromNode(node.content);
            }
            
            return extractTextFromNode(node.content);
          }
          
          return '';
        }
        
        return parseNyarsMeanings(rawContent);
      `,
      },
      searchStrategy: {
        type: "partial",
        includeSubstrings: true,
        columnsForSearch: [0, 1], // word + reading
      },
    },
  },

  jmdict_nl: {
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
      searchStrategy: {
        type: "partial",
        includeSubstrings: true,
        columnsForSearch: [0, 1],
      },
    },
  },

  jmdict_es: {
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
      searchStrategy: {
        type: "partial",
        includeSubstrings: true,
        columnsForSearch: [0, 1],
      },
    },
  },
};
