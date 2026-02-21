import { useRef } from "react";
import { toast } from "sonner";
import { OCR_ENGINES } from "../constants/ocr.engines";
import { OCRContextProps } from "../types";

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

  const gutenyeRef = useRef<GutenyeOCR | null>(null);
  const gutenyePromise = useRef<Promise<typeof gutenyeRef.current> | null>(
    null,
  );

  const loadGutenyeOCR = async () =>
    gutenyeRef.current ??
    (gutenyePromise.current ??= window.GutenyeOCR.default
      .create(OCR_ENGINES.GUTENYE.options)
      .then(
        (o) => (gutenyeRef.current = o),
        (e) => {
          toast.error(e?.message || "Error creating Gutenye OCR instance");
          return null;
        },
      ));

  return {
    tesseractWorker: useRef<OCRContextProps["tesseractWorker"]>({
      load: loadTesseractWorker,
    }),
    gutenyeOCR: useRef<OCRContextProps["gutenyeOCR"]>({ load: loadGutenyeOCR }),
  };
};
