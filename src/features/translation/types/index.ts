import type { TranslationPipeline } from "@xenova/transformers";
import type { pipeline, env } from "@xenova/transformers";
export type PipelineTransformers = typeof pipeline;
export type EnvTransformers = typeof env;
export type TranslateSupportedLang = "ru" | "en";
export type TransformesCDN = {
  pipeline: PipelineTransformers;
  env: EnvTransformers;
};

export type SupportedTranslation = {
  necessary_models: string[];
  pattern?: string;
  models_options?: Record<string, unknown>;
};

export type TranslateConfig = {
  models: {
    model: TranslationPipeline;
    modelName: string;
  }[];
  config: SupportedTranslation;
};

export type TranslationSettings = {
  language: TranslateSupportedLang;
  on: boolean;
};

export type TranslationSettingsContextType = {
  settings: TranslationSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<TranslationSettings>) => void;
  resetToDefaults: () => void;
  translateConfig: null | TranslateConfig;
};
