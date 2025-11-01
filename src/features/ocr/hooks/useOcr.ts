import { OCR_ENGINE } from "@/features/ocr-client/constants/ocr.engines";
import { useClientOCR } from "@/features/ocr-client/context/ClientOCRProvider";
import { getImageDimensions } from "@/features/ocr-client/lib/getImageDimensions";
import { OCRSettings, TEXT_ORIENTATION } from "@/features/ocr-settings/types";
import { PSM } from "tesseract.js";
import { OCRApi } from "../api/ocrApi";
import { adaptGutenyeOCR, adaptTesseractResult } from "../lib/adapter";
import { OCRResponse } from "../types";
import { rotateImage } from "@/features/ocr-client/lib/ImageProcessOptions";

export const useOcr = () => {
  const { tesseractWorker, gutenyeOCR } = useClientOCR();

  const processWithTesseract = async (
    imageFile: File,
    settings: OCRSettings
  ) => {
    try {
      console.log("Processing with Tesseract...");

      const worker = tesseractWorker;
      if (!tesseractWorker) {
        throw new Error("tesseractWorker is not inited!");
      }

      if (
        settings.textOrientation === TEXT_ORIENTATION.VERTICAL ||
        settings.japaneseVerticalMode
      ) {
        await worker!.setParameters({
          tessedit_pageseg_mode: PSM.SINGLE_BLOCK_VERT_TEXT,
          preserve_interword_spaces: "1",
        });
      } else {
        await worker!.setParameters({
          tessedit_pageseg_mode: PSM.AUTO,
          preserve_interword_spaces: "1",
        });
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
    let rawResult: OCRResponse;
    let processedFile = file;

    if (settings.isClientSide) {
      if (settings.clientEngine === OCR_ENGINE.TESSERACT) {
        // Tesseract: no preprocessing needed, use original
        const { width, height } = await getImageDimensions(file);
        const response = await processWithTesseract(file, settings);
        if (!response) throw new Error("Tesseract processing failed");

        rawResult = adaptTesseractResult(response, {
          width,
          height,
          format: file.type,
        });
      } else if (settings.clientEngine === OCR_ENGINE.GUTENYE) {
        // Gutenye: apply all processing in one pass
        const isVertical =
          settings.textOrientation === TEXT_ORIENTATION.VERTICAL ||
          settings.japaneseVerticalMode;

        const { rotatedFile: optimizedFile } = await rotateImage(
          file,
          isVertical ? -90 : 0
        );

        processedFile = optimizedFile;

        console.log("Image processed:");

        const { width, height } = await getImageDimensions(optimizedFile);
        const response = await processWithGutenye(optimizedFile);
        if (!response) throw new Error("GUTENYE processing failed");

        rawResult = adaptGutenyeOCR(response, {
          width,
          height,
          format: optimizedFile.type,
        });
      } else {
        throw new Error("Unknown client engine");
      }
    } else {
      // Server-side OCR: optionally preprocess for better quality
      // You can add preprocessing here too if needed
      rawResult = await OCRApi.performOCRWithPositions(
        file,
        settings.apiEndpoint,
        settings.bearerToken
      );
    }

    return {
      result: rawResult,
      resizedFile: processedFile,
    };
  };

  return { ocrProcess };
};
