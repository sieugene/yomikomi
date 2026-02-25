import { useRef } from "react";
import { toast } from "sonner";
import { OCR_ENGINES } from "../constants/ocr.engines";
import { OCRContextProps } from "../types";
import { isMemoryErrorMessage } from "@/shared/lib/isMemoryErrorMessage";

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


  const loadGutenyeOCR = async () =>
    window.GutenyeOCR.default.create(OCR_ENGINES.GUTENYE.options).then(
      (o) => {
        return o;
      },
      (e) => {
        const messageError =
          `${isMemoryErrorMessage(e?.message)}` ||
          "Error creating Gutenye OCR instance";
        toast.error(messageError);
        throw new Error(messageError);
      },
    );

  return {
    tesseractWorker: useRef<OCRContextProps["tesseractWorker"]>({
      load: loadTesseractWorker,
    }),
    gutenyeOCR: loadGutenyeOCR,
  };
};
