import useSWR from "swr";
import { useDictionaryManager } from "./useDictionaryManager";
import { DictionaryMetadata } from "../types";
import { StoredDictionary } from "../model/dictionary-manager";
import { useMemo } from "react";
import { formatFileSize } from "../lib/formatters";

export const useDictionaries = () => {
  const { manager } = useDictionaryManager();
  const { data, ...swr } = useSWR<DictionaryMetadata[] | undefined>(
    !!manager ? `dictionaries/${manager.id}` : null,
    async () => {
      const dictionaries = await manager?.getDictionaries();
      return dictionaries;
    }
  );
  return {
    data: data || [],
    ...swr,
  };
};

export const useDictionariesSize = () => {
  const { data } = useDictionaries();
  const totalSizeBytes = useMemo(
    () => data?.reduce((total, dict) => total + dict.size, 0),
    [data]
  );
  const formattedTotalSize = useMemo(
    () => formatFileSize(totalSizeBytes),
    [totalSizeBytes]
  );
  return {
    totalSizeBytes,
    formattedTotalSize,
  };
};

export const useDictionaryById = (id: DictionaryMetadata["id"]) => {
  const { data } = useDictionaries();
  return data?.find((d) => d.id === id);
};

type UseGetStoredDictionaryReturn = {
  getStoredDictionary: (
    id: DictionaryMetadata["id"]
  ) => Promise<StoredDictionary | null>;
};
export const useGetStoredDictionary = (): UseGetStoredDictionaryReturn => {
  const { manager } = useDictionaryManager();
  const getStoredDictionary = (id: string) => {
    return manager?.getDictionary(id) || Promise.resolve(null);
  };
  return { getStoredDictionary };
};
