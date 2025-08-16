// StoreCollectionContext.tsx
import React, { createContext, useContext, useState } from "react";

type DictionarySearchSettingsContextType = {
  deepSearchMode: boolean;
  toggleDeepSearch: () => void;
};

const DictionarySearchSettingsContext = createContext<
  DictionarySearchSettingsContextType | undefined
>(undefined);

export const DictionarySearchSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [deepSearchMode, setDeepSearchMode] = useState(false);

  return (
    <DictionarySearchSettingsContext.Provider
      value={{
        deepSearchMode,
        toggleDeepSearch: () => setDeepSearchMode(!deepSearchMode),
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
