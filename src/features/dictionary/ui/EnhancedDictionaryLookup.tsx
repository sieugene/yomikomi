import React, { useState, useRef, useMemo } from "react";
import { Search, BookOpen, Database, Clock, TrendingUp, Zap, ZapOff } from "lucide-react";
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
    deepSearchMode,
    toggleDeepSearch,
    activeEngines,
    activeDictionaries,
  } = useEnhancedDictionaryLookup(sentence);

  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  // Мемоизируем токенизацию для производительности
  const tokens = useMemo(() => {
    if (!tokenizer || !sentence) return [];
    try {
      return tokenizer.tokenize(sentence);
    } catch (error) {
      console.warn("Tokenization error:", error);
      return [];
    }
  }, [tokenizer, sentence]);

  const handleWordClick = (wordId: number) => {
    setSelectedWordId(wordId);
    setOpen(true);
  };

  // УПРОЩЕНИЕ: Простая фильтрация результатов
  const relevantResults = useMemo(() => {
    if (!selectedWordId) return [];
    
    const selectedWord = tokens.find((t) => t.word_id === selectedWordId);
    if (!selectedWord) return [];

    return groupedResults.filter(group => {
      const word = group.word.toLowerCase();
      const surface = selectedWord.surface_form?.toLowerCase() || "";
      const basic = selectedWord.basic_form?.toLowerCase() || "";
      
      return word === surface || word === basic;
    }).slice(0, 5); // Максимум 5 групп
  }, [selectedWordId, tokens, groupedResults]);

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
        {/* Кнопка переключения режима поиска */}
        <div className="ml-auto">
          <button
            onClick={toggleDeepSearch}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              deepSearchMode
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            title={deepSearchMode ? 'Switch to fast search' : 'Switch to deep search'}
          >
            {deepSearchMode ? (
              <>
                <ZapOff className="w-3 h-3 mr-1" />
                Deep Search
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Fast Search
              </>
            )}
          </button>
        </div>
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
                title={`${token.basic_form || token.surface_form}`}
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
        selectedWord={tokens.find((t) => t.word_id === selectedWordId)}
        loading={loading}
        isOpen={open}
        onClose={() => setOpen(false)}
        baseBottom={baseBottom}
      />

      {/* Упрощенная статистика */}
      {searchResults.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Found {searchResults.length} results 
              {deepSearchMode && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                  Deep Search
                </span>
              )}
            </span>
            <span>{groupedResults.length} unique words</span>
          </div>
          {deepSearchMode && (
            <div className="mt-2 text-xs text-gray-500">
              Deep search includes partial matches and expanded results
            </div>
          )}
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
      className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
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
          <div className="text-center py-6 text-gray-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No dictionary entries found</p>
            {selectedWord && (
              <div className="mt-3 space-y-1">
                <p className="text-sm">Try selecting a different word</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span>or try</span>
                  <button
                    onClick={() => {
                      // Получаем toggleDeepSearch из родительского компонента
                      const event = new CustomEvent('toggleDeepSearch');
                      document.dispatchEvent(event);
                    }}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Deep Search
                  </button>
                  <span>for more results</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((group, groupIndex) => (
              <div key={groupIndex} className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-semibold text-lg mb-2">{group.word}</h4>

                {/* Показываем максимум 2 результата на группу */}
                {group.results.slice(0, 2).map((result, resultIndex) => (
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
                        {result.type && (
                          <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {result.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {result.relevanceScore.toFixed(0)}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {/* Максимум 3 значения */}
                        {result.meanings
                          .slice(0, 3)
                          .map((meaning, meaningIndex) => (
                            <span
                              key={meaningIndex}
                              className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                              {meaning}
                            </span>
                          ))}
                        {result.meanings.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{result.meanings.length - 3} more
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
                
                {/* Показать количество скрытых результатов */}
                {group.results.length > 2 && (
                  <p className="text-xs text-gray-500 ml-3">
                    +{group.results.length - 2} more results in {group.results[0].source}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};