import {
  useDictionaries,
  useDictionariesSize,
  useDictionaryManager,
} from "@/features/dictionary/hooks";
import { useDictionariesStats } from "./useDictionariesStats";

export const useDictionaryManagementSystem = () => {
  const { loading: managerIsLoading } = useDictionaryManager();
  const { data: dictionaries, isLoading: dictionariesIsLoading } =
    useDictionaries();
  const { formattedTotalSize, isLoading: sizeInfoIsLoading } =
    useDictionariesSize();

  const { stats, statsCards } = useDictionariesStats(
    dictionaries,
    formattedTotalSize
  );

  return {
    formattedTotalSize,
    stats,
    statsCards,
    loading: dictionariesIsLoading || managerIsLoading || sizeInfoIsLoading,
    dictionaries,
  };
};
