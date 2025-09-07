import { OCR_ENGINE } from "@/features/ocr-client/constants/ocr.engines";

export interface OCRSettings {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
  bearerToken: string;
  isClientSide: boolean;
  clientEngine: OCR_ENGINE;
}

export interface OCRSettingsContextType {
  settings: OCRSettings;
  updateSettings: (settings: Partial<OCRSettings>) => void;
  resetToDefaults: () => void;
}

export const DEFAULT_OCR_SETTINGS: OCRSettings = {
  apiEndpoint: process.env.NEXT_PUBLIC_OCR_ENDPOINT || "",
  bearerToken: "",
  timeout: 30000,
  retryAttempts: 3,
  batchSize: 5,
  isClientSide: true,
  clientEngine: OCR_ENGINE.TESSERACT,
};
