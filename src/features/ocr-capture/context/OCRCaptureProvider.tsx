import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import { useOcr } from "@/features/ocr/hooks/useOcr";
import { OCRResponse } from "@/features/ocr/types";
import React, { createContext, ReactNode, useContext } from "react";

interface OCRCaptureContextType {
  performOCR: (file: File) => Promise<OCRResponse>;
}

const OCRCaptureContext = createContext<OCRCaptureContextType | undefined>(
  undefined,
);

export const OCRCaptureProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { ocrProcess } = useOcr();
  const { settings } = useOCRSettings();

  const performOCR = async (file: File): Promise<OCRResponse> => {
    try {
      const { result } = await ocrProcess(file, settings);

      return result;
    } catch (error) {
      console.error("OCR processing failed:", error);
      throw error;
    }
  };

  const value: OCRCaptureContextType = {
    performOCR,
  };

  return (
    <OCRCaptureContext.Provider value={value}>
      {children}
    </OCRCaptureContext.Provider>
  );
};

export const useOCRCapture = () => {
  const context = useContext(OCRCaptureContext);
  if (!context) {
    throw new Error("useOCRCapture must be used within OCRCaptureProvider");
  }
  return context;
};
