import {
  useDictionaryLookup,
  useDictionarySearch,
} from "@/features/dictionary/hooks";
import { SEARCH_LIMITS } from "@/features/dictionary/lib/constants";
import { SearchOptions } from "@/features/dictionary/types";
import { IpadicFeatures } from "kuromoji";
import { useState } from "react";

export const useDictionaryLookupStore = () => {
  const { activeEngineCount, isInitialized } = useDictionarySearch();
  const {
    groupedResults,
    loading,
    error,
    searchStats,
    performSearch,
    clearResults,
  } = useDictionaryLookup();

  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<IpadicFeatures | null>(
    null
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [deepSearchMode, setDeepSearchMode] = useState(false);

  const toggleDeepSearch = () => {
    setDeepSearchMode((prev) => !prev);

    if (panelOpen && selectedToken) {
      const searchTerm =
        selectedToken.basic_form || selectedToken.surface_form || "";
      if (searchTerm) {
        const newOptions: SearchOptions = {
          deepMode: !deepSearchMode,
          maxResults: !deepSearchMode
            ? SEARCH_LIMITS.DEEP_MODE.MAX_TOTAL_RESULTS
            : SEARCH_LIMITS.FAST_MODE.MAX_TOTAL_RESULTS,
          includePartialMatches: true,
          includeSubstrings: !deepSearchMode,
        };
        performSearch(searchTerm, newOptions);
      }
    }
  };

  const handleWordClick = async (token: IpadicFeatures, wordId: number) => {
    setSelectedWordId(wordId);
    setSelectedToken(token);
    setPanelOpen(true);

    const searchTerm = token.basic_form || token.surface_form || "";
    if (!searchTerm) return;

    const searchOptions: SearchOptions = {
      deepMode: deepSearchMode,
      maxResults: deepSearchMode
        ? SEARCH_LIMITS.DEEP_MODE.MAX_TOTAL_RESULTS
        : SEARCH_LIMITS.FAST_MODE.MAX_TOTAL_RESULTS,
      includePartialMatches: true,
      includeSubstrings: deepSearchMode,
    };

    console.log(
      `Searching for token: "${searchTerm}" (${
        deepSearchMode ? "deep" : "fast"
      } mode)`
    );
    await performSearch(searchTerm, searchOptions);
  };

  const clear = () => {
    setPanelOpen(false);
    setSelectedWordId(null);
    setSelectedToken(null);
    clearResults();
  };
  return {
    searchStats,
    clear,
    isInitialized,
    activeEngineCount,
    deepSearchMode,
    loading,
    toggleDeepSearch,
    handleWordClick,
    selectedWordId,
    groupedResults,
    selectedToken,
    error,
    panelOpen,
  };
};
