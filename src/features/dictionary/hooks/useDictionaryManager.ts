import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import useSWR from "swr";
import {
  DictionaryManager,
  StoredDictionary,
} from "../model/dictionary-manager";
import { DictionaryMetadata, DictionaryTemplate } from "../types";

interface UseDictionaryManagerReturn {
  dictionaries: DictionaryMetadata[];
  templates: DictionaryTemplate[];
  loading: boolean;
  totalSize: number;
  updateDictionaryStatus: (
    id: string,
    status: DictionaryMetadata["status"]
  ) => Promise<void>;
  addCustomTemplate: (template: DictionaryTemplate) => Promise<void>;
  getDictionary: (id: string) => Promise<StoredDictionary | null>;
  getTemplate: (id: string) => DictionaryTemplate | undefined;
  refresh: () => Promise<void>;
}

export const useDictionaryManagerV2 = () => {
  const { sqlClient } = useSqlJs();
  const { data, isLoading, mutate } = useSWR(
    sqlClient ? "dictionary-manager-init" : null,
    async () => {
      if (sqlClient) {
        const manager = new DictionaryManager(sqlClient);

        try {
          const [dicts, totalSizeBytes] = await Promise.all([
            manager.getDictionaries(),
            manager.getTotalSize(),
          ]);

          return {
            manager,
            dictionaries: dicts,
            totalSize: totalSizeBytes,
            templates: manager.getTemplates(),
          };
        } catch (error) {
          console.error("Failed to load dictionary data:", error);
        }
      }
    }
  );
  return {
    data,
    loading: isLoading || !sqlClient,
    manager: data?.manager || null,
    refresh: mutate,
  };
};

export const useDictionaryManager = (): UseDictionaryManagerReturn => {
  const { loading, manager, refresh, data } = useDictionaryManagerV2();

  const updateDictionaryStatus = async (
    id: string,
    status: DictionaryMetadata["status"]
  ): Promise<void> => {
    if (!manager) throw new Error("Manager not initialized");

    await manager.updateDictionaryStatus(id, status);
    await refresh();
  };

  const addCustomTemplate = async (
    template: DictionaryTemplate
  ): Promise<void> => {
    if (!manager) throw new Error("Manager not initialized");

    await manager.addCustomTemplate(template);
    await refresh();
  };

  const getDictionary = (id: string) => {
    return manager?.getDictionary(id) || Promise.resolve(null);
  };

  const getTemplate = (id: string) => {
    return manager?.getTemplate(id);
  };

  return {
    dictionaries: data?.dictionaries || [],
    templates: data?.templates || [],
    loading,
    totalSize: data?.totalSize || 0,
    updateDictionaryStatus,
    addCustomTemplate,
    getDictionary,
    getTemplate,
    refresh: async () => {
      await refresh();
    },
  };
};
