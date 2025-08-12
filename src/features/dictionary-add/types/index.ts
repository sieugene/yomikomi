export type {
  DictionaryTemplate,
  DictionaryParserConfig,
} from "@/features/dictionary/types";

export enum STEPS {
  "SELECT_FILE_STEP" = 1,
  "TEMPLATE_SELECT_STEP" = 2,
  "CUSTOM_TEMPLATE_EDITOR_STEP" = 3,
  "FINAL_STEP" = 4,
}
