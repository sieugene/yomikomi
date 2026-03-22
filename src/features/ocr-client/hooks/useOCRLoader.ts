import * as ocr from "@oovz/esearch-ocr";
import * as ort from "onnxruntime-web";
import { useRef } from "react";
import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";
import { OCRContextProps } from "../types";
import type { PaddleOcrInstance } from "@oovz/esearch-ocr";

ort.env.wasm.numThreads = 1
ort.env.webgpu.powerPreference = "low-power"

export const useOCRLoader = () => {
  const tesseractRef = useRef<Tesseract.Worker | null>(null);
  const tesseractPromise = useRef<Promise<typeof tesseractRef.current> | null>(
    null,
  );
  const paddleOcrRef = useRef<PaddleOcrInstance | null>(null);

  const loadTesseractWorker: OCRContextProps["tesseractWorker"]["load"] =
    async (lang = "jpn") =>
      tesseractRef.current ??
      (tesseractPromise.current ??= window.Tesseract.createWorker(lang, 1).then(
        (w) => (tesseractRef.current = w),
        () => null,
      ));

  const loadPaddleOCR: OCRContextProps["paddleOcr"]["load"] = async () => {
    if (paddleOcrRef.current) return paddleOcrRef.current;
    const initOptions = await OCR_ENGINES[OCR_ENGINE.PADDLEOCR].options(ort);
    const instance = await ocr.init(initOptions);
    paddleOcrRef.current = instance;
    return instance;
  };

  return {
    tesseractWorker: {
      load: loadTesseractWorker,
    },
    paddleOcr: {
      load: loadPaddleOCR,
    },
  };
};
