import { useDictionaryManager } from "@/features/dictionary/hooks/useDictionaryManager";
import { DictionaryMetadata } from "@/features/dictionary/types";

type UseUpdateDictionaryStatusReturn = {
  updateDictionaryStatus: (
    id: string,
    status: DictionaryMetadata["status"]
  ) => Promise<void>;
};
export const useUpdateDictionaryStatus =
  (): UseUpdateDictionaryStatusReturn => {
    const { data, refresh } = useDictionaryManager();

    const updateDictionaryStatus = async (
      id: string,
      status: DictionaryMetadata["status"]
    ): Promise<void> => {
      if (!data?.manager) throw new Error("Manager not initialized");

      await data?.manager.updateDictionaryStatus(id, status);
      await refresh();
    };

    return { updateDictionaryStatus };
  };
