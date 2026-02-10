import {
  SupportedTranslation,
  TranslateSupportedLang,
  TranslationSettingsContextType,
} from "../types";

export const SUPPORTED_TRANSLATIONS: Record<
  TranslateSupportedLang,
  SupportedTranslation
> = {
  ru: {
    necessary_models: ["Xenova/opus-mt-ja-en", "Xenova/opus-mt-en-ru"],
    pattern: "Xenova/opus-mt-ja-en -> Xenova/opus-mt-en-ru",
  },
  en: {
    necessary_models: ["Xenova/opus-mt-ja-en"],
    pattern: "Xenova/opus-mt-ja-en",
  },
};

export const DEFAULT_TRANSLATION_SETTINGS: TranslationSettingsContextType = {
  settings: {
    language: "en",
  },
  resetToDefaults: () => {},
  updateSettings: () => {},
};
