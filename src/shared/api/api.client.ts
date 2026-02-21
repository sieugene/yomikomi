import { ApiResponse } from "@/infrastructure/api/types";

const API_ENDPOINTS = {
  health: "/api/health",
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
