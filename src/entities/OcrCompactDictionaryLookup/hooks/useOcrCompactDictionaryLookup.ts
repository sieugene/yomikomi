import { useDictionaryLookupStore } from "@/entities/DictionaryLookup/hooks/useDictionaryLookupStore";
import { useStoreDictionarySearchSettings } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";

export const useOcrCompactDictionaryLookup = () => {
  const { deepSearchMode } = useStoreDictionarySearchSettings();
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
