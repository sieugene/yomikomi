import React, { useState, useRef } from "react";
import { Search, BookOpen, Database, Zap, AlertCircle } from "lucide-react";
import useClickOutside from "@/shared/hooks/useClickOutside";
import { useDictionaryLookup } from "@features/dictionary/hooks/useDictionaryLookup";
import { useDictionarySearch } from "@features/dictionary/hooks/useDictionarySearch";
import { InteractiveSentence } from "@/features/dictionary/ui/InteractiveSentence";
import { SearchResultCard } from "@features/dictionary/ui/SearchResultCard";
import { SearchOptions, SearchResult } from "@features/dictionary/types";
import { SearchModeToggle } from "@/features/dictionary/ui/SearchModeToggle";
import { formatSearchStats } from "@features/dictionary/lib/formatters";

interface Props {
  sentence: string;
  baseBottom?: number;
}

export const EnhancedDictionaryLookup: React.FC<Props> = ({
  sentence,
  baseBottom = 0,
}) => {
  const { activeEngineCount, isInitialized } = useDictionarySearch();
  const {
    searchResults,
    groupedResults,
    loading,
    error,
    searchStats,
    performSearch,
    clearResults,
  } = useDictionaryLookup();

  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deepSearchMode, setDeepSearchMode] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, () => {
    setPanelOpen(false);
    setSelectedWordId(null);
    setSelectedToken(null);
    clearResults();
  });

  const handleWordClick = async (token: any, wordId: number) => {
    setSelectedWordId(wordId);
    setSelectedToken(token);
    setPanelOpen(true);

    // Определяем поисковый термин из токена
    const searchTerm = token.basic_form || token.surface_form || "";
    if (!searchTerm) return;

    const searchOptions: SearchOptions = {
      deepMode: deepSearchMode,
      maxResults: deepSearchMode ? 100 : 50,
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

  const toggleDeepSearch = () => {
    setDeepSearchMode((prev) => !prev);

    // Если панель открыта, повторяем поиск с новыми настройками
    if (panelOpen && selectedToken) {
      const searchTerm =
        selectedToken.basic_form || selectedToken.surface_form || "";
      if (searchTerm) {
        const newOptions: SearchOptions = {
          deepMode: !deepSearchMode,
          maxResults: !deepSearchMode ? 100 : 50,
          includePartialMatches: true,
          includeSubstrings: !deepSearchMode,
        };
        performSearch(searchTerm, newOptions);
      }
    }
  };

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
      {/* Status and Controls */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center text-sm text-blue-700">
          <Database className="w-4 h-4 mr-1" />
          {activeEngineCount} active dictionaries
        </div>

        {loading && (
          <div className="flex items-center text-sm text-blue-700">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-2"></div>
            Searching...
          </div>
        )}

        <div className="ml-auto">
          <SearchModeToggle
            deepMode={deepSearchMode}
            onToggle={toggleDeepSearch}
          />
        </div>
      </div>

      {/* Interactive Sentence */}
      <InteractiveSentence
        sentence={sentence}
        onWordClick={handleWordClick}
        selectedWordId={selectedWordId}
        className="mb-4"
      />

      {/* Search Results Panel */}
      <DictionaryResultsPanel
        results={groupedResults}
        selectedToken={selectedToken}
        loading={loading}
        error={error}
        searchStats={searchStats}
        deepSearchMode={deepSearchMode}
        isOpen={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setSelectedWordId(null);
          setSelectedToken(null);
          clearResults();
        }}
        baseBottom={baseBottom}
        ref={panelRef}
      />

      {/* Global Stats */}
      {searchStats && panelOpen && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {formatSearchStats(
              searchStats.resultCount,
              searchStats.uniqueWords,
              searchStats.searchTime
            )}
            {deepSearchMode && (
              <span className="ml-3 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                Deep Search Active
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DictionaryResultsPanelProps {
  results: Array<{
    word: string;
    results: SearchResult[];
  }>;
  selectedToken?: any;
  loading: boolean;
  error: string | null;
  searchStats: any;
  deepSearchMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  baseBottom: number;
}

const DictionaryResultsPanel = React.forwardRef<
  HTMLDivElement,
  DictionaryResultsPanelProps
>(
  (
    {
      results,
      selectedToken,
      loading,
      error,
      deepSearchMode,
      isOpen,
      onClose,
      baseBottom,
    },
    ref
  ) => {
    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        style={{ bottom: baseBottom }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <div className="flex items-center">
              <Search className="w-4 h-4 mr-2 text-blue-600" />
              <h3 className="font-medium">
                {selectedToken
                  ? `"${selectedToken.surface_form}" (${
                      selectedToken.basic_form || selectedToken.surface_form
                    })`
                  : "Dictionary Results"}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {deepSearchMode && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Deep Search
                </span>
              )}
              {loading && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Searching...
                </div>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No dictionary entries found</p>
                  {selectedToken && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm">
                        Searched for:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          {selectedToken.surface_form}
                        </code>
                      </p>
                      {!deepSearchMode && (
                        <p className="text-sm text-blue-600">
                          Try enabling Deep Search for more comprehensive
                          results
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h4 className="font-semibold text-lg mb-3 text-gray-900">
                        {group.word}
                        <span className="ml-2 text-sm text-gray-500 font-normal">
                          ({group.results.length} result
                          {group.results.length !== 1 ? "s" : ""})
                        </span>
                      </h4>

                      <div className="space-y-3">
                        {group.results.map((result, resultIndex) => (
                          <SearchResultCard
                            key={`${result.source}-${resultIndex}`}
                            result={result}
                            maxMeanings={deepSearchMode ? 8 : 5}
                            showSource={true}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Show truncation notice */}
                  {results.length >= (deepSearchMode ? 25 : 15) && (
                    <div className="text-center py-2 text-sm text-gray-500 border-t">
                      Showing top {results.length} word groups.
                      {!deepSearchMode && " Try Deep Search for more results."}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

DictionaryResultsPanel.displayName = "DictionaryResultsPanel";
