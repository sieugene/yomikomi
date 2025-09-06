import Tesseract from "tesseract.js";

export {};

type GutenyeOCR = {
  detect: (
    image: File | string
  ) => Promise<{ text: string; confidence: number }[]>;
  new (options: { lang: string; workerPath: string }): {
    load: () => Promise<void>;
    recognize: (
      image: File | string
    ) => Promise<{ text: string; confidence: number }[]>;
    terminate: () => Promise<void>;
  };
};

declare global {
  interface Window {
    Tesseract: typeof Tesseract;
    GutenyeOCR: {
      instance?: GutenyeOCR;
      default: {
        create: (options: {
          models: {
            detectionPath: string;
            recognitionPath: string;
            dictionaryPath: string;
          };
        }) => Promise<GutenyeOCR>;
      };
    };
  }
}
