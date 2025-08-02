import { useEffect, useState } from "react";
import { ApiClient } from "@/shared/api/api.client";
import { ApiResponse } from "@/infrastructure/api/types";

export const useDictionaryLookup = (sentence: string) => {
  const [data, setData] = useState<ApiResponse["DictLookup"]["GET"] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const tokenizeSentence = async () => {
      if (sentence.trim() === "") {
        return;
      }

      try {
        setLoading(true);
        const response = await ApiClient.lookupDictionary(sentence);
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
