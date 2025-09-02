import { ApiResponse } from "@/infrastructure/api/types";
import { IpadicFeatures } from "kuromoji";

const API_ENDPOINTS = {
  health: "/api/health",
  dictLookup: "api/dict-lookup",
  ocr: "http://localhost:8000/ocr/with-positions/",
};

class Api {
  constructor() {}

  // OCR
  async performOCR(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_ENDPOINTS.ocr, {
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

  // TODO deprecated
  // Dict-lookup
  async lookupDictionary(sentence: string, tokens: IpadicFeatures[]) {
    const response = await fetch(`${API_ENDPOINTS.dictLookup}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokens: tokens,
        sentence: encodeURIComponent(sentence),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dictionary lookup");
    }

    const json = (await response.json()) as ApiResponse["DictLookup"]["GET"];

    return json;
  }

  // Health
  async getHealth() {
    const response = await fetch(API_ENDPOINTS.health);
    if (!response.ok) {
      throw new Error("Failed to get health");
    }
    const json = (await response.json()) as ApiResponse["Health"]["GET"];
    return json;
  }
}

export const ApiClient = new Api();
