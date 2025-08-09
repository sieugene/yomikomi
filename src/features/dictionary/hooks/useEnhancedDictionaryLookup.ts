import { useEffect, useState, useMemo } from "react";
import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import { useDictionaryManager } from "./useDictionaryManager";
import { useTokenizer } from "./useTokenizer";
import { DictionarySearchEngine } from "../model/DictionarySearchEngine";
import { DictionaryEntry } from "../types/dictionary.types";

interface SearchResult extends DictionaryEntry {
  source: string;
  relevanceScore: number;
}

export const useEnhancedDictionaryLookup = (sentence: string) => {
  const { sqlClient } = useSqlJs();
  const tokenizer = useTokenizer();
  const { dictionaries, getDictionary } = useDictionaryManager();

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [deepSearchMode, setDeepSearchMode] = useState(false);
  const [searchEngines, setSearchEngines] = useState<
    Map<string, DictionarySearchEngine>
  >(new Map());

  useEffect(() => {
    if (!sqlClient) return;

    const init = async () => {
      const active = dictionaries.filter((d) => d.status === "active");
      const engines = new Map<string, DictionarySearchEngine>();

      for (const dict of active) {
        try {
          const storedDict = await getDictionary(dict.id);
          if (!storedDict) continue;

          const arrayBuffer = await storedDict.content.arrayBuffer();
          const config =
            dict.customParser ||
            (dict.parserTemplate !== "custom"
              ? getDefaultConfig(dict.parserTemplate)
              : null);

          if (config) {
            engines.set(
              dict.id,
              new DictionarySearchEngine(sqlClient, arrayBuffer, config)
            );
          }
        } catch (err) {
          console.warn(`Failed to init search engine for ${dict.name}:`, err);
        }
      }

      setSearchEngines(engines);
    };

    init();

    return () => {
      searchEngines.forEach((engine) => engine.close());
    };
  }, [dictionaries, sqlClient]);

  useEffect(() => {
    let cancelled = false;

    const performSearch = async () => {
      if (!sentence.trim() || !tokenizer || searchEngines.size === 0) {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      try {
        const tokens = tokenizer.tokenize(sentence);
        // Используем разные стратегии в зависимости от режима
        const searchTerms = deepSearchMode
          ? getDeepSearchTerms(tokens)
          : getSimplifiedSearchTerms(tokens);

        const allResults: SearchResult[] = [];

        for (const [dictId, engine] of searchEngines.entries()) {
          if (cancelled) break;

          try {
            const dictInfo = dictionaries.find((d) => d.id === dictId);
            const results = engine.search(searchTerms, deepSearchMode);
            const enriched = results.map((r) => ({
              ...r,
              source: dictInfo?.name || "Unknown",
              relevanceScore: calculateRelevance(r, searchTerms),
            }));
            allResults.push(...enriched);

            // Прерываем между поисками, чтобы не блокировать UI
            await new Promise((res) => setTimeout(res, 0));
          } catch (err) {
            console.warn(`Search error in dictionary ${dictId}:`, err);
          }
        }

        if (cancelled) return;

        // Лимиты зависят от режима поиска
        const maxResults = deepSearchMode ? 100 : 30;
        // TODO
        // const uniqueResults = removeDuplicates(allResults)
        //   .sort((a, b) => b.relevanceScore - a.relevanceScore)
        //   .slice(0, maxResults);

        setSearchResults(allResults);
      } catch (err) {
        console.error("Dictionary lookup error:", err);
        setSearchResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Разный debounce для разных режимов
    const debounceTime = deepSearchMode ? 500 : 300;
    const debounceTimer = setTimeout(performSearch, debounceTime);
    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [sentence, tokenizer, searchEngines, dictionaries, deepSearchMode]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, SearchResult[]>();

    for (const result of searchResults) {
      const key = result.word;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(result);
    }

    return Array.from(groups.entries())
      .map(([word, results]) => ({
        word,
        results: results.sort((a, b) => b.relevanceScore - a.relevanceScore),
      }))
      .slice(0, deepSearchMode ? 25 : 15); // Больше групп в глубоком режиме
  }, [searchResults, deepSearchMode]);

  const toggleDeepSearch = () => {
    setDeepSearchMode(!deepSearchMode);
  };

  return {
    searchResults,
    groupedResults,
    loading,
    deepSearchMode,
    toggleDeepSearch,
    activeEngines: searchEngines.size,
    totalDictionaries: dictionaries.length,
    activeDictionaries: dictionaries.filter((d) => d.status === "active")
      .length,
  };
};

// УПРОЩЕННАЯ функция генерации поисковых терминов (быстрый режим)
function getSimplifiedSearchTerms(tokens: any[]): string[] {
  const terms = new Set<string>();

  for (const token of tokens) {
    const { surface_form: surface, basic_form: basic } = token;

    // Добавляем только основные формы
    if (basic && basic.length > 0) {
      terms.add(basic);
    }
    if (surface && surface !== basic && surface.length > 0) {
      terms.add(surface);
    }

    // Останавливаемся на 10 терминах
    if (terms.size >= 10) break;
  }

  return Array.from(terms);
}

// РАСШИРЕННАЯ функция для глубокого поиска
function getDeepSearchTerms(tokens: any[]): string[] {
  const terms = new Set<string>();

  for (const token of tokens) {
    const { surface_form: surface, basic_form: basic, reading } = token;

    // Добавляем все формы
    if (basic) terms.add(basic);
    if (surface && surface !== basic) terms.add(surface);
    if (reading && reading !== basic && reading !== surface) {
      terms.add(reading);
    }

    // Добавляем частичные совпадения для длинных слов
    if (surface && surface.length > 2 && surface.length <= 8) {
      for (let i = surface.length - 1; i > 1; i--) {
        terms.add(surface.substring(0, i));
      }
    }

    // Останавливаемся на 25 терминах в глубоком режиме
    if (terms.size >= 25) break;
  }

  return Array.from(terms);
}

function calculateRelevance(result: DictionaryEntry, searchTerms: string[]) {
  let score = 0;

  // Точное совпадение
  if (searchTerms.includes(result.word)) score += 100;

  // Длина слова (длинные слова более специфичны)
  score += result.word.length * 2;

  // Количество значений (но не более 5 баллов)
  score += Math.min(result.meanings.length, 5);

  // Небольшой штраф за односимвольные слова
  if (result.word.length === 1) score -= 10;

  return score;
}

function removeDuplicates(results: SearchResult[]) {
  const seen = new Map<string, SearchResult>();
  for (const result of results) {
    const key = `${result.word}-${result.reading}`;
    const existing = seen.get(key);
    if (!existing || result.relevanceScore > existing.relevanceScore) {
      seen.set(key, result);
    }
  }
  return Array.from(seen.values());
}

function getDefaultConfig(templateId: string) {
  const configs = {
    jmdict_en: {
      name: "JMdict English Parser",
      version: "1.0.0",
      // УПРОЩЕННЫЙ SQL запрос
      sqlQuery: `
        SELECT DISTINCT t.* 
        FROM terms t
        WHERE t."0" = ?
        ORDER BY length(t."0") DESC
        LIMIT 10
      `,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: {
        type: "custom" as const,
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
            } catch {
              return [];
            }
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
      searchStrategy: { type: "exact" as const }, // Упростили до точного поиска
    },
    jmdict_ru: {
      name: "JMdict Russian Parser",
      version: "1.0.0",
      // УПРОЩЕННЫЙ SQL запрос
      sqlQuery: `
        SELECT DISTINCT t.* 
        FROM terms t
        WHERE t."0" = ?
        ORDER BY length(t."0") DESC
        LIMIT 10
      `,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: { type: "array" as const },
      searchStrategy: { type: "exact" as const }, // Упростили до точного поиска
    },
  };
  return configs[templateId] || null;
}
