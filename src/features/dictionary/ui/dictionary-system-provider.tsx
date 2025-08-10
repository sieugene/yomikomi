import React from "react";
import { EnhancedDictionaryLookup } from "./enhanced-dictionary-lookup";
import { DictionaryManagementSystem } from "./dictionary-management-system";

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
          <EnhancedDictionaryLookup
            sentence={sentence}
            baseBottom={baseBottom}
          />
        </div>
      )}

      <div style={{ marginBottom: 100 }} />
    </div>
  );
};
