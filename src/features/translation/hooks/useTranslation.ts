import { useState } from "react";
import { useTranslationSettings } from "../context/TranslationContext";
import { readTranslationResult } from "../lib/readTranslationResult";
import type { TextGenerationConfig } from "@xenova/transformers";

export const useTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loading, translateConfig } = useTranslationSettings();

  const translate = async (text: string) => {
    try {
      setIsLoading(true);
      if (!translateConfig) {
        throw new Error("Translation models not initialized");
      }
      const { models, config } = translateConfig;
      const pattern = config.pattern?.split(" -> ");
      const result = await pattern?.reduce(
        async (prevTextPromise, _, index) => {
          const prevText = await prevTextPromise;
          const { model } = models[index];
          const result = await model(
            prevText,
            (config.models_options || {}) as unknown as TextGenerationConfig,
          );
          return readTranslationResult(result);
        },
        Promise.resolve(text),
      );
      return result || "";
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    } finally {
      setIsLoading(false);
    }
  };

  return { translate, loading: isLoading || loading };
};
