import { OCRResponse } from "../types";

export class OCRApi {
  static async performOCRWithPositions(
    file: File,
    api_endpoint: string,
    bearerToken?: string
  ): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${api_endpoint}/ocr/with-positions/`, {
      method: "POST",
      body: formData,
      headers: {
        ...(bearerToken && {
          Authorization: `Bearer ${bearerToken}`,
        }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `OCR failed with status: ${response.status}`
      );
    }

    return await response.json();
  }

  static async performOCR(
    file: File,
    api_endpoint: string
  ): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${api_endpoint}/ocr/`, {
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
