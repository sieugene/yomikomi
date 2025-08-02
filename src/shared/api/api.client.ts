import { ApiResponse } from "@/infrastructure/api/types";

const API_ENDPOINTS = {
  health: "/api/health",
};

class Api {
  constructor() {}

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
