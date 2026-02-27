import type { PaddleOcrInstance } from '@oovz/esearch-ocr';

export interface OCRContextProps {
  tesseractWorker: null | {
    load: () => Promise<Tesseract.Worker | null>;
  };
  paddleOcr: null | {
    load: () => Promise<PaddleOcrInstance | null>;
  };
  isAllowed: boolean;
}
