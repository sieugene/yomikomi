import { useDictionarySearch } from "@/features/dictionary-search/hooks/useDictionarySearch";
import { IpadicFeatures } from "kuromoji";
import { useState } from "react";

export const useDictionaryLookupStore = () => {
  const {
    groupedResults,
    loading,
    error,
    searchStats,
    performSearch,
    clearResults,
  } = useDictionarySearch();

  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<IpadicFeatures | null>(
    null
  );
  const [panelOpen, setPanelOpen] = useState(false);

  const handleWordClick = async (token: IpadicFeatures, wordId: number) => {
    setSelectedWordId(wordId);
    setSelectedToken(token);
    setPanelOpen(true);

    const searchTerm = token.basic_form || token.surface_form || "";
    if (!searchTerm) return;

    await performSearch(searchTerm);
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
    loading,
    handleWordClick,
    selectedWordId,
    groupedResults,
    selectedToken,
    error,
    panelOpen,
  };
};
