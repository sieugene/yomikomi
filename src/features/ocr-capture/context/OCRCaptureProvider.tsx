import {
  adaptGutenyeOCR,
  adaptTesseractResult,
} from "@/features/ocr-album/lib/adapter";
import { OCR_ENGINE } from "@/features/ocr-client/constants/ocr.engines";
import { useOCR } from "@/features/ocr-client/context/OCRProvider";
import { getImageDimensions } from "@/features/ocr-client/lib/getImageDimensions";
import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import { OCRApi } from "@/features/ocr/api/ocrApi";
import { OCRResponse } from "@/features/ocr/types";
import React, { createContext, ReactNode, useContext } from "react";

interface OCRCaptureContextType {
  performOCR: (file: File) => Promise<OCRResponse>;
  isReady: boolean;
}

const OCRCaptureContext = createContext<OCRCaptureContextType | undefined>(
  undefined
);

export const OCRCaptureProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { tesseractWorker, gutenyeOCR, ocrReady } = useOCR();
  const { settings } = useOCRSettings();

  const processWithTesseract = async (file: File): Promise<Tesseract.RecognizeResult> => {
    if (!tesseractWorker) {
      throw new Error("Tesseract worker not initialized");
    }
    return await tesseractWorker.recognize(file);
  };

  const processWithGutenye = async (file: File): Promise<GutenyeOCRResult> => {
    if (!gutenyeOCR) {
      throw new Error("Gutenye OCR not initialized");
    }

    const reader = new FileReader();
    const imageData: string = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return await gutenyeOCR.detect(imageData);
  };

  const performOCR = async (file: File): Promise<OCRResponse> => {
    try {
      let ocrResult: OCRResponse;

      if (settings.isClientSide) {
        const { width, height } = await getImageDimensions(file);
        const imageInfo = { width, height, format: file.type };

        if (settings.clientEngine === OCR_ENGINE.TESSERACT) {
          const response = await processWithTesseract(file);
          if (!response) throw new Error("Tesseract processing failed");
          ocrResult = adaptTesseractResult(response, imageInfo);
        } else if (settings.clientEngine === OCR_ENGINE.GUTENYE) {
          const response = await processWithGutenye(file);
          if (!response) throw new Error("Gutenye processing failed");
          ocrResult = adaptGutenyeOCR(response, imageInfo);
        } else {
          throw new Error("Unknown client OCR engine");
        }
      } else {
        // Use API
        ocrResult = await OCRApi.performOCRWithPositions(
          file,
          settings.apiEndpoint,
          settings.bearerToken
        );
      }

      return ocrResult;
    } catch (error) {
      console.error("OCR processing failed:", error);
      throw error;
    }
  };

  const value: OCRCaptureContextType = {
    performOCR,
    isReady: settings.isClientSide ? ocrReady : !!settings.apiEndpoint,
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
