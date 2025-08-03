import { useEffect, useState } from "react";
import { KuromojiTokenizer } from "../model/KuromojiTokenizer";

export const useTokenizer = () => {
  const [tokenizer, setTokenizer] = useState<KuromojiTokenizer | null>(null);

  useEffect(() => {
    const initTokenizer = async () => {
      const kuromojiTokenizer = new KuromojiTokenizer();
      await kuromojiTokenizer.init();
      setTokenizer(kuromojiTokenizer);
    };

    initTokenizer();
  }, []);

  return tokenizer;
};
