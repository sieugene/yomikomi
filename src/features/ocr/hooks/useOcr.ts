import { OCR_ENGINE } from "@/features/ocr-client/constants/ocr.engines";
import { useClientOCR } from "@/features/ocr-client/context/ClientOCRProvider";
import { getImageDimensions } from "@/features/ocr-client/lib/getImageDimensions";
import { resizeImageLetterbox } from "@/features/ocr-client/lib/resizeImageLetterbox";
import { OCRSettings } from "@/features/ocr-settings/types";
import { OCRApi } from "../api/ocrApi";
import { adaptGutenyeOCR, adaptTesseractResult } from "../lib/adapter";
import { OCRResponse } from "../types";

export const useOcr = () => {
  const { tesseractWorker, gutenyeOCR } = useClientOCR();
  const processWithTesseract = async (imageFile: File) => {
    try {
      console.log("Processing with Tesseract...");

      const worker = tesseractWorker;
      if (!tesseractWorker) {
        throw new Error("tesseractWorker is not inited!");
      }

      console.log("Running Tesseract OCR...");
      const data = await worker?.recognize(imageFile);

      return data;
    } catch (error) {
      console.error("Tesseract Error:", error);
    }
  };

  const processWithGutenye = async (imageFile: File) => {
    try {
      const ocr = gutenyeOCR;

      if (!ocr) {
        throw new Error("gutenyeOCR is not inited");
      }

      const reader = new FileReader();
      const imageData: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const results = await ocr!.detect(imageData);
      console.log("Gutenye Results:", results);

      return results;
    } catch (error) {
      console.error("Gutenye OCR Error:", error);
    }
  };

  const ocrProcess = async (
    file: File,
    settings: OCRSettings
  ): Promise<{ result: OCRResponse; resizedFile: File }> => {
    if (settings.isClientSide) {
      if (settings.clientEngine === OCR_ENGINE.TESSERACT) {
        const { width, height } = await getImageDimensions(file);
        const response = await processWithTesseract(file);
        if (!response) throw new Error("Tesseract processing failed");

        const result = adaptTesseractResult(response, {
          width,
          height,
          format: file.type,
        });
        return { result, resizedFile: file };
      }
      if (settings.clientEngine === OCR_ENGINE.GUTENYE) {
        const resizedFile = await resizeImageLetterbox(file, 960);
        const { width, height } = await getImageDimensions(resizedFile);
        const response = await processWithGutenye(resizedFile);
        if (!response) throw new Error("GUTENYE processing failed");
        return {
          result: adaptGutenyeOCR(response, {
            width,
            height,
            format: resizedFile.type,
          }),
          resizedFile,
        };
      }
    }
    const response = await OCRApi.performOCRWithPositions(
      file,
      settings.apiEndpoint,
      settings.bearerToken
    );
    return {
      result: response,
      resizedFile: file,
    };
  };
  return { ocrProcess };
};
