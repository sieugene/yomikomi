import { useMemo, useState } from "react";
import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";
import { toast } from "sonner";

export const useOCRLoader = () => {
  const [tesseractWorker, setTesseractWorker] =
    useState<Tesseract.Worker | null>(null);
  const [gutenyeOCR, setGutenyeOCR] = useState<GutenyeOCR | null>(null);
  const createTesseractWorker = async (lang: string = "jpn") => {
    try {
      console.log("Tesseract worker creation started");
      const worker = await window.Tesseract.createWorker(lang, 1, {
        logger: (m) => console.log("Tesseract:", m),
      });
      console.log("Tesseract worker created successfully");
      setTesseractWorker(worker);
    } catch (error) {
      console.error("Error creating Tesseract worker:", error);
      return null;
    }
  };

  const createGutenyeOCR = async () => {
    try {
      console.log("Gutenye OCR instance creation started");
      const ocr = await window.GutenyeOCR.default.create(
        OCR_ENGINES.GUTENYE.options,
      );
      console.log("Gutenye OCR instance created successfully");
      setGutenyeOCR(ocr);
    } catch (error) {
      toast.error(
        (error as { message: string })?.message ||
          "Error creating Gutenye OCR instance",
      );
      console.error("Error creating Gutenye OCR instance:", error);
      return null;
    }
  };

  const loaders = useMemo(() => {
    return {
      [OCR_ENGINE.GUTENYE]: createGutenyeOCR,
      [OCR_ENGINE.TESSERACT]: createTesseractWorker,
    };
  }, []);

  return { loaders, tesseractWorker, gutenyeOCR };
};
