import { useState } from "react";
import { FuriganaMode } from "../types";

const FURIGANA_MODE_KEY = "interactiveSentence.furiganaMode";

export const useFuriganaMode = () => {
  const [furiganaMode, setFuriganaMode] = useState<FuriganaMode>(() => {
    try {
      return (
        (localStorage.getItem(FURIGANA_MODE_KEY) as FuriganaMode) || "hiragana"
      );
    } catch {
      return "hiragana";
    }
  });

  const handleModeChange = (mode: FuriganaMode) => {
    setFuriganaMode(mode);
    try {
      localStorage.setItem(FURIGANA_MODE_KEY, mode);
    } catch {
      // ignore
    }
  };
  return { furiganaMode, handleModeChange };
};
