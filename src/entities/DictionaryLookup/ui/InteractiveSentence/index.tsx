import { useFuriganaMode } from "@/entities/Furigana/hooks/useFuriganaMode";
import { FuriganaModeToggle } from "@/entities/Furigana/ui/FuriganaModeToggle";
import { FuriganaText } from "@/entities/Furigana/ui/FuriganaText";
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
  tokensFooterContent?: React.ReactNode;
}

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({
  sentence,
  onWordClick,
  selectedWordId,
  className = "",
  tokensFooterContent,
}) => {
  const { tokenizeText, isReady, tokenizer } = useTokenizer();

  const { data, isLoading } = useSWR(
    sentence.length && isReady && !!tokenizer?.tokenize
      ? ["tokenize", sentence, tokenizer]
      : null,
    async () => tokenizeText(sentence),
    { revalidateOnFocus: false },
  );

  if (!isReady || isLoading) {
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
          tokensFooterContent={tokensFooterContent}
        />
      ) : (
        "Tokens not found or sentence is empty."
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
  tokensFooterContent,
}) => {
  const { furiganaMode, handleModeChange } = useFuriganaMode();

  const dictCount = tokens.filter((t) => t.source === "dict").length;
  const kuromojiCount = tokens.length - dictCount;

  return (
    <div className={`p-4 bg-white rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <FuriganaModeToggle mode={furiganaMode} onChange={handleModeChange} />
        <div className="text-xs text-gray-400">{tokens.length} tokens</div>
      </div>

      {tokens && tokens.length > 0 ? (
        <FuriganaText
          tokens={tokens}
          mode={furiganaMode}
          selectedWordId={selectedWordId}
          onWordClick={onWordClick}
        />
      ) : (
        <span className="text-gray-500">{sentence}</span>
      )}

      {tokens && tokens.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Kuromoji: {kuromojiCount} words • Dict: {dictCount} words • Total:{" "}
          {tokens.length}
        </div>
      )}

      {tokensFooterContent && tokensFooterContent}
    </div>
  );
};
