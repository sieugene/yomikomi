import { pipeline } from "@huggingface/transformers";
import { TranslateConfig, TranslateSupportedLang } from "../types";
import { SUPPORTED_TRANSLATIONS } from "./constants";
import { env } from "@huggingface/transformers";


if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.simd = false;
  env.backends.onnx.wasm.proxy = true;
}


export const loadTranslationConfig = async (
  language: TranslateSupportedLang,
): Promise<TranslateConfig> => {
  const config = SUPPORTED_TRANSLATIONS[language];
  const modelsPromises = config.necessary_models.map(
    (modelName) => async () => {
      const model = await pipeline("translation", modelName);
      return { model, modelName };
    },
  );
  const models = await Promise.all(modelsPromises.map((fn) => fn()));
  return {
    models,
    config,
  };
};
