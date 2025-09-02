import React from "react";

// TODO
import { DictionaryManagementSystem } from "@/entities/DictionaryManagementSystem/ui";
import { DictionaryLookup } from "@/entities/DictionaryLookup/ui";

interface DictionarySystemProviderProps {
  mode: "management" | "lookup" | "both";
  sentence?: string;
  baseBottom?: number;
}

export const DictionarySystemProvider: React.FC<
  DictionarySystemProviderProps
> = ({ mode, sentence = "", baseBottom = 0 }) => {
  return (
    <div className="dictionary-system">
      {(mode === "management" || mode === "both") && (
        <div className="mb-8">
          <DictionaryManagementSystem />
        </div>
      )}

      {(mode === "lookup" || mode === "both") && (
        <div className="mb-8">
          <DictionaryLookup sentence={sentence} baseBottom={baseBottom} />
        </div>
      )}

      <div style={{ marginBottom: 100 }} />
    </div>
  );
};
