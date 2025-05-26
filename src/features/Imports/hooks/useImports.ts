"use client";
import { useAllCollections } from "@/features/Collection/hooks/useCollection";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type ImportType = {
  id: string;
  type: "file" | "link";
  name: string;
  // data (IndexDb)
};

export const useImports = () => {
  const data = useAllCollections();
  const [imports, setImports] = useState<ImportType[]>([]);

  const setImportsData = (data: Omit<ImportType, "id">) => {
    const uuid = uuidv4();
    const newData = { ...data, id: uuid };
    localStorage.setItem("imports", JSON.stringify([...imports, newData]));
    setImports((prev) => [...prev, newData]);
  };
  useEffect(() => {
    if (data.length) {
      // debugger;
    }
  }, [data]);

  useEffect(() => {
    setImports(
      localStorage.getItem("imports")
        ? JSON.parse(localStorage.getItem("imports")!)
        : []
    );
  }, []);
  return { imports, setImportsData };
};
