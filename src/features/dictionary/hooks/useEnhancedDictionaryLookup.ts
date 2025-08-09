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
        const searchTerms = generateSearchTerms(tokens);
        const allResults: SearchResult[] = [];

        for (const [dictId, engine] of searchEngines.entries()) {
          try {
            const dictInfo = dictionaries.find((d) => d.id === dictId);
            const results = engine.search(searchTerms);
            const enriched = results.map((r) => ({
              ...r,
              source: dictInfo?.name || "Unknown",
              relevanceScore: calculateRelevance(r, searchTerms),
            }));
            allResults.push(...enriched);
            await new Promise((res) => setTimeout(res, 0));
          } catch (err) {
            console.warn(`Search error in dictionary ${dictId}:`, err);
          }
        }

        if (cancelled) return;

        // const uniqueResults = removeDuplicates(allResults)
        //   .sort((a, b) => b.relevanceScore - a.relevanceScore)
        //   .slice(0, 50);

        setSearchResults(allResults);
      } catch (err) {
        console.error("Dictionary lookup error:", err);
        setSearchResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 200);
    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [sentence, tokenizer, searchEngines, dictionaries]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, SearchResult[]>();

    for (const result of searchResults) {
      const key = result.word;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(result);
    }

    return Array.from(groups.entries()).map(([word, results]) => ({
      word,
      results: results.sort((a, b) => b.relevanceScore - a.relevanceScore),
    }));
  }, [searchResults]);

  return {
    searchResults,
    groupedResults,
    loading,
    activeEngines: searchEngines.size,
    totalDictionaries: dictionaries.length,
    activeDictionaries: dictionaries.filter((d) => d.status === "active")
      .length,
  };
};

function generateSearchTerms(tokens: any[]): string[] {
  const terms = new Set<string>();

  for (const token of tokens) {
    const { surface_form: surface, basic_form: basic, reading } = token;
    if (surface) terms.add(surface);
    if (basic) terms.add(basic);
    if (reading) terms.add(reading);

    if (surface && surface.length > 1 && surface.length <= 10) {
      for (let i = surface.length - 1; i > 0; i--) {
        terms.add(surface.substring(0, i));
      }
    }
  }

  // TODO !
  return Array.from(terms).slice(0, 300);
}

function calculateRelevance(result: DictionaryEntry, searchTerms: string[]) {
  let score = 0;
  if (searchTerms.includes(result.word)) score += 100;
  score += result.word.length * 2;
  score += Math.min(result.meanings.length, 5);
  if (result.word.length === 1) score -= 20;
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
      sqlQuery: `
        SELECT DISTINCT t.* 
        FROM terms t
        WHERE t."0" = ? OR t."0" LIKE ? || '%'
        ORDER BY length(t."0") DESC
        LIMIT 20
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
      searchStrategy: { type: "partial" as const, includeSubstrings: true },
    },
    jmdict_ru: {
      name: "JMdict Russian Parser",
      version: "1.0.0",
      sqlQuery: `
        SELECT DISTINCT t.* 
        FROM terms t
        WHERE t."0" = ? OR t."0" LIKE ? || '%'
        ORDER BY length(t."0") DESC
        LIMIT 20
      `,
      columnMapping: { word: 0, reading: 1, type: 2, meanings: 5 },
      meaningParser: { type: "array" as const },
      searchStrategy: { type: "partial" as const, includeSubstrings: true },
    },
  };
  return configs[templateId] || null;
}
