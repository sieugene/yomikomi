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
  interface Window {
    Tesseract: typeof Tesseract;
    __transformers: TransformesCDN;
  }
}
