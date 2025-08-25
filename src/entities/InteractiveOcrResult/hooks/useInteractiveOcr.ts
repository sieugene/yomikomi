import { TextBlock } from "@/features/ocr/types";
import { useState } from "react";

export const useInteractiveOcr = () => {
  const [selectedTextBlock, setSelectedTextBlock] = useState<TextBlock | null>(
    null
  );
  const handleTextBlockClick = (textBlock: TextBlock) => {
    setSelectedTextBlock(textBlock);
  };

  const handleReset = () => {
    setSelectedTextBlock(null);
  };
  return { handleReset, handleTextBlockClick, selectedTextBlock };
};
