import React from "react";

import { EnhancedDictionaryLookup } from "./EnhancedDictionaryLookup";
import { DictionaryManagementSystem } from "./DictionaryManagementSystem";

interface Props {
  mode: "management" | "lookup";
  sentence?: string;
  baseBottom?: number;
}

export const DictionarySystemProvider: React.FC<Props> = ({
  mode,
  sentence = "",
  baseBottom = 0,
}) => {
  return (
    <div className="dictionary-system">
      <DictionaryManagementSystem />
      <EnhancedDictionaryLookup sentence={sentence} baseBottom={baseBottom} />
      <div style={{marginBottom: 100}}/>
    </div>
  );
};
