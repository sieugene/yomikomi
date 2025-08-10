import { useEffect, useState, useCallback, useRef } from "react";
import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import { useDictionaryManager } from "./useDictionaryManager";
import { EnhancedDictionarySearchEngine } from "../model/enhanced-search-engine";
import { DictionarySearchCoordinator } from "../model/search-coordinator";
import { SearchOptions, SearchResult } from "../types";
import { DICTIONARY_TEMPLATES } from "../lib/constants";

interface UseDictionarySearchReturn {
  searchCoordinator: DictionarySearchCoordinator | null;
  activeEngineCount: number;
  isInitialized: boolean;
  searchSingleToken: (
    token: string,
    options: SearchOptions
  ) => Promise<SearchResult[]>;
}

export const useDictionarySearch = (): UseDictionarySearchReturn => {
  const { sqlClient } = useSqlJs();
  const { dictionaries, getDictionary } = useDictionaryManager();
  const [coordinator] = useState(() => new DictionarySearchCoordinator());
  const [activeEngineCount, setActiveEngineCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef<Promise<void> | null>(null);

  const initializeEngines = useCallback(async () => {
    if (!sqlClient || initializationRef.current) {
      await initializationRef.current;
      return;
    }

    initializationRef.current = (async () => {
      console.log("Initializing dictionary search engines...");

      // Очищаем старые движки
      coordinator.clear();

      const activeDictionaries = dictionaries.filter(
        (d) => d.status === "active"
      );
      console.log(`Found ${activeDictionaries.length} active dictionaries`);

      const initPromises = activeDictionaries.map(async (dict) => {
        try {
          const storedDict = await getDictionary(dict.id);
          if (!storedDict) {
            console.warn(`Dictionary ${dict.name} not found in storage`);
            return;
          }

          const arrayBuffer = await storedDict.content.arrayBuffer();
          const config =
            dict.customParser ||
            DICTIONARY_TEMPLATES[dict.parserTemplate]?.config;

          if (!config) {
            console.warn(`No config found for dictionary ${dict.name}`);
            return;
          }

          const engine = new EnhancedDictionarySearchEngine(
            sqlClient,
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
      setActiveEngineCount(engineCount);
      setIsInitialized(true);

      console.log(
        `Dictionary search system initialized with ${engineCount} engines`
      );
    })();

    await initializationRef.current;
  }, [dictionaries, sqlClient, coordinator, getDictionary]);

  useEffect(() => {
    if (sqlClient && dictionaries.length > 0) {
      initializeEngines();
    }

    // Cleanup при размонтировании
    return () => {
      coordinator.clear();
    };
  }, [dictionaries, sqlClient, initializeEngines, coordinator]);

  const searchSingleToken = useCallback(
    async (token: string, options: SearchOptions): Promise<SearchResult[]> => {
      if (!isInitialized || !coordinator) {
        console.warn("Search coordinator not initialized");
        return [];
      }

      const activeDictIds = dictionaries
        .filter((d) => d.status === "active")
        .map((d) => d.id);

      return coordinator.searchSingleToken(token, options, activeDictIds);
    },
    [isInitialized, coordinator, dictionaries]
  );

  return {
    searchCoordinator: coordinator,
    activeEngineCount,
    isInitialized,
    searchSingleToken,
  };
};
