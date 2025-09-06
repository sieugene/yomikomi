"use client";

import Script from "next/script";
import {
  createContext,
  ReactNode,
  useContext,
  useState
} from "react";
import Tesseract from "tesseract.js";

interface OCRContextProps {
  tesseractWorker: Tesseract.Worker | null;
  gutenyeOCR: Window["GutenyeOCR"]["instance"] | null;
  ocrReady: boolean;
  createTesseractWorker: (lang?: string) => Promise<Tesseract.Worker | null>;
  createGutenyeOCR: () => Promise<Window["GutenyeOCR"]["instance"] | null>;
}

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  gutenyeOCR: null,
  ocrReady: false,
  createTesseractWorker: async () => null,
  createGutenyeOCR: async () => null,
});

export const useOCR = () => useContext(OCRContext);

export function OCRProvider({ children }: { children: ReactNode }) {
  const [tesseractWorker, setTesseractWorker] = useState<Tesseract.Worker | null>(null);
  const [gutenyeOCR, setGutenyeOCR] = useState<Window["GutenyeOCR"]["instance"] | null>(null);
  const [ocrReady, setOcrReady] = useState(false);

  const createTesseractWorker = async (lang: string = 'jpn') => {
    if (!window.Tesseract) {
      throw new Error("Tesseract is not loaded");
    }
    
    try {
      console.log(`Creating Tesseract worker for ${lang}...`);
      const worker = await window.Tesseract.createWorker(lang, 1, {
        logger: (m) => console.log('Tesseract:', m)
      });
      
      setTesseractWorker(worker);
      return worker;
    } catch (error) {
      console.error('Failed to create Tesseract worker:', error);
      throw error;
    }
  };

  const createGutenyeOCR = async () => {
    if (!window.GutenyeOCR) {
      throw new Error("Gutenye OCR is not loaded");
    }
    
    try {
      console.log('Creating Gutenye OCR instance...');
      const ocr = await window.GutenyeOCR.default.create({
        models: {
          detectionPath: '/ocr/ch_PP-OCRv4_det_infer.onnx',
          recognitionPath: '/ocr/ch_PP-OCRv4_rec_infer.onnx',
          dictionaryPath: "/ocr/ppocr_keys_v1.txt"
        }
      });
      
      setGutenyeOCR(ocr);
      console.log('Gutenye OCR instance created successfully');
      return ocr;
    } catch (error) {
      console.error('Failed to create Gutenye OCR:', error);
      throw error;
    }
  };

  const handleScriptsLoaded = () => {
    console.log('All OCR scripts loaded');
    setOcrReady(true);
  };

  return (
    <OCRContext.Provider value={{ 
      tesseractWorker, 
      gutenyeOCR,
      ocrReady, 
      createTesseractWorker,
      createGutenyeOCR
    }}>

      <Script
        src="/tesseract/tesseract.min.js"
        strategy="afterInteractive"
      />
      
      <Script
        src="/ocr/ocr-browser.umd.js"
        strategy="afterInteractive"
        onLoad={handleScriptsLoaded}
      />
      
      {children}
    </OCRContext.Provider>
  );
}