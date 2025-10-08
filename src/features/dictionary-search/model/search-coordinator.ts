import { DictionaryEntry } from "@/features/dictionary/types";
import { SEARCH_LIMITS } from "../lib/constants";
import { SearchOptions, SearchResult } from "../types";
import { EnhancedDictionarySearchEngine } from "./enhanced-search-engine";

export class DictionarySearchCoordinator {
  private engines = new Map<
    string,
    {
      engine: EnhancedDictionarySearchEngine;
      type: "standard" | "kanji";
    }
  >();

  addEngine(
    dictId: string,
    engine: EnhancedDictionarySearchEngine,
    dictionaryType: "standard" | "kanji" = "standard"
  ): void {
    this.engines.get(dictId)?.engine.close();
    this.engines.set(dictId, { engine, type: dictionaryType });
  }

  removeEngine(dictId: string): void {
    const entry = this.engines.get(dictId);
    if (entry) {
      entry.engine.close();
      this.engines.delete(dictId);
    }
  }

  public async checkTokensAsync(tokens: string[]): Promise<DictionaryEntry[]> {
    const results: DictionaryEntry[] = [];

    for (const dict of this.engines.values()) {
      const entries = dict.engine.hasTokenBulk(tokens);
      if (entries.length > 0) results.push(...entries);
    }

    return results;
  }

  searchSingleToken(searchTerm: string, options: SearchOptions) {
    const tasks: (() => Promise<SearchResult[]>)[] = [];

    console.log(
      `Searching "${searchTerm}" in ${this.engines.size} dictionaries`
    );

    const limits = options.deepMode
      ? SEARCH_LIMITS.DEEP_MODE
      : SEARCH_LIMITS.FAST_MODE;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, { engine }] of this.engines.entries()) {
      tasks.push(async () => {
        const results = await engine.searchToken(searchTerm, options);
        return results
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, limits.MAX_TOTAL_RESULTS);
      });
    }

    return tasks;
  }

  getActiveEngineCount(): number {
    return this.engines.size;
  }

  clear(): void {
    this.engines.forEach((engine) => engine.engine.close());
    this.engines.clear();
  }
}
