export type TranslateSupportedLang = "ru" | "en";

export type SupportedTranslation = {
  necessary_models: string[];
  pattern?: string;
};

export type TranslationSettings = {
  language: TranslateSupportedLang;
};

export type TranslationSettingsContextType = {
  settings: TranslationSettings;
  updateSettings: (newSettings: Partial<TranslationSettings>) => void;
  resetToDefaults: () => void;
};
