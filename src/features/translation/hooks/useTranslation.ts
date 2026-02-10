import { pipeline, TranslationPipeline } from "@huggingface/transformers";
import { useEffect, useRef } from "react";
import { useTranslationSettings } from "../context/TranslationContext";
import { SUPPORTED_TRANSLATIONS } from "../lib/constants";
import { readTranslationResult } from "../lib/readTranslationResult";
import { SupportedTranslation } from "../types";

type TranslateConfig = {
  models: {
    model: TranslationPipeline;
    modelName: string;
  }[];
  config: SupportedTranslation;
};

export const useTranslation = () => {
  const { settings } = useTranslationSettings();
  const translateConfig = useRef<TranslateConfig | null>(null);

  const initTranslationModels = async () => {
    const config = SUPPORTED_TRANSLATIONS[settings.language];
    const modelsPromises = config.necessary_models.map(
      (modelName) => async () => {
        const model = await pipeline("translation", modelName);
        return { model, modelName };
      },
    );
    const models = await Promise.all(modelsPromises.map((fn) => fn()));
    translateConfig.current = {
      models,
      config,
    };
    console.log("Translation models initialized", translateConfig.current);
  };

  useEffect(() => {
    initTranslationModels();
  }, []);

  const translate = async (text: string) => {
    if (!translateConfig.current) {
      throw new Error("Translation models not initialized");
    }
    const { models, config } = translateConfig.current;
    const pattern = config.pattern?.split(" -> ");
    const result =
      (await pattern?.reduce(async (prevTextPromise, _, index) => {
        const prevText = await prevTextPromise;
        const { model } = models[index];
        const result = await model(prevText);
        return readTranslationResult(result);
      }, Promise.resolve(text))) ?? text;
    console.log("Translation result:", result);
  };

  return { translate };
};
