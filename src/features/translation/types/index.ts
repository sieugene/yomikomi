import type { TranslationPipeline } from "@huggingface/transformers";

export type TranslateSupportedLang = "ru" | "en";

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
};

export type TranslationSettingsContextType = {
  settings: TranslationSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<TranslationSettings>) => void;
  resetToDefaults: () => void;
  translateConfig: null | TranslateConfig;
};
