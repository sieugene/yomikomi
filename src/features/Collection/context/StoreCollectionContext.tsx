// StoreCollectionContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CollectionStore,
  CollectionStoreState,
} from "../model/collection-store";
import { FileStoreManager } from "@/features/StoreManager/model/FileStoreManager";

type StoreCollectionContextType = {
  state: CollectionStoreState;
  add: CollectionStore["add"];
  getStoreManager: CollectionStore["getStoreManager"];
};

const StoreCollectionContext = createContext<
  StoreCollectionContextType | undefined
>(undefined);

export const StoreCollectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<CollectionStoreState>({ data: [] });

  const store = useRef(
    new CollectionStore(new FileStoreManager(), (store) => {
      setState(store);
      return store;
    })
  );

  useEffect(() => {
    store.current.init();
  }, []);

  return (
    <StoreCollectionContext.Provider
      value={{
        state,
        add: store.current.add.bind(store.current),
        getStoreManager: store.current.getStoreManager.bind(store.current),
      }}
    >
      {children}
    </StoreCollectionContext.Provider>
  );
};

export const useStoreCollection = () => {
  const context = useContext(StoreCollectionContext);
  if (!context) {
    throw new Error(
      "useStoreCollection must be used within a StoreCollectionProvider"
    );
  }
  return context;
};
