import {
  PerfrormSearchResult,
  useDictionarySearch,
} from "@/features/dictionary-search/hooks/useDictionarySearch";
import { IpadicFeatures } from "kuromoji";
import { useState } from "react";

export const useDictionaryLookupStore = () => {
  const { performSearch } = useDictionarySearch();

  const [searchResultState, setSearchResultState] =
    useState<PerfrormSearchResult>({
      groupedResults: [],
      results: [],
      searchStats: null,
    });
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<IpadicFeatures | null>(
    null
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWordClick = async (token: IpadicFeatures, wordId: number) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedWordId(wordId);
      setSelectedToken(token);
      setPanelOpen(true);

      const searchTerm = token.basic_form || token.surface_form || "";
      if (!searchTerm) return;

      const result = await performSearch(searchTerm);
      setSearchResultState(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPanelOpen(false);
    setSelectedWordId(null);
    setSelectedToken(null);
    setSearchResultState({
      groupedResults: [],
      results: [],
      searchStats: null,
    });
  };
  return {
    searchStats: searchResultState.searchStats,
    groupedResults: searchResultState.groupedResults,
    clear,
    loading,
    handleWordClick,
    selectedWordId,
    selectedToken,
    error,
    panelOpen,
  };
};
