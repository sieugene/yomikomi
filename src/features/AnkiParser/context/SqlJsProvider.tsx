// components/SqlJsProvider.tsx
"use client";

import Script from "next/script";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { SqlJsStatic } from "sql.js";

interface SqlJsContextProps {
  sqlClient: SqlJsStatic | null;
}

const SqlJsContext = createContext<SqlJsContextProps>({
  sqlClient: null,
});

export const useSqlJs = () => useContext(SqlJsContext);

export function SqlJsProvider({ children }: { children: ReactNode }) {
  const [sqlClient, setSqlClient] = useState<SqlJsStatic | null>(null);

  const createSqlClient = async () => {
    const initSqlJs = window.initSqlJs;
    if (!initSqlJs) {
      throw new Error("initSqlJs is not defined");
    }
    if (!initSqlJs) return;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `/sql.js/${file}`,
    });
    setSqlClient(SQL);
  };

  return (
    <SqlJsContext.Provider value={{ sqlClient }}>
      <Script
        src="/sql.js/sql-wasm.js"
        strategy="afterInteractive"
        onLoad={() => {
          createSqlClient();
        }}
      />
      {children}
    </SqlJsContext.Provider>
  );
}
