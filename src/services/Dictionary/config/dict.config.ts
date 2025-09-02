import path from "path";

// TODO clear me
export const DICTIONARY_CONFIG = {
  basePath: path.join(process.cwd(), "src/shared/data/dict"),
  dictList: {
    en: {
      file: "combined_terms_JMdict_english",
    },
    ru: {
      file: "combined_terms_JMdict_russian",
    },
  },
};
