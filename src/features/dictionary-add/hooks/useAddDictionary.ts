import { useDictionaryManager } from "@/features/dictionary/hooks/useDictionaryManager";
import {
  DictionaryParserConfig,
  ParserTestResult,
} from "@/features/dictionary/types";

type UseAddDictionaryReturn = {
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
  const { manager, refresh } = useDictionaryManager();

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

  return { addDictionary, testParser };
};
