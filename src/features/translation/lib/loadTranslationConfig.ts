import {
  TransformesCDN,
  TranslateConfig,
  TranslateSupportedLang,
} from "../types";
import { SUPPORTED_TRANSLATIONS } from "./constants";

export const loadTranslationConfig = async (
  cdn: TransformesCDN,
  language: TranslateSupportedLang,
): Promise<TranslateConfig> => {
  cdn.env.allowLocalModels = true;
  cdn.env.allowRemoteModels = false;

  const config = SUPPORTED_TRANSLATIONS[language];
  const modelsPromises = config.necessary_models.map(
    (modelName) => async () => {
      const model = await cdn.pipeline("translation", modelName, {
        quantized: true,
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
