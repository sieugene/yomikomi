import {
  useDictionaries,
  useDictionaryManager
} from "@/features/dictionary/hooks";
import React, { createContext, useContext, useState } from "react";
import { useSearchCore } from "../hooks/useSearchCore";
import { DictionarySearchCoordinator } from "../model/search-coordinator";

export type SearchCore = {
  engineCount: number;
  coordinator: DictionarySearchCoordinator | null;
};

type DictionarySearchContextType = {
  deepSearchMode: boolean;
  toggleDeepSearch: () => void;
  loading: boolean;
  getCore: () => Promise<SearchCore>;
};

const DictionarySearchContext = createContext<
  DictionarySearchContextType | undefined
>({
  deepSearchMode: false,
  getCore: async () => ({ coordinator: null, engineCount: 0 }),
  loading: false,
  toggleDeepSearch: () => {},
});

const DEEP_SEARCH_KEY = "dictionarySearch.deepSearchMode";

export const DictionarySearchSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { loading: managerIsLoading } = useDictionaryManager();
  const { isLoading: dictionariesIsLoading } = useDictionaries();

  const loading = managerIsLoading || dictionariesIsLoading;

  const [deepSearchMode, setDeepSearchMode] = useState(() => {
    try {
      return localStorage.getItem(DEEP_SEARCH_KEY) === "true";
    } catch {
      return false;
    }
  });

  const { getCore } = useSearchCore();

  return (
    <DictionarySearchContext.Provider
      value={{
        loading,
        getCore,
        deepSearchMode,
        toggleDeepSearch: () => {
          const nextVal = !deepSearchMode;
          localStorage.setItem(DEEP_SEARCH_KEY, nextVal ? "true" : "false");
          setDeepSearchMode(nextVal);
        },
      }}
    >
      {children}
    </DictionarySearchContext.Provider>
  );
};

export const useStoreDictionarySearch = () => {
  const context = useContext(DictionarySearchContext);
  if (!context) {
    throw new Error(
      "useStoreDictionarySearch must be used within a DictionarySearchSettingsProvider",
    );
  }
  return context;
};
