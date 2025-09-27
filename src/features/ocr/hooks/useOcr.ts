import { OCR_ENGINE } from "@/features/ocr-client/constants/ocr.engines";
import { useClientOCR } from "@/features/ocr-client/context/ClientOCRProvider";
import { getImageDimensions } from "@/features/ocr-client/lib/getImageDimensions";
import { resizeImageLetterbox } from "@/features/ocr-client/lib/resizeImageLetterbox";
import { OCRSettings, TEXT_ORIENTATION } from "@/features/ocr-settings/types";
import { PSM } from "tesseract.js";
import { OCRApi } from "../api/ocrApi";
import { adaptGutenyeOCR, adaptTesseractResult } from "../lib/adapter";
import { rotateImage } from "../lib/rotateImage";
import { OCRResponse } from "../types";

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
        const { width, height } = await getImageDimensions(file);
        const response = await processWithTesseract(file, settings);
        if (!response) throw new Error("Tesseract processing failed");

        rawResult = adaptTesseractResult(response, {
          width,
          height,
          format: file.type,
        });
      } else if (settings.clientEngine === OCR_ENGINE.GUTENYE) {
        let fileForOCR = file;

        if (
          settings.textOrientation === TEXT_ORIENTATION.VERTICAL ||
          settings.japaneseVerticalMode
        ) {
          const rotateResult = await rotateImage(file, -90);
          fileForOCR = rotateResult.rotatedFile;
        }

        const resizedFile = await resizeImageLetterbox(fileForOCR, 960);
        processedFile = resizedFile;

        const { width, height } = await getImageDimensions(resizedFile);
        const response = await processWithGutenye(resizedFile);
        if (!response) throw new Error("GUTENYE processing failed");

        rawResult = adaptGutenyeOCR(response, {
          width,
          height,
          format: resizedFile.type,
        });
      } else {
        throw new Error("Unknown client engine");
      }
    } else {
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
