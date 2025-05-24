"use client";
import { useEffect, useState } from "react";

type ImportType = {
  id: number;
  type: "file" | "link";
  name: string;
  // data (IndexDb)
};

export const useImports = () => {
  const [imports, setImports] = useState<ImportType[]>([]);

  const setImportsData = (data: ImportType) => {
    localStorage.setItem("imports", JSON.stringify([...imports, data]));
    setImports((prev) => [...prev, data]);
  };

  useEffect(() => {
    setImports(
      localStorage.getItem("imports")
        ? JSON.parse(localStorage.getItem("imports")!)
        : []
    );
  }, []);
  return { imports, setImportsData };
};
