import { OCRResponse } from "@/features/ocr/types";
import { Dispatch, SetStateAction } from "react";

export type UseOcrCopyReturn = ReturnType<typeof useOcrCopy>;
export const useOcrCopy = (
  setCopyFeedback: Dispatch<SetStateAction<string | null>>
) => {
  const handleCopyFullText = async (result: OCRResponse | null) => {
    if (!result?.full_text) return;
    try {
      await navigator.clipboard.writeText(result.full_text);
      setCopyFeedback("Full text copied!");
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyText = (text: string) => {
    setCopyFeedback(
      `Copied: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`
    );
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleReset = () => {
    setCopyFeedback(null);
  };
  return { handleCopyText, handleCopyFullText, handleReset };
};
