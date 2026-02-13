import {
  PipelineTransformers,
  TranslateConfig,
  TranslateSupportedLang,
} from "../types";
import { SUPPORTED_TRANSLATIONS } from "./constants";

export const loadTranslationConfig = async (
  pipeline: PipelineTransformers,
  language: TranslateSupportedLang,
): Promise<TranslateConfig> => {
  const config = SUPPORTED_TRANSLATIONS[language];
  const modelsPromises = config.necessary_models.map(
    (modelName) => async () => {
      const model = await pipeline("translation", modelName, {
        device: "webgpu",
        session_options: {
          enableCpuMemArena: true,
          executionMode: "parallel",
        },
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
