"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import Script from "next/script";
import { OCR_ENGINES } from "../constants/ocr.engines";
import { useOCRLoader } from "../hooks/useOCRLoader";
import { OCRContextProps } from "../types";

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  gutenyeOCR: null,
  isAllowed: false,
});

export const useClientOCR = () => useContext(OCRContext);

export function ClientOCRProvider({ children }: { children: ReactNode }) {
  const { settings } = useOCRSettings();
  const { gutenyeOCR, tesseractWorker } = useOCRLoader();
  const isAllowed = useMemo(
    () => settings.isClientSide,
    [settings.isClientSide],
  );

  const scripts = Object.values(OCR_ENGINES).map((a) => ({
    name: a.name,
    src: a.cdn,
  }));

  return (
    <OCRContext.Provider
      value={{
        tesseractWorker: tesseractWorker.current,
        gutenyeOCR,
        isAllowed,
      }}
    >
      {isAllowed &&
        scripts.map(({ src }) => (
          <Script key={src} src={src} strategy="afterInteractive" />
        ))}

      {children}
    </OCRContext.Provider>
  );
}
