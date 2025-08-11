import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import useSWR from "swr";
import { DictionaryManager } from "../model/dictionary-manager";

export const useDictionaryManager = () => {
  const { sqlClient } = useSqlJs();
  const { data, isLoading, mutate } = useSWR(
    sqlClient ? "dictionary-manager-init" : null,
    async () => {
      if (sqlClient) {
        const manager = new DictionaryManager(sqlClient);
        try {
          return {
            manager,
          };
        } catch (error) {
          console.error("Failed to create dictionary manager:", error);
        }
      }
    }
  );
  return {
    data,
    loading: isLoading || !sqlClient,
    manager: data?.manager || null,
    refresh: async () => {
      await mutate();
    },
  };
};
