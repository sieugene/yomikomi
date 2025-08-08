export enum SUPPORTED_DICTIONARIES {
  "en" = "english",
  "ru" = "russian",
}

export const DICTIONARY_CONFIG = {
  dictList: {
    [SUPPORTED_DICTIONARIES.en]: {
      file: "combined_terms_JMdict_english",
      key: SUPPORTED_DICTIONARIES.en,
    },
    [SUPPORTED_DICTIONARIES.ru]: {
      file: "combined_terms_JMdict_russian",
      key: SUPPORTED_DICTIONARIES.ru,
    },
  },
};
