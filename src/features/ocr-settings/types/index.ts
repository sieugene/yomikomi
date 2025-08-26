export interface OCRSettings {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
}

export interface OCRSettingsContextType {
  settings: OCRSettings;
  updateSettings: (settings: Partial<OCRSettings>) => void;
  resetToDefaults: () => void;
}

export const DEFAULT_OCR_SETTINGS: OCRSettings = {
  // TODO env
  apiEndpoint: "http://localhost:8000",
  timeout: 30000,
  retryAttempts: 3,
  batchSize: 5,
};
