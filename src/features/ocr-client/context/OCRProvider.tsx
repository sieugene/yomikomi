"use client";

import Script from "next/script";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import Tesseract from "tesseract.js";
import { OCR_ENGINES } from "../constants/ocr.engines";

interface OCRContextProps {
  tesseractWorker: Tesseract.Worker | null;
  gutenyeOCR: GutenyeOCR | null;
  ocrReady: boolean;
}

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  gutenyeOCR: null,
  ocrReady: false,
});

export const useClienOCR = () => useContext(OCRContext);

export function OCRProvider({ children }: { children: ReactNode }) {
  const [tesseractWorker, setTesseractWorker] =
    useState<Tesseract.Worker | null>(null);
  const [gutenyeOCR, setGutenyeOCR] = useState<GutenyeOCR | null>(null);

  const createTesseractWorker = async (lang: string = "jpn") => {
    if (!window.Tesseract) {
      throw new Error("Tesseract is not loaded");
    }

    try {
      console.log(`Creating Tesseract worker for ${lang}...`);
      const worker = await window.Tesseract.createWorker(lang, 1, {
        logger: (m) => console.log("Tesseract:", m),
      });

      setTesseractWorker(worker);
      return worker;
    } catch (error) {
      console.error("Failed to create Tesseract worker:", error);
      throw error;
    }
  };

  const createGutenyeOCR = async () => {
    if (!window.GutenyeOCR) {
      throw new Error("Gutenye OCR is not loaded");
    }

    try {
      console.log("Creating Gutenye OCR instance...");
      const ocr = await window.GutenyeOCR.default.create(
        OCR_ENGINES.GUTENYE.options
      );

      setGutenyeOCR(ocr);
      console.log("Gutenye OCR instance created successfully");
      return ocr;
    } catch (error) {
      console.error("Failed to create Gutenye OCR:", error);
      throw error;
    }
  };

  const ocrReady = useMemo(() => {
    return !!gutenyeOCR && !!tesseractWorker;
  }, [gutenyeOCR, tesseractWorker]);

  return (
    <OCRContext.Provider
      value={{
        tesseractWorker,
        gutenyeOCR,
        ocrReady,
      }}
    >
      <Script
        src={OCR_ENGINES.TESSERACT.cdn}
        strategy="afterInteractive"
        onLoad={async () => {
          await createTesseractWorker();
        }}
      />

      <Script
        src={OCR_ENGINES.GUTENYE.cdn}
        strategy="afterInteractive"
        onLoad={async () => {
          await createGutenyeOCR();
        }}
      />

      {children}
    </OCRContext.Provider>
  );
}
