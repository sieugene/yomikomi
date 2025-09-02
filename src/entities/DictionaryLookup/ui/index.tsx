import { InteractiveSentence } from "@/entities/DictionaryLookup/ui/InteractiveSentence";
import useClickOutside from "@/shared/hooks/useClickOutside";
import { AlertCircle, Database } from "lucide-react";
import React, { useRef } from "react";
import { useDictionaryLookupStore } from "../hooks/useDictionaryLookupStore";
import { SearchResultsPanel } from "./SearchResultsPanel";
import { useSearchCore } from "@/features/dictionary-search/hooks/useSearchCore";
import { DictionaryLookupSettings } from "@/features/dictionary-search/ui/DictionarySearchSettings";
import { useStoreDictionarySearchSettings } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";

interface Props {
  sentence: string;
  baseBottom?: number;
}

export const DictionaryLookup: React.FC<Props> = ({
  sentence,
  baseBottom = 0,
}) => {
  const { engineCount, inited } = useSearchCore();
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
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, () => {
    clear();
  });

  if (!inited) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">
            Dictionary system is initializing...
          </span>
        </div>
      </div>
    );
  }

  if (engineCount === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No active dictionaries found</p>
          <p className="text-sm text-gray-500">
            Please add and activate dictionaries in the management section
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <DictionaryLookupSettings />

      <InteractiveSentence
        sentence={sentence}
        onWordClick={handleWordClick}
        selectedWordId={selectedWordId}
        className="mb-4"
      />

      <SearchResultsPanel
        results={groupedResults}
        selectedToken={selectedToken}
        loading={loading}
        error={error}
        searchStats={searchStats}
        deepSearchMode={deepSearchMode}
        isOpen={panelOpen}
        onClose={() => {
          clear();
        }}
        baseBottom={baseBottom}
        ref={panelRef}
      />
    </div>
  );
};
