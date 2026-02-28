import { useState } from "react";
import { useStoreDictionarySearch } from "../context/DictionarySearchContext";
import { SEARCH_LIMITS } from "../lib/constants";
import { SearchOptions, SearchResult } from "../types";
import { useSWRCache } from "@/shared/hooks/useSWRCache";

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
  searchResults: SearchResult[],
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

const GET_KEY = (token: string, deepMode: boolean) =>
  `dictionary-search:${token}:${deepMode ? "deep" : "fast"}`;

export const useDictionarySearch = () => {
  const { getCache, setCache } = useSWRCache<PerfrormSearchResult>();

  const { deepSearchMode, getCore } = useStoreDictionarySearch();
  const [lazyPerfomedResults, setLazyPerfomedResults] =
    useState<PerfrormSearchResult>(DEFAULT_PERFORMED_RESULT);

  const searchSingleToken = async (token: string, options: SearchOptions) => {
    const core = await getCore();
    if (!core.coordinator) {
      console.warn("Search coordinator not initialized");
      return [];
    }
    return core.coordinator!.searchSingleToken(token, options);
  };

  const performSearch = async (token: string) => {
    setLazyPerfomedResults(DEFAULT_PERFORMED_RESULT);

    const searchOptions: SearchOptions = {
      deepMode: deepSearchMode,
      maxResults: deepSearchMode
        ? SEARCH_LIMITS.DEEP_MODE.MAX_TOTAL_RESULTS
        : SEARCH_LIMITS.FAST_MODE.MAX_TOTAL_RESULTS,
      includePartialMatches: true,
      includeSubstrings: deepSearchMode,
    };
    const cached = getCache(GET_KEY(token, deepSearchMode));
    if (cached) {
      setLazyPerfomedResults(cached);
      return;
    }

    const searchStartTime = performance.now();
    const tasks = await searchSingleToken(token, searchOptions);

    let collectedResults: SearchResult[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const isLast = i === tasks.length - 1;
      const result = await task();

      collectedResults = [...collectedResults, ...result];

      setLazyPerfomedResults((prev) => {
        const groupedResults = groupResults(collectedResults);
        const searchTime =
          performance.now() -
          searchStartTime +
          (prev.searchStats?.searchTime || 0);
        const uniqueWords = new Set(collectedResults.map((r) => r.word)).size;
        const next = {
          results: collectedResults,
          searchStats: {
            searchTime,
            resultCount: collectedResults.length,
            uniqueWords,
          },
          groupedResults,
        };
        if (isLast) {
          setCache(GET_KEY(token, deepSearchMode), next);
        }

        return next;
      });

      await new Promise((r) => setTimeout(r, 0));
    }
  };

  return {
    performSearch,
    lazyPerfomedResults,
  };
};
