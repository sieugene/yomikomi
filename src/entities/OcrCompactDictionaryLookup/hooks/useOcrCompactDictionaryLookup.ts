import { useDictionaryLookupStore } from "@/entities/DictionaryLookup/hooks/useDictionaryLookupStore";
import { useStoreDictionarySearch } from "@/features/dictionary-search/context/DictionarySearchContext";

export const useOcrCompactDictionaryLookup = () => {
  const { deepSearchMode } = useStoreDictionarySearch();
  const {
    clear,
    loading,
    handleWordClick,
    selectedWordId,
    groupedResults,
    selectedToken,
    error,
    panelOpen,
    searchStats,
  } = useDictionaryLookupStore();
  return {
    clear,
    loading,
    handleWordClick,
    selectedWordId,
    groupedResults,
    selectedToken,
    error,
    panelOpen,
    searchStats,
    deepSearchMode,
  };
};
