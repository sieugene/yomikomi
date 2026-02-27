"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import Script from "next/script";
import { OCR_ENGINES } from "../constants/ocr.engines";
import { useOCRLoader } from "../hooks/useOCRLoader";
import { OCRContextProps } from "../types";

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  paddleOcr: null,
  isAllowed: false,
});

export const useClientOCR = () => useContext(OCRContext);

export function ClientOCRProvider({ children }: { children: ReactNode }) {
  const { settings } = useOCRSettings();
  const { paddleOcr, tesseractWorker } = useOCRLoader();
  const isAllowed = useMemo(
    () => settings.isClientSide,
    [settings.isClientSide],
  );

  return (
    <OCRContext.Provider
      value={{
        tesseractWorker: tesseractWorker.current,
        paddleOcr,
        isAllowed,
      }}
    >
      {isAllowed && (
        <Script
          src={OCR_ENGINES["TESSERACT"].cdn}
          strategy="afterInteractive"
        />
      )}

      {children}
    </OCRContext.Provider>
  );
}
