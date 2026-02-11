import {
  SupportedTranslation,
  TranslateSupportedLang,
  TranslationSettingsContextType,
} from "../types";

export const SUPPORTED_TRANSLATIONS: Record<
  TranslateSupportedLang,
  SupportedTranslation
> = {
  // ru_legacy: {
  //   necessary_models: ["Xenova/opus-mt-ja-en", "Xenova/opus-mt-en-ru"],
  //   pattern: "Xenova/opus-mt-ja-en -> Xenova/opus-mt-en-ru",
  // },
  ru: {
    necessary_models: ["Xenova/nllb-200-distilled-600M"],
    pattern: "Xenova/nllb-200-distilled-600M",
    models_options: {
      src_lang: "jpn_Jpan",
      tgt_lang: "rus_Cyrl",
    },
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
  loading: false,
  translateConfig: null,
};
