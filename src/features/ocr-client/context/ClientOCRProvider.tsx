"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import Script from "next/script";
import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";
import { useOCRLoader } from "../hooks/useOCRLoader";
import { OCRContextProps } from "../types";
import { toast } from "sonner";

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
        gutenyeOCR: {
          load: () => window.GutenyeOCR.instance || null,
        },
        isAllowed,
      }}
    >
      {isAllowed &&
        scripts.map(({ src, name }) => (
          <Script
            key={src}
            src={src}
            strategy="afterInteractive"
            onLoad={async () => {
              if (OCR_ENGINES[OCR_ENGINE.GUTENYE].name === name) {
                try {
                  window.GutenyeOCR.instance = await gutenyeOCR();
                  toast.message("GUTENYE models inited");
                } catch (error) {
                  toast.message(
                    "The GUTENYE models failed to initialize. This may be related to device memory limitations. I recommend switching to the Tesseract model if errors continue to occur.",
                  );
                }
              }
            }}
          />
        ))}

      {children}
    </OCRContext.Provider>
  );
}
