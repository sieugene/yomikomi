import type { SearchResult } from "@/features/dictionary-search/types";

export function dedupeAndSort(results: SearchResult[]): SearchResult[] {
  const map = new Map<string, SearchResult>();

  for (const r of results) {
    const key = `${r.word}|${r.reading ?? ""}|${r.source ?? ""}`;
    const existing = map.get(key);
    if (!existing || (r.relevanceScore ?? 0) > (existing.relevanceScore ?? 0)) {
      map.set(key, r);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
  );
}
