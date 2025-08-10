import { useState, useCallback, useMemo } from "react";
import { useTokenizer } from "./useTokenizerOptimized";
import { useDictionarySearch } from "./useDictionarySearch";
import { SearchOptions, SearchResult } from "../types/types";

interface DictionaryLookupState {
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  searchStats: {
    searchTime: number;
    resultCount: number;
    uniqueWords: number;
  } | null;
}

interface UseDictionaryLookupReturn extends DictionaryLookupState {
  performSearch: (token: string, options: SearchOptions) => Promise<void>;
  clearResults: () => void;
  groupedResults: Array<{
    word: string;
    results: SearchResult[];
  }>;
}

export const useDictionaryLookup = (): UseDictionaryLookupReturn => {
  const { tokenizeText, isReady: tokenizerReady } = useTokenizer();
  const { searchSingleToken, isInitialized: searchReady } =
    useDictionarySearch();

  const [state, setState] = useState<DictionaryLookupState>({
    searchResults: [],
    loading: false,
    error: null,
    searchStats: null,
  });

  const performSearch = useCallback(
    async (token: string, options: SearchOptions) => {
      if (!tokenizerReady || !searchReady) {
        setState((prev) => ({
          ...prev,
          error: "Dictionary system not ready",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const searchStartTime = performance.now();
        const results = await searchSingleToken(token, options);
        const searchTime = performance.now() - searchStartTime;

        const uniqueWords = new Set(results.map((r) => r.word)).size;

        setState((prev) => ({
          ...prev,
          searchResults: results,
          loading: false,
          searchStats: {
            searchTime,
            resultCount: results.length,
            uniqueWords,
          },
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Search failed";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          searchResults: [],
        }));
      }
    },
    [tokenizerReady, searchReady, searchSingleToken]
  );

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchResults: [],
      error: null,
      searchStats: null,
    }));
  }, []);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, SearchResult[]>();

    for (const result of state.searchResults) {
      const key = result.word;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(result);
    }

    return Array.from(groups.entries())
      .map(([word, results]) => ({
        word,
        results: results.sort((a, b) => b.relevanceScore - a.relevanceScore),
      }))
      .sort((a, b) => {
        // Сортируем группы по максимальному скору релевантности
        const maxScoreA = Math.max(...a.results.map((r) => r.relevanceScore));
        const maxScoreB = Math.max(...b.results.map((r) => r.relevanceScore));
        return maxScoreB - maxScoreA;
      });
  }, [state.searchResults]);

  return {
    ...state,
    performSearch,
    clearResults,
    groupedResults,
  };
};
