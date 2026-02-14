import {
  TranslationOutput,
  TranslationSingle,
} from "@xenova/transformers";

export const readTranslationResult = (
  result: TranslationOutput | TranslationOutput[],
) => {
  return Array.isArray(result)
    ? (result as TranslationSingle[])[0].translation_text
    : (result as TranslationSingle).translation_text;
};
