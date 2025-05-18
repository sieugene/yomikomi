import { ApiResponse, ImportFormData } from "@/infrastructure/api/types";

const API_ENDPOINTS = {
  base: "/api/import",
  import: "/api/import",
  media: (filename: string) => `/api/media/${filename}`,
  notes: "/api/notes",
  collection: (collectionId: string) => `/api/collection/${collectionId}`,
  collections: `/api/collection`,
  health: "/api/health",
};

class Api {
  constructor() {}

  // Import
  async upload(formData: ImportFormData) {
    const form = new FormData();

    if (formData.file) {
      form.append("file", formData.file);
    }

    if (formData.collectionName) {
      form.append("collectionName", formData.collectionName);
    }
    const response = await fetch(API_ENDPOINTS.import, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      throw new Error("Failed to upload file");
    }
    const json = (await response.json()) as ApiResponse["Import"];
    return json;
  }

  // Collection
  async getCollectionById(collectionId: string) {
    const response = await fetch(API_ENDPOINTS.collection(collectionId));
    if (!response.ok) {
      throw new Error("Failed to get collection by id");
    }
    const json = (await response.json()) as ApiResponse["Collection"]["ById"];
    return json;
  }

  async getAllCollections() {
    const response = await fetch(API_ENDPOINTS.collections);
    if (!response.ok) {
      throw new Error("Failed to get all collections");
    }
    const json = (await response.json()) as ApiResponse["Collection"]["All"];
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
