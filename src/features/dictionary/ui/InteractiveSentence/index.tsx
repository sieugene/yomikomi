import React, { useMemo } from "react";
import { useTokenizer } from "@features/dictionary/hooks/useTokenizerOptimized";

interface InteractiveSentenceProps {
  sentence: string;
  onWordClick: (token: any, wordId: number) => void;
  selectedWordId?: number | null;
  className?: string;
}

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({
  sentence,
  onWordClick,
  selectedWordId,
  className = "",
}) => {
  const { tokenizeText, isReady } = useTokenizer();

  const tokens = useMemo(() => {
    if (!isReady || !sentence) return [];
    return tokenizeText(sentence) || [];
  }, [isReady, sentence, tokenizeText]);

  if (!isReady) {
    return (
      <div className={`p-4 bg-white rounded-lg border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white rounded-lg border ${className}`}>
      <div className="flex flex-wrap gap-1">
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <span
              key={index}
              onClick={() => onWordClick(token, token.word_id)}
              className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 border-b-2 ${
                selectedWordId === token.word_id
                  ? "bg-blue-200 border-blue-500 text-blue-900"
                  : "border-transparent hover:bg-blue-100 hover:border-blue-300"
              }`}
              title={`${token.basic_form || token.surface_form} (${
                token.part_of_speech || "unknown"
              })`}
            >
              {token.surface_form}
            </span>
          ))
        ) : (
          <span className="text-gray-500">{sentence}</span>
        )}
      </div>

      {tokens.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Click on any word to look up its meaning • {tokens.length} tokens
          parsed
        </div>
      )}
    </div>
  );
};
