import { useDictionaryManagerV2 } from "@/features/dictionary/hooks/useDictionaryManager";
import {
  DictionaryParserConfig,
  DictionaryTemplate,
  ParserTestResult,
} from "@/features/dictionary/types";

type UseAddDictionaryReturn = {
  templates: DictionaryTemplate[];
  addDictionary: (
    file: File,
    templateId?: string,
    customConfig?: DictionaryParserConfig
  ) => Promise<string>;
  testParser: (
    file: File,
    config: DictionaryParserConfig,
    testTokens?: string[]
  ) => Promise<ParserTestResult>;
};

export const useAddDictionary = (): UseAddDictionaryReturn => {
  const { manager, refresh, data } = useDictionaryManagerV2();

  const addDictionary = async (
    file: File,
    templateId?: string,
    customConfig?: DictionaryParserConfig
  ): Promise<string> => {
    if (!manager) throw new Error("Manager not initialized");

    const id = await manager.addDictionary(file, templateId, customConfig);
    await refresh();
    return id;
  };

  const testParser = async (
    file: File,
    config: DictionaryParserConfig,
    testTokens?: string[]
  ): Promise<ParserTestResult> => {
    if (!manager) throw new Error("Manager not initialized");

    return manager.testParser(file, config, testTokens);
  };

  return { templates: data?.templates || [], addDictionary, testParser };
};
