import { useDictionaryManager } from "@/features/dictionary/hooks/useDictionaryManager";
import { DictionaryTemplate } from "@/features/dictionary/types";
import { v4 as uuidv4 } from "uuid";

type UseCreateTemplateReturn = {
  addCustomTemplate: (config: DictionaryTemplate["config"]) => Promise<void>;
};
export const useCreateTemplate = (): UseCreateTemplateReturn => {
  const { manager, refresh } = useDictionaryManager();

  const addCustomTemplate = async (
    config: DictionaryTemplate["config"]
  ): Promise<void> => {
    if (!manager) throw new Error("Manager not initialized");
    const template: DictionaryTemplate = {
      id: uuidv4(),
      description: "New custom config!",
      config,
      language: "unknown",
      name: "Test config",
    };

    await manager.addCustomTemplate(template);
    await refresh();
  };

  return {
    addCustomTemplate,
  };
};
