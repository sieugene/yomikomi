import { OCR_ENGINE } from "@/features/ocr-client/constants/ocr.engines";

export enum TEXT_ORIENTATION {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
  AUTO = "auto",
}

export interface OCRSettings {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
  bearerToken: string;
  isClientSide: boolean;
  clientEngine: OCR_ENGINE;
  textOrientation: TEXT_ORIENTATION;
  japaneseVerticalMode: boolean;
}

export interface OCRSettingsContextType {
  settings: OCRSettings;
  updateSettings: (settings: Partial<OCRSettings>) => void;
  resetToDefaults: () => void;
}
