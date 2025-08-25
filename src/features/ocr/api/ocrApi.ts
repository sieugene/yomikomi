import { OCRResponse } from "../types";

const OCR_BASE_URL = "http://localhost:8000";

export class OCRApi {
  static async performOCRWithPositions(
    file: File,
    // TODO temporarily allow custom endpoint for testing purposes
    _api_endpoint?: string
  ): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${_api_endpoint || OCR_BASE_URL}/ocr/with-positions/`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `OCR failed with status: ${response.status}`
      );
    }

    return await response.json();
  }

  static async performOCR(file: File): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${OCR_BASE_URL}/ocr/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `OCR failed with status: ${response.status}`
      );
    }

    return await response.json();
  }
}
