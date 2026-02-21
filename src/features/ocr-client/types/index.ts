export interface OCRContextProps {
  tesseractWorker: null | {
    load: () => Promise<Tesseract.Worker | null>;
  };
  gutenyeOCR: null | {
    load: () => Promise<GutenyeOCR | null>;
  };
  isAllowed: boolean;
}
