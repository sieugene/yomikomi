import { SearchResult } from "@/features/dictionary/types";
import { IpadicFeatures } from "kuromoji";
import React from "react";
import { MainResultStats } from "../MainResultStats";
import { AlertCircle, BookOpen, Search } from "lucide-react";
import { SearchResultCard } from "../SearchResultCard";

interface SearchResultsPanelProps {
  results: Array<{
    word: string;
    results: SearchResult[];
  }>;
  selectedToken?: IpadicFeatures | null;
  loading: boolean;
  error: string | null;
  searchStats: {
    searchTime: number;
    resultCount: number;
    uniqueWords: number;
  } | null;
  deepSearchMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  baseBottom: number;
}

export const SearchResultsPanel = React.forwardRef<
  HTMLDivElement,
  SearchResultsPanelProps
>(
  (
    {
      results,
      selectedToken,
      loading,
      error,
      deepSearchMode,
      isOpen,
      baseBottom,
      searchStats,
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
        <MainResultStats
          deepSearchMode={deepSearchMode}
          searchStats={searchStats}
        />
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

SearchResultsPanel.displayName = "SearchResultsPanel";
