import { pipeline } from "@huggingface/transformers";
import { TranslateConfig, TranslateSupportedLang } from "../types";
import { SUPPORTED_TRANSLATIONS } from "./constants";
import { env } from "@huggingface/transformers";

env.allowLocalModels = true;

export const loadTranslationConfig = async (
  language: TranslateSupportedLang,
): Promise<TranslateConfig> => {
  const config = SUPPORTED_TRANSLATIONS[language];
  const modelsPromises = config.necessary_models.map(
    (modelName) => async () => {
      const model = await pipeline("translation", modelName, {
        local_files_only: true,
      });
      return { model, modelName };
    },
  );
  const models = await Promise.all(modelsPromises.map((fn) => fn()));
  return {
    models,
    config,
  };
};
