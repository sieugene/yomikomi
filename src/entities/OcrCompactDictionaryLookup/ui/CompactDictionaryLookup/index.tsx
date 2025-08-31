import { InteractiveSentence } from "@/entities/DictionaryLookup/ui/InteractiveSentence";
import { SearchResultsPanel } from "@/entities/DictionaryLookup/ui/SearchResultsPanel";
import useClickOutside from "@/shared/hooks/useClickOutside";
import { Book, Search, X } from "lucide-react";
import { FC, useRef } from "react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useOcrCompactDictionaryLookup } from "../../hooks/useOcrCompactDictionaryLookup";

interface CompactDictionaryLookupProps {
  sentence: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const CompactDictionaryLookup: FC<CompactDictionaryLookupProps> = ({
  sentence,
  isOpen,
  onClose,
  className = "",
}) => {
  const {
    deepSearchMode,
    clear,
    loading,
    handleWordClick,
    selectedWordId,
    groupedResults,
    selectedToken,
    error,
    panelOpen,
    searchStats,
  } = useOcrCompactDictionaryLookup();

  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    if (isOpen) {
      clear();
      onClose();
    }
  });

  const resultContainerRef = useRef<HTMLDivElement>(null);

  useClickOutside(resultContainerRef, () => {
    clear();
  });

  const handleClose = () => {
    clear();
    onClose();
  };

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
        onClick={handleClose}
      />

      {/* Dictionary Panel */}
      <div
        ref={containerRef}
        className={`
        fixed inset-x-0 top-0 bg-white rounded-b-2xl shadow-2xl z-50
        sm:min-w-80 sm:max-w-96 sm:rounded-lg sm:shadow-xl sm:border sm:border-gray-200
        transform transition-all duration-300 ease-out
        ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        ${className}
      `}
        style={{
          maxHeight: "100vh",
          height: "-webkit-fill-available",
          overflow: "hidden",
          overflowY: "scroll"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Book className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Dictionary
              </h3>
              <p className="text-xs text-gray-500">Tap words to translate</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/60 rounded-full transition-colors"
            aria-label="Close dictionary"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Sentence Section */}
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Selected Text
            </div>
            <InteractiveSentence
              sentence={sentence}
              onWordClick={handleWordClick}
              selectedWordId={selectedWordId}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* Results Section */}
          <div className="flex-1 min-h-0">
            {!selectedToken && !loading && (
              <div className="p-6 text-center">
                <div className="inline-flex p-3 bg-blue-50 rounded-full mb-3">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Select a word to see translation
                </p>
                <p className="text-xs text-gray-400">
                  Tap any word in the text above
                </p>
              </div>
            )}

            {(selectedToken || loading || error) && (
              <div className="h-full" ref={resultContainerRef}>
                <SearchResultsPanel
                  results={groupedResults}
                  selectedToken={selectedToken}
                  loading={loading}
                  error={error}
                  searchStats={searchStats}
                  deepSearchMode={deepSearchMode}
                  isOpen={panelOpen}
                  onClose={() => clear()}
                  baseBottom={0}
                  className="h-full border-0 shadow-none bg-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Handle */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </>
  );
};
