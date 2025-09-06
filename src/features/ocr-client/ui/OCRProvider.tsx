"use client";

import Script from "next/script";
import {
  createContext,
  ReactNode,
  useContext,
  useState
} from "react";

interface OCRContextProps {
  tesseractWorker: any | null;
  gutenyeOCR: any | null;
  ocrReady: boolean;
  createTesseractWorker: (lang?: string) => Promise<any>;
  createGutenyeOCR: () => Promise<any>;
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
  const [tesseractWorker, setTesseractWorker] = useState<any>(null);
  const [gutenyeOCR, setGutenyeOCR] = useState<any>(null);
  const [ocrReady, setOcrReady] = useState(false);

  const createTesseractWorker = async (lang: string = 'jpn') => {
    if (!window.Tesseract) {
      throw new Error("Tesseract is not loaded");
    }
    
    try {
      console.log(`Creating Tesseract worker for ${lang}...`);
      const worker = await window.Tesseract.createWorker(lang, 1, {
        logger: (m: any) => console.log('Tesseract:', m)
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
      debugger
      const ocr = await window.GutenyeOCR.default.create({
        models: {
          detectionPath: 'http://localhost:3000/ocr/ch_PP-OCRv4_det_infer.onnx',
          recognitionPath: 'http://localhost:3000/ocr/ch_PP-OCRv4_rec_infer.onnx',
          dictionaryPath: "http://localhost:3000/ocr/ppocr_keys_v1.txt"
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
        src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"
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

declare global {
  interface Window {
    Tesseract: any;
    GutenyeOCR: any;
  }
}