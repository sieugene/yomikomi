import { DictionaryEntry } from "@/services/Dictionary/model/DictionaryLookup";
import { IpadicFeatures } from "kuromoji";

// Main
export type ServiceStatus = "online" | "offline";
export type Services = "database";

// Health
export type HealthResponse = {
  status: number;
  services: {
    database: ServiceStatus;
  };
};

// Dict-lookup
export type DictLookupResponse = {
  dictionaryResult: DictionaryEntry[];
  words: string[];
  tokens: IpadicFeatures[];
  status: number;
};
export type DictLookupErrorResponse = {
  status: number;
  error: string;
};

// API Response Types

export type ApiResponse = {
  Health: {
    GET: HealthResponse;
  };
  DictLookup: {
    GET: DictLookupResponse;
  };
};
