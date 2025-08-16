import { useTokenizer } from "@/features/tokenizer/hooks/useTokenizer";
import { SearchOptions, SearchResult } from "../types";
import { useSearchCore } from "./useSearchCore";
import { useCallback, useMemo, useState } from "react";
import { useStoreDictionarySearchSettings } from "../context/DictionarySearchSettingsContext";
import { SEARCH_LIMITS } from "../lib/constants";

export type PerfrormSearchResult = {
  results: SearchResult[];
  searchStats: {
    searchTime: number;
    resultCount: number;
    uniqueWords: number;
  } | null;
  groupedResults: {
    word: string;
    results: SearchResult[];
  }[];
};

function groupResults(
  searchResults: SearchResult[]
): PerfrormSearchResult["groupedResults"] {
  const groups = new Map<string, SearchResult[]>();

  for (const result of searchResults) {
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
}

export const useDictionarySearch = () => {
  const { deepSearchMode } = useStoreDictionarySearchSettings();
  const { inited, coordinator } = useSearchCore();
  const { isReady: tokenizerReady } = useTokenizer();

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

  const performSearch = async (
    token: string
  ): Promise<PerfrormSearchResult> => {
    if (!tokenizerReady || !inited) {
      throw new Error("Dictionary system not ready");
    }

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

      return {
        results,
        searchStats: {
          searchTime,
          resultCount: results.length,
          uniqueWords,
        },
        groupedResults: groupResults(results),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Search failed";
      throw new Error(errorMessage);
    }
  };

  return {
    performSearch,
  };
};
