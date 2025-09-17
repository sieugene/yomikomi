import { Dispatch, SetStateAction } from "react";

export type ScriptStatus = "pending" | "loading" | "ready" | "failed";
export type Prefers = "skip" | "ask" | "allow";

export interface OCRContextProps {
  tesseractWorker: Tesseract.Worker | null;
  gutenyeOCR: GutenyeOCR | null;
  ocrReady: boolean;
  setConsent: Dispatch<SetStateAction<Prefers>>;
}
