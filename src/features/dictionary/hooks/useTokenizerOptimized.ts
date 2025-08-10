import { useEffect, useState, useRef } from "react";
import { KuromojiTokenizer } from "../model/KuromojiTokenizer";

interface TokenizerHookReturn {
  tokenizer: KuromojiTokenizer | null;
  isReady: boolean;
  error: string | null;
  tokenizeText: (text: string) => any[] | null;
}

export const useTokenizer = (): TokenizerHookReturn => {
  const [tokenizer, setTokenizer] = useState<KuromojiTokenizer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const initTokenizer = async () => {
      if (initPromise.current) {
        await initPromise.current;
        return;
      }

      initPromise.current = (async () => {
        try {
          const kuromojiTokenizer = new KuromojiTokenizer();
          await kuromojiTokenizer.init();
          setTokenizer(kuromojiTokenizer);
          setIsReady(true);
          setError(null);
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to initialize tokenizer";
          setError(errorMessage);
          console.error("Tokenizer initialization failed:", err);
        }
      })();

      await initPromise.current;
    };

    initTokenizer();
  }, []);

  const tokenizeText = (text: string): any[] | null => {
    if (!tokenizer || !isReady) return null;

    try {
      return tokenizer.tokenize(text);
    } catch (err) {
      console.error("Tokenization error:", err);
      return null;
    }
  };

  return {
    tokenizer,
    isReady,
    error,
    tokenizeText,
  };
};
