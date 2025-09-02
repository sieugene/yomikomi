import { useDictionaryManager } from "@/features/dictionary/hooks/useDictionaryManager";

type UseDictionaryDeleteReturn = {
  deleteDictionary: (id: string) => Promise<void>;
};

export const useDictionaryDelete = (): UseDictionaryDeleteReturn => {
  const { manager, refresh } = useDictionaryManager();
  const deleteDictionary = async (id: string): Promise<void> => {
    if (!manager) throw new Error("Manager not initialized");

    await manager.deleteDictionary(id);
    await refresh();
  };
  return { deleteDictionary };
};
