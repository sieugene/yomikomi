import { useState } from "react";
import { useStoreDictionarySearchSettings } from "../context/DictionarySearchSettingsContext";
import { SEARCH_LIMITS } from "../lib/constants";
import { SearchOptions, SearchResult } from "../types";
import { useSearchCore } from "./useSearchCore";

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

const DEFAULT_PERFORMED_RESULT: PerfrormSearchResult = {
  groupedResults: [],
  results: [],
  searchStats: null,
};

export const useDictionarySearch = () => {
  const { deepSearchMode } = useStoreDictionarySearchSettings();
  const { inited, coordinator } = useSearchCore();
  const [lazyPerfomedResults, setLazyPerfomedResults] =
    useState<PerfrormSearchResult>(DEFAULT_PERFORMED_RESULT);

  const searchSingleToken = (token: string, options: SearchOptions) => {
    if (!inited) {
      console.warn("Search coordinator not initialized");
      return [];
    }
    return coordinator!.searchSingleToken(token, options);
  };

  const performSearch = async (token: string) => {
    if (!inited) throw new Error("Dictionary system not ready");

    setLazyPerfomedResults(DEFAULT_PERFORMED_RESULT);

    const searchOptions: SearchOptions = {
      deepMode: deepSearchMode,
      maxResults: deepSearchMode
        ? SEARCH_LIMITS.DEEP_MODE.MAX_TOTAL_RESULTS
        : SEARCH_LIMITS.FAST_MODE.MAX_TOTAL_RESULTS,
      includePartialMatches: true,
      includeSubstrings: deepSearchMode,
    };

    const searchStartTime = performance.now();
    const tasks = searchSingleToken(token, searchOptions);

    let collectedResults: SearchResult[] = [];

    for (const task of tasks) {
      const result = await task();

      collectedResults = [...collectedResults, ...result];

      setLazyPerfomedResults((prev) => {
        const groupedResults = groupResults(collectedResults);
        const searchTime =
          performance.now() -
          searchStartTime +
          (prev.searchStats?.searchTime || 0);
        const uniqueWords = new Set(collectedResults.map((r) => r.word)).size;

        return {
          results: collectedResults,
          searchStats: {
            searchTime,
            resultCount: collectedResults.length,
            uniqueWords,
          },
          groupedResults,
        };
      });

      await new Promise((r) => setTimeout(r, 0));
    }
  };

  return {
    performSearch,
    lazyPerfomedResults,
  };
};
