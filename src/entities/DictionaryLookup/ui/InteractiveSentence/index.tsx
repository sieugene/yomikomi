import { DisplayToken } from "@/features/tokenizer/hooks/useDictTokenizer";
import { useTokenizer } from "@/features/tokenizer/hooks/useTokenizer";
import { IpadicFeatures } from "kuromoji";
import React, { FC } from "react";
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
  const { tokenizeText, isReady, tokenizer } = useTokenizer();

  const { data } = useSWR(
    sentence && isReady && !!tokenizer?.tokenize ? ["tokenize", sentence] : null,
    async () => {
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
      {data && data.length ? (
        <Tokens
          tokens={data}
          onWordClick={onWordClick}
          sentence={sentence}
          className={className}
          selectedWordId={selectedWordId}
        />
      ) : (
        "Tokens not found"
      )}
    </>
  );
};

type TokensProps = {
  tokens: DisplayToken[];
} & InteractiveSentenceProps;
const Tokens: FC<TokensProps> = ({
  tokens,
  className,
  onWordClick,
  selectedWordId,
  sentence,
}) => {
  const dictCount = tokens.filter((t) => t.source === "dict").length;
  const kuromojiCount = tokens.length - dictCount;

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
                  : token.source === "dict"
                  ? "border-green-500 hover:bg-green-100"
                  : "border-blue-500 hover:bg-blue-100"
              }`}
              title={`${token.basic_form || token.surface_form} (unknown)`}
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
          Kuromoji: {kuromojiCount} words • Dict: {dictCount} words • Total:{" "}
          {tokens.length}
        </div>
      )}
    </div>
  );
};
