import * as ocr from "@oovz/esearch-ocr";
import * as ort from "onnxruntime-web";
import { useRef } from "react";
import { OCRContextProps } from "../types";
import type { PaddleOcrInstance } from "@oovz/esearch-ocr";
import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";

export const useOCRLoader = () => {
  const tesseractRef = useRef<Tesseract.Worker | null>(null);
  const tesseractPromise = useRef<Promise<typeof tesseractRef.current> | null>(
    null,
  );

  const loadTesseractWorker = async (lang = "jpn") =>
    tesseractRef.current ??
    (tesseractPromise.current ??= window.Tesseract.createWorker(lang, 1).then(
      (w) => (tesseractRef.current = w),
      () => null,
    ));

  const loadPaddleOCR = async (): Promise<PaddleOcrInstance> => {
    const initOptions = await OCR_ENGINES[OCR_ENGINE.PADDLEOCR].options(ort);

    return ocr.init(initOptions);
  };

  return {
    tesseractWorker: useRef<OCRContextProps["tesseractWorker"]>({
      load: loadTesseractWorker,
    }),
    paddleOcr: {
      load: loadPaddleOCR,
    },
  };
};
