
export type ScriptStatus = "pending" | "loading" | "ready" | "failed";
export type Prefers = "ask" | "allow";

export interface OCRContextProps {
  tesseractWorker: Tesseract.Worker | null;
  gutenyeOCR: GutenyeOCR | null;
  ocrReady: boolean;
  setConsent: (newConsent: Prefers) => void;
  showAlert: () => void
}
