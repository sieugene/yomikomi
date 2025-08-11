import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import useSWR from "swr";
import { EnhancedDictionarySearchEngine } from "../model/enhanced-search-engine";
import { DictionarySearchCoordinator } from "../model/search-coordinator";
import { SearchOptions, SearchResult } from "../types";
import { useDictionaries, useGetStoredDictionary } from "./useDictionaries";
import { useDictionaryManager } from "./useDictionaryManager";
import { useGetTemplate } from "./useTemplates";

interface UseDictionarySearchReturn {
  activeEngineCount: number;
  isInitialized: boolean;
  searchSingleToken: (
    token: string,
    options: SearchOptions
  ) => Promise<SearchResult[]>;
}

export const useDictionarySearch = (): UseDictionarySearchReturn => {
  const { sqlClient } = useSqlJs();
  const { loading: managerIsLoading, manager } = useDictionaryManager();
  const { data: dictionaries, isLoading: dictionariesIsLoading } =
    useDictionaries();
  const { getStoredDictionary } = useGetStoredDictionary();
  const { getTemplate } = useGetTemplate();
  const loading = managerIsLoading || dictionariesIsLoading;

  // TODO app can probably dead after add new dictionaries, it's about out of memory (coordinator.clear())
  const { data, isLoading } = useSWR(
    sqlClient && dictionaries.length > 0 && !loading && manager
      ? ["dictionary-engines", dictionaries, manager.id]
      : null,
    async () => {
      console.log("Initializing dictionary search engines...");
      const coordinator = new DictionarySearchCoordinator();

      // coordinator.clear();

      const activeDictionaries = dictionaries.filter(
        (d) => d.status === "active"
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

          const engine = new EnhancedDictionarySearchEngine(
            sqlClient!,
            arrayBuffer,
            config,
            dict.name
          );

          coordinator.addEngine(dict.id, engine);
          console.log(`Initialized engine for ${dict.name}`);
        } catch (err) {
          console.error(`Failed to initialize engine for ${dict.name}:`, err);
        }
      });

      await Promise.all(initPromises);

      const engineCount = coordinator.getActiveEngineCount();
      console.log(
        `Dictionary search system initialized with ${engineCount} engines`
      );
      return { engineCount, coordinator };
    },
    {
      revalidateOnFocus: false,
    }
  );

  const searchSingleToken = async (
    token: string,
    options: SearchOptions
  ): Promise<SearchResult[]> => {
    if (isLoading || !data?.engineCount || data.engineCount === 0) {
      console.warn("Search coordinator not initialized");
      return [];
    }

    const activeDictIds = dictionaries
      .filter((d) => d.status === "active")
      .map((d) => d.id);

    return data.coordinator?.searchSingleToken(token, options, activeDictIds);
  };

  return {
    activeEngineCount: data?.engineCount ?? 0,
    isInitialized: !isLoading && (data?.engineCount ?? 0) > 0,
    searchSingleToken,
  };
};
