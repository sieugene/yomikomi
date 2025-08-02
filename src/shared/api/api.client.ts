import { ApiResponse } from "@/infrastructure/api/types";

const API_ENDPOINTS = {
  health: "/api/health",
  dictLookup: "api/dict-lookup",
};

class Api {
  constructor() {}

  // Dict-lookup
  async lookupDictionary(sentence: string) {
    const response = await fetch(
      `${API_ENDPOINTS.dictLookup}?sentence=${encodeURIComponent(sentence)}`
    );

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
