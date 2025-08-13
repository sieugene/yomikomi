import { InteractiveSentence } from "@/entities/DictionaryLookup/ui/InteractiveSentence";
import useClickOutside from "@/shared/hooks/useClickOutside";
import { useDictionaryLookup } from "@features/dictionary/hooks/useDictionaryLookup";
import { useDictionarySearch } from "@features/dictionary/hooks/useDictionarySearch";
import { SearchOptions } from "@features/dictionary/types";
import { IpadicFeatures } from "kuromoji";
import { AlertCircle, Database } from "lucide-react";
import React, { useRef, useState } from "react";
import { LookupSettings } from "./LookupSettings";
import { SearchResultsPanel } from "./SearchResultsPanel";
import { useDictionaryLookupStore } from "../hooks/useDictionaryLookup";

interface Props {
  sentence: string;
  baseBottom?: number;
}

export const DictionaryLookup: React.FC<Props> = ({
  sentence,
  baseBottom = 0,
}) => {
  const {
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
    searchStats,
  } = useDictionaryLookupStore();
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, () => {
    clear();
  });

  if (!isInitialized) {
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

  if (activeEngineCount === 0) {
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
      <LookupSettings
        activeEngineCount={activeEngineCount}
        deepSearchMode={deepSearchMode}
        loading={loading}
        toggleDeepSearch={toggleDeepSearch}
      />

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
