import { useDictionarySearch } from "@/features/dictionary-search/hooks/useDictionarySearch";
import { IpadicFeatures } from "kuromoji";
import { useState } from "react";

export const useDictionaryLookupStore = () => {
  const { performSearch, lazyPerfomedResults } = useDictionarySearch();

  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<IpadicFeatures | null>(
    null
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWordClick = (token: IpadicFeatures, wordId: number) => {
    setSelectedWordId(wordId);
    setSelectedToken(token);
    setPanelOpen(true);

    const searchTerm = token.basic_form || token.surface_form || "";
    if (!searchTerm || loading) return;
    setLoading(true);
    setError(null);
    performSearch(searchTerm)
      .catch((e) => {
        console.error(e);
        setError("Error while searching!");
      })
      .finally(() => setLoading(false));
  };

  const clear = () => {
    setPanelOpen(false);
    setSelectedWordId(null);
    setSelectedToken(null);
  };
  return {
    searchStats: lazyPerfomedResults.searchStats,
    groupedResults: lazyPerfomedResults.groupedResults,
    loading,
    error,
    clear,
    handleWordClick,
    selectedWordId,
    selectedToken,
    panelOpen,
  };
};
