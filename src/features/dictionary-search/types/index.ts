import { DictionaryEntry } from "@/features/dictionary/types";

export interface SearchOptions {
  deepMode: boolean;
  maxResults: number;
  includePartialMatches: boolean;
  includeSubstrings: boolean;
}

export type SearchResultMatchType = "exact" | "partial" | "substring";
export interface SearchResult extends DictionaryEntry {
  source: string;
  relevanceScore: number;
  matchType: SearchResultMatchType;
}
