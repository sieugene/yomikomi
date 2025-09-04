import useSWR from "swr";
import { KuromojiTokenizer } from "../model/KuromojiTokenizer";
import { DisplayToken, useDictTokenizer } from "./useDictTokenizer";

interface TokenizerHookReturn {
  tokenizer: KuromojiTokenizer | null;
  isReady: boolean;
  error: string | null;
  tokenizeText: (text: string) => Promise<DisplayToken[]>;
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

  const { onFill, loading } = useDictTokenizer();

  const tokenizeText = async (text: string): Promise<DisplayToken[]> => {
    try {
      const tokeniRes = tokenizer!.tokenize(text);
      const tokenizeText = await onFill(tokeniRes);
      return tokenizeText;
    } catch (err) {
      console.error("Tokenization error:", err);
      return [];
    }
  };

  return {
    tokenizer: tokenizer ?? null,
    isReady: Boolean(tokenizer) && !isLoading && !loading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to initialize tokenizer"
      : null,
    tokenizeText,
  };
};
