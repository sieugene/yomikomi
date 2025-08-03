import { useEffect, useState } from "react";
import { ApiClient } from "@/shared/api/api.client";
import { ApiResponse } from "@/infrastructure/api/types";
import { useTokenizer } from "./useTokenizer";

export const useDictionaryLookup = (sentence: string) => {
  const tokenizer = useTokenizer();
  const [data, setData] = useState<ApiResponse["DictLookup"]["GET"] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const tokenizeSentence = async () => {
      if (sentence.trim() === "" || !tokenizer) {
        return;
      }

      try {
        setLoading(true);
        const tokens = tokenizer.tokenize(sentence);
        const response = await ApiClient.lookupDictionary(sentence, tokens);
        setData(response);
      } catch (error) {
        console.error("Error when sending a request:", error);
      } finally {
        setLoading(false);
      }
    };

    tokenizeSentence();
  }, [sentence]);

  return {
    loading,
    ...data,
  };
};
