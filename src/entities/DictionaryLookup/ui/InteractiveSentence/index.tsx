import React, { FC, useMemo } from "react";
import { useTokenizer } from "@/features/tokenizer/hooks/useTokenizer";
import { IpadicFeatures } from "kuromoji";
import useSWR from "swr";

interface InteractiveSentenceProps {
  sentence: string;
  onWordClick: (token: IpadicFeatures, wordId: number) => void;
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

  const { data, isLoading, error } = useSWR(
    sentence && isReady ? ["tokenize", sentence] : null,
    async () => {
      if (!tokenizeText || !sentence) return null;
      const result = await tokenizeText(sentence);
      return result;
    },
    { revalidateOnFocus: false }
  );

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
    <>
      <h2>Kuromoji</h2>
      {data?.base && (
        <Tokens
          tokens={data?.base}
          onWordClick={onWordClick}
          sentence={sentence}
          className={className}
          selectedWordId={selectedWordId}
        />
      )}
      <h2>Kuromoji + dict</h2>
      {data?.extended && (
        <Tokens
          tokens={data?.extended}
          onWordClick={onWordClick}
          sentence={sentence}
          className={className}
          selectedWordId={selectedWordId}
        />
      )}
    </>
  );
};

type TokensProps = {
  tokens: IpadicFeatures[];
} & InteractiveSentenceProps;
const Tokens: FC<TokensProps> = ({
  tokens,
  className,
  onWordClick,
  selectedWordId,
  sentence,
}) => {
  return (
    <div className={`p-4 bg-white rounded-lg border ${className}`}>
      <div className="flex flex-wrap gap-1">
        {tokens && tokens.length > 0 ? (
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
                // TODO
                // token.part_of_speech || "unknown"
                "unknown"
              })`}
            >
              {token.surface_form}
            </span>
          ))
        ) : (
          <span className="text-gray-500">{sentence}</span>
        )}
      </div>

      {tokens && tokens.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Click on any word to look up its meaning • {tokens.length} tokens
          parsed
        </div>
      )}
    </div>
  );
};
