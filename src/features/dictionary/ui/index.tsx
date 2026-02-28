import { DictionarySearchSettingsProvider } from "@/features/dictionary-search/context/DictionarySearchContext";
import React from "react";
import { DictionarySystemProvider } from "./DictionarySystemProvider";

interface DictionaryLookupProps {
  sentence: string;
  baseBottom?: number;
}

export const DictionaryLookup: React.FC<DictionaryLookupProps> = ({
  sentence,
  baseBottom = 0,
}) => {
  return (
    <DictionarySearchSettingsProvider>
      <DictionarySystemProvider
        mode="both"
        sentence={sentence}
        baseBottom={baseBottom}
      />
    </DictionarySearchSettingsProvider>
  );
};
