import { OCRResponse } from "../types";
import { TEXT_ORIENTATION } from "@/features/ocr-settings/types";

export class OCRApi {
  static async performOCRWithPositions(
    file: File,
    api_endpoint: string,
    bearerToken?: string,
    textOrientation?: TEXT_ORIENTATION,
    japaneseVerticalMode?: boolean
  ): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append("file", file);

    if (textOrientation) {
      formData.append("text_orientation", textOrientation);
    }
    if (japaneseVerticalMode !== undefined) {
      formData.append(
        "japanese_vertical_mode",
        japaneseVerticalMode.toString()
      );
    }

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
    api_endpoint: string,
    textOrientation?: TEXT_ORIENTATION,
    japaneseVerticalMode?: boolean
  ): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append("file", file);

    if (textOrientation) {
      formData.append("text_orientation", textOrientation);
    }
    if (japaneseVerticalMode !== undefined) {
      formData.append(
        "japanese_vertical_mode",
        japaneseVerticalMode.toString()
      );
    }

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
