import { OCR_ENGINE } from '@/features/ocr-client/constants/ocr.engines';
import { OCRSettings, TEXT_ORIENTATION } from '../types';

export const DEFAULT_OCR_SETTINGS: OCRSettings = {
  apiEndpoint: process.env.NEXT_PUBLIC_OCR_ENDPOINT || "",
  bearerToken: "",
  timeout: 30000,
  retryAttempts: 3,
  batchSize: 5,
  isClientSide: true,
  clientEngine: OCR_ENGINE.PADDLEOCR,
  textOrientation: TEXT_ORIENTATION.AUTO,
  japaneseVerticalMode: false,
};
