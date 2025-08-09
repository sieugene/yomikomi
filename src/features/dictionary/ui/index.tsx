import React from "react";
import { DictionarySystemProvider } from "./DictionarySystemProvider";

type Props = {
  sentence: string;
  baseBottom: number;
};
export const DictionaryLookup: React.FC<Props> = ({ sentence, baseBottom }) => {
  return (
    <>
      <DictionarySystemProvider mode="lookup" sentence={sentence} />
    </>
  );
};
