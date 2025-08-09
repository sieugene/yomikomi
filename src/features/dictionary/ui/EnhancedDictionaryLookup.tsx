import React, { useState, useRef } from "react";
import { Search, BookOpen, Database, Clock, TrendingUp } from "lucide-react";
import useClickOutside from "@/shared/hooks/useClickOutside";
import { useEnhancedDictionaryLookup } from "../hooks/useEnhancedDictionaryLookup";
import { useTokenizer } from "../hooks/useTokenizer";

interface Props {
  sentence: string;
  baseBottom?: number;
}

export const EnhancedDictionaryLookup: React.FC<Props> = ({
  sentence,
  baseBottom = 0,
}) => {
  const tokenizer = useTokenizer();
  const {
    searchResults,
    groupedResults,
    loading,
    activeEngines,
    activeDictionaries,
  } = useEnhancedDictionaryLookup(sentence);

  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  // Токенизация для интерактивного отображения
  const tokens = tokenizer?.tokenize(sentence) || [];

  const handleWordClick = (wordId: number) => {
    setSelectedWordId(wordId);
    setOpen(true);
  };

  const selectedWord = tokens.find((t) => t.word_id === selectedWordId);
  const relevantResults = selectedWord
    ? groupedResults.filter(
        (group) =>
          group.word === selectedWord.basic_form ||
          group.word === selectedWord.surface_form ||
          group.word.includes(selectedWord.basic_form) ||
          group.word.includes(selectedWord.surface_form)
      )
    : [];

  return (
    <div className="relative">
      {/* Статус поисковых движков */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center text-sm text-blue-700">
          <Database className="w-4 h-4 mr-1" />
          {activeEngines} active engines
        </div>
        <div className="flex items-center text-sm text-blue-700">
          <BookOpen className="w-4 h-4 mr-1" />
          {activeDictionaries} dictionaries
        </div>
        {loading && (
          <div className="flex items-center text-sm text-blue-700">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-1"></div>
            Searching...
          </div>
        )}
      </div>

      {/* Интерактивное предложение */}
      <div className="sentence-display mb-4 p-4 bg-white rounded-lg border">
        <div className="flex flex-wrap gap-1">
          {tokens.length > 0 ? (
            tokens.map((token, index) => (
              <span
                key={index}
                onClick={() => handleWordClick(token.word_id)}
                className="cursor-pointer px-1 py-0.5 rounded hover:bg-blue-100 transition-colors border-b-2 border-transparent hover:border-blue-300"
                title={`${token.basic_form}`}
              >
                {token.surface_form}
              </span>
            ))
          ) : (
            <span className="text-gray-500">{sentence}</span>
          )}
        </div>
      </div>

      {/* Результаты поиска */}
      <DictionaryResultsPanel
        results={relevantResults}
        selectedWord={selectedWord}
        loading={loading}
        isOpen={open}
        onClose={() => setOpen(false)}
        baseBottom={baseBottom}
      />

      {/* Общая статистика поиска */}
      {searchResults.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Found {searchResults.length} total results</span>
            <span>{groupedResults.length} unique words</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface DictionaryResultsPanelProps {
  results: Array<{
    word: string;
    results: Array<{
      word: string;
      reading: string;
      type: string;
      meanings: string[];
      source: string;
      relevanceScore: number;
    }>;
  }>;
  selectedWord?: any;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  baseBottom: number;
}

const DictionaryResultsPanel: React.FC<DictionaryResultsPanelProps> = ({
  results,
  selectedWord,
  loading,
  isOpen,
  onClose,
  baseBottom,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
      style={{ bottom: baseBottom }}
    >
      <div className="p-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div className="flex items-center">
            <Search className="w-4 h-4 mr-2 text-blue-600" />
            <h3 className="font-medium">
              {selectedWord
                ? `Results for "${selectedWord.surface_form}"`
                : "Dictionary Results"}
            </h3>
          </div>
          {loading && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
              Loading...
            </div>
          )}
        </div>

        {/* Результаты */}
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No dictionary entries found</p>
            {selectedWord && (
              <p className="text-sm">Try selecting a different word</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((group, groupIndex) => (
              <div key={groupIndex} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-lg mb-2">{group.word}</h4>

                {group.results.map((result, resultIndex) => (
                  <div
                    key={resultIndex}
                    className="mb-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium">{result.word}</span>
                        {result.reading && result.reading !== result.word && (
                          <span className="ml-2 text-gray-600">
                            ({result.reading})
                          </span>
                        )}
                        <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {result.type}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {result.relevanceScore.toFixed(0)}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {result.meanings
                          .slice(0, 5)
                          .map((meaning, meaningIndex) => (
                            <span
                              key={meaningIndex}
                              className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                              {meaning}
                            </span>
                          ))}
                        {result.meanings.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{result.meanings.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Database className="w-3 h-3 mr-1" />
                        {result.source}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {result.meanings.length} meaning
                        {result.meanings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
