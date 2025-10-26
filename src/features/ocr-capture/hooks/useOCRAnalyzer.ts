import { useState, useCallback } from "react";
import { useOcr } from "@/features/ocr/hooks/useOcr";
import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import { toast } from "sonner";
import { SelectionArea } from "../types";
import { SELECTION } from "../lib/constants";
import { getSelectionBounds, isSelectionValid } from "../lib/coordinates";
import { cropImageToFile } from "../lib/canvas";

export const useOCRAnalyzer = () => {
  const { ocrProcess } = useOcr();
  const { settings } = useOCRSettings();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(
    async (
      selection: SelectionArea | null,
      imageElement: HTMLImageElement | null,
      fileName: string,
      fileType: string
    ): Promise<string | null> => {
      if (!selection || !imageElement) {
        return null;
      }

      const bounds = getSelectionBounds(
        selection.startX,
        selection.startY,
        selection.endX,
        selection.endY
      );

      if (!isSelectionValid(bounds, SELECTION.MIN_SIZE)) {
        toast.error("Selection area is too small");
        return null;
      }

      setIsAnalyzing(true);

      try {
        const croppedFile = await cropImageToFile({
          imageElement,
          bounds,
          fileName,
          fileType,
        });

        const response = await ocrProcess(croppedFile, settings);

        if (!response.result.full_text || response.result.full_text.trim().length === 0) {
          toast.warning("No text detected in selected area");
          return null;
        }

        toast.success("Text extracted successfully!");
        return response.result.full_text;
      } catch (error) {
        console.error("OCR analysis error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to analyze image"
        );
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [ocrProcess, settings]
  );

  return { analyze, isAnalyzing };
};