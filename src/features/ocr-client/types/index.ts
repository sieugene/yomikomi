import type { PaddleOcrInstance } from "@oovz/esearch-ocr";

export interface OCRContextProps {
  tesseractWorker: {
    load: () => Promise<Tesseract.Worker | null>;
  };
  paddleOcr: {
    load: () => Promise<PaddleOcrInstance | null>;
  };
  isAllowed: boolean;
}
