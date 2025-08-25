"use client";
import { useState } from "react";
import { OCRApi } from "../api/ocrApi";
import { OCRResponse } from "../types";

export const useOCR = () => {
  const [customApi, setCustomApi] = useState<undefined | string>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);

  const performOCR = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await OCRApi.performOCRWithPositions(file, customApi);
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "OCR failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    performOCR,
    result,
    isLoading,
    error,
    reset,
    setCustomApi,
  };
};
