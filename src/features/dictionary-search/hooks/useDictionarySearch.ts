import { useTokenizer } from "@/features/tokenizer/hooks/useTokenizer";
import { SearchOptions, SearchResult } from "../types";
import { useSearchCore } from "./useSearchCore";
import { useCallback, useMemo, useState } from "react";
import { useStoreDictionarySearchSettings } from "../context/DictionarySearchSettingsContext";
import { SEARCH_LIMITS } from "../lib/constants";

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
  performSearch: (token: string) => Promise<void>;
  clearResults: () => void;
  groupedResults: Array<{
    word: string;
    results: SearchResult[];
  }>;
}

export const useDictionarySearch = (): UseDictionaryLookupReturn => {
  const { deepSearchMode } = useStoreDictionarySearchSettings();
  const { inited, coordinator } = useSearchCore();
  const { isReady: tokenizerReady } = useTokenizer();

  const [state, setState] = useState<DictionaryLookupState>({
    searchResults: [],
    loading: false,
    error: null,
    searchStats: null,
  });

  const searchSingleToken = async (
    token: string,
    options: SearchOptions
  ): Promise<SearchResult[]> => {
    if (!inited) {
      console.warn("Search coordinator not initialized");
      return [];
    }

    const results = await coordinator?.searchSingleToken(token, options);
    return results || [];
  };

  const performSearch = async (token: string) => {
    if (!tokenizerReady || !inited) {
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
      const searchOptions: SearchOptions = {
        deepMode: deepSearchMode,
        maxResults: deepSearchMode
          ? SEARCH_LIMITS.DEEP_MODE.MAX_TOTAL_RESULTS
          : SEARCH_LIMITS.FAST_MODE.MAX_TOTAL_RESULTS,
        includePartialMatches: true,
        includeSubstrings: deepSearchMode,
      };
      const searchStartTime = performance.now();
      const results = await searchSingleToken(token, searchOptions);
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
  };

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
