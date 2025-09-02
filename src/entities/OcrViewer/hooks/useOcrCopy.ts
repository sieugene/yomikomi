import { OCRResponse } from "@/features/ocr/types";

export type UseOcrCopyReturn = ReturnType<typeof useOcrCopy>;
export const useOcrCopy = () => {
  const handleCopyFullText = async (result: OCRResponse | null) => {
    if (!result?.full_text) return;
    try {
      await navigator.clipboard.writeText(result.full_text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return {  handleCopyFullText };
};
