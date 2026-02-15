import { TranslateConfig, TranslateSupportedLang } from "../types";
import { SUPPORTED_TRANSLATIONS } from "./constants";

export const loadTranslationConfig = async (
  cdn: typeof window.__transformers,
  language: TranslateSupportedLang,
): Promise<TranslateConfig> => {
  cdn.env.allowLocalModels = true;
  cdn.env.allowRemoteModels = false;

  const config = SUPPORTED_TRANSLATIONS[language];
  const models: TranslateConfig["models"] = [];

  const modelLoaders = config.necessary_models.map((modelName) => async () => {
    await new Promise((r) => setTimeout(r, 3000));
    const model = await cdn.pipeline("translation", modelName, {
      quantized: true,
      local_files_only: true,
    });
    await new Promise((r) => setTimeout(r, 3000));
    return { model, modelName };
  });

  for (const load of modelLoaders) {
    models.push(await load());
  }

  return {
    models,
    config,
  };
};
