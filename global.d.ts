import Tesseract from "tesseract.js";

import type { pipeline, env } from "@xenova/transformers";
export type PipelineTransformers = typeof pipeline;
export type EnvTransformers = typeof env;
export type TransformesCDN = {
  pipeline: PipelineTransformers;
  env: EnvTransformers;
};

export {};

declare global {
  // Define the GutenyeOCR type
  type GutenyeOCRCreateOptions = {
    models: {
      detectionPath: string;
      recognitionPath: string;
      dictionaryPath: string;
    };
  };
  type Point = [number, number];
  interface OCRBox {
    mean: number;
    text: string;
    box: [Point, Point, Point, Point];
  }
  type GutenyeOCRResult = OCRBox[];

  type GutenyeOCR = {
    detect: (image: File | string) => Promise<GutenyeOCRResult>;
  };
  // Extend the Window interface
  interface Window {
    Tesseract: typeof Tesseract;
    GutenyeOCR: {
      instance?: GutenyeOCR;
      default: {
        create: (options: GutenyeOCRCreateOptions) => Promise<GutenyeOCR>;
      };
    };
    __transformers: TransformesCDN;
  }
}
