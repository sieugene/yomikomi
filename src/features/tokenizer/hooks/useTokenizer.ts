import useSWR from "swr";
import { IpadicFeatures } from "kuromoji";
import { KuromojiTokenizer } from "../model/KuromojiTokenizer";
import { useDictTokenizer } from "./useDictTokenizer";

interface TokenizerHookReturn {
  tokenizer: KuromojiTokenizer | null;
  isReady: boolean;
  error: string | null;
  tokenizeText: (text: string) => Promise<TokenizeRes>;
}

export type TokenizeRes = {
  base: IpadicFeatures[];
  extended: IpadicFeatures[];
};

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

  const { onFill } = useDictTokenizer();

  const tokenizeText = async (text: string): Promise<TokenizeRes> => {
    if (!tokenizer) return { base: [], extended: [] };
    try {
      const tokeniRes = tokenizer.tokenize(text);
      const tokenizeText = await onFill(tokeniRes);
      return {
        base: tokeniRes,
        extended: tokenizeText,
      };
    } catch (err) {
      console.error("Tokenization error:", err);
      return {
        base: [],
        extended: [],
      };
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
