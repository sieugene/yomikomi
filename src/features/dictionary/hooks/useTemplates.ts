import useSWR from "swr";
import { useDictionaryManager } from "./useDictionaryManager";
import { DictionaryTemplate } from "../types";

export const useTemplates = () => {
  const { manager } = useDictionaryManager();
  const { data, ...swr } = useSWR<DictionaryTemplate[] | undefined>(
    !!manager ? `templates/${manager.id}` : null,
    async () => {
      const templates = await manager?.getTemplates();
      return templates;
    }
  );
  return {
    data: data || [],
    ...swr,
  };
};

export const useTemplateById = (id: DictionaryTemplate["id"]) => {
  const { data } = useTemplates();
  return data.find((t) => t.id === id);
};

type UseGetTemplateReturn = {
  getTemplate: (id: string) => DictionaryTemplate | undefined;
};
export const useGetTemplate = (): UseGetTemplateReturn => {
  const { manager } = useDictionaryManager();
  const getTemplate = (id: string) => {
    return manager?.getTemplate(id);
  };
  return { getTemplate };
};
