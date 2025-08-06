import { useEffect, useRef, useState } from "react";
import {
  DictionariesStorage,
  DictionariesStorageState,
} from "../model/DictionariesStorage";

export const useDictionariesStorage = () => {
  const [state, setState] = useState<DictionariesStorageState>({ data: [] });

  const store = useRef(
    new DictionariesStorage((store) => {
      setState(store);
      return store;
    })
  );

  useEffect(() => {
    store.current.init();
  }, []);
  return { store, state };
};
