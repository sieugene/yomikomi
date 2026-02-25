export interface OCRContextProps {
  tesseractWorker: null | {
    load: () => Promise<Tesseract.Worker | null>;
  };
  gutenyeOCR: null | {
    load: () => GutenyeOCR | null;
  };
  isAllowed: boolean;
}
