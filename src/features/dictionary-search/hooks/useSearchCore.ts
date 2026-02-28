import {
  useDictionaries,
  useGetStoredDictionary,
  useGetTemplate,
} from "@/features/dictionary/hooks";
import { useRef } from "react";
import { SearchCore } from "../context/DictionarySearchContext";
import { DictionarySearchCoordinator } from "../model/search-coordinator";

export const useSearchCore = () => {
  const { data: dictionaries } = useDictionaries();
  const { getStoredDictionary } = useGetStoredDictionary();
  const { getTemplate } = useGetTemplate();

  const core = useRef<SearchCore | null>(null);

  const getCore = async (): Promise<SearchCore> => {
    if (core.current) return core.current;

    console.log("Initializing dictionary search engines...");
    const coordinator = new DictionarySearchCoordinator();

    const activeDictionaries = dictionaries.filter(
      (d) => d.status === "active",
    );

    console.log(`Found ${activeDictionaries.length} active dictionaries`);

    const initPromises = activeDictionaries.map(async (dict) => {
      try {
        const storedDict = await getStoredDictionary(dict.id);
        if (!storedDict) {
          console.warn(`Dictionary ${dict.name} not found in storage`);
          return;
        }

        const arrayBuffer = await storedDict.content.arrayBuffer();
        const config =
          dict.customParser || getTemplate(dict.parserTemplate)?.config;

        if (!config) {
          console.warn(`No config found for dictionary ${dict.name}`);
          return;
        }

        const template = getTemplate(dict.parserTemplate);
        const dictionaryType =
          template?.dictionaryType || dict.dictionaryType || "standard";

        await coordinator.addEngine(
          dict.id,
          arrayBuffer,
          config,
          dict.name,
          dictionaryType,
        );
        console.log(`Initialized ${dictionaryType} engine for ${dict.name}`);
      } catch (err) {
        console.error(`Failed to initialize engine for ${dict.name}:`, err);
      }
    });

    await Promise.all(initPromises);

    const engineCount = coordinator.getActiveEngineCount();
    console.log(
      `Dictionary search system initialized with ${engineCount} engines`,
    );

    const data: SearchCore = { engineCount, coordinator };
    core.current = data;
    return data;
  };
  return { getCore };
};