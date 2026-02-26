import { useRef } from "react";
import { toast } from "sonner";
import { OCR_ENGINES } from "../constants/ocr.engines";
import { OCRContextProps } from "../types";
import { isMemoryErrorMessage } from "@/shared/lib/isMemoryErrorMessage";
import * as ocr from "@oovz/esearch-ocr";
import * as ort from "onnxruntime-web";

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
    const dicResponse = await fetch("/ocr/japan_dict.txt");
    const decodeDic = await dicResponse.text();

    const ocrInstance = await ocr.init({
      ort,
      det: { input: "/ocr/ppocr_v5_mobile_det.onnx" },
      rec: {
        input: "/ocr/japan_rec.onnx",
        decodeDic,
        optimize: { space: false },
      },
    }) as PaddleOcrInstance;
    return ocrInstance;
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
