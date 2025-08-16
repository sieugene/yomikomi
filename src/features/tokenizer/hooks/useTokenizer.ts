import useSWR from "swr";
import { IpadicFeatures } from "kuromoji";
import { KuromojiTokenizer } from "../model/KuromojiTokenizer";

interface TokenizerHookReturn {
  tokenizer: KuromojiTokenizer | null;
  isReady: boolean;
  error: string | null;
  tokenizeText: (text: string) => IpadicFeatures[] | null;
}

export const useTokenizer = (): TokenizerHookReturn => {
  const {
    data: tokenizer,
    error,
    isLoading,
  } = useSWR("kuromoji-tokenizer", async (): Promise<KuromojiTokenizer> => {
    const tokenizer = new KuromojiTokenizer();
    await tokenizer.init();
    return tokenizer;
  });

  const tokenizeText = (text: string) => {
    if (!tokenizer) return null;
    try {
      return tokenizer.tokenize(text);
    } catch (err) {
      console.error("Tokenization error:", err);
      return null;
    }
  };

  return {
    tokenizer: tokenizer ?? null,
    isReady: Boolean(tokenizer) && !isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to initialize tokenizer"
      : null,
    tokenizeText,
  };
};
