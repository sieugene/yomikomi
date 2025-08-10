import { DictionaryMetadata } from "../types";
import { useDictionaryManagerV2 } from "./useDictionaryManager";

export const useDictionaryById = (id: DictionaryMetadata["id"]) => {
  const { data } = useDictionaryManagerV2();
  return data?.dictionaries.find((d) => d.id === id);
};
