// StoreCollectionContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type DictionarySearchSettingsContextType = {
  deepSearchMode: boolean;
  toggleDeepSearch: () => void;
};

const DictionarySearchSettingsContext = createContext<
  DictionarySearchSettingsContextType | undefined
>(undefined);

const DEEP_SEARCH_KEY = "dictionarySearch.deepSearchMode";

export const DictionarySearchSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [deepSearchMode, setDeepSearchMode] = useState(false);

  useEffect(() => {
    const isDeepSearch = localStorage.getItem(DEEP_SEARCH_KEY) === "true";
    if (isDeepSearch) {
      setDeepSearchMode(isDeepSearch);
    }
  }, []);

  return (
    <DictionarySearchSettingsContext.Provider
      value={{
        deepSearchMode,
        toggleDeepSearch: () => {
          const nextVal = !deepSearchMode;
          localStorage.setItem(DEEP_SEARCH_KEY, nextVal ? "true" : "false");
          setDeepSearchMode(nextVal);
        },
      }}
    >
      {children}
    </DictionarySearchSettingsContext.Provider>
  );
};

export const useStoreDictionarySearchSettings = () => {
  const context = useContext(DictionarySearchSettingsContext);
  if (!context) {
    throw new Error(
      "useStoreDictionarySearchSettings must be used within a DictionarySearchSettingsProvider"
    );
  }
  return context;
};
