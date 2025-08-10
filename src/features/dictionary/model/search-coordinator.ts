import { SEARCH_LIMITS } from "../lib/constants";
import { SearchOptions, SearchResult } from "../types/types";
import { EnhancedDictionarySearchEngine } from "./enhanced-search-engine";

export class DictionarySearchCoordinator {
  private engines = new Map<string, EnhancedDictionarySearchEngine>();

  addEngine(dictId: string, engine: EnhancedDictionarySearchEngine): void {
    // Закрываем старый движок если есть
    this.engines.get(dictId)?.close();
    this.engines.set(dictId, engine);
  }

  removeEngine(dictId: string): void {
    const engine = this.engines.get(dictId);
    if (engine) {
      engine.close();
      this.engines.delete(dictId);
    }
  }

  /**
   * Поиск по одному конкретному токену во всех активных словарях
   */
  async searchSingleToken(
    searchTerm: string,
    options: SearchOptions,
    activeDictionaries: string[] = []
  ): Promise<SearchResult[]> {
    const promises: Promise<SearchResult[]>[] = [];
    const searchStartTime = performance.now();

    // Определяем какие движки использовать
    const enginesToUse =
      activeDictionaries.length > 0
        ? activeDictionaries.filter((id) => this.engines.has(id))
        : Array.from(this.engines.keys());

    console.log(
      `Searching "${searchTerm}" in ${enginesToUse.length} dictionaries`
    );

    // Запускаем поиск параллельно по всем словарям
    for (const dictId of enginesToUse) {
      const engine = this.engines.get(dictId);
      if (engine) {
        promises.push(
          Promise.resolve().then(() => engine.searchToken(searchTerm, options))
        );
      }
    }

    try {
      const allResults = await Promise.all(promises);
      const combinedResults = allResults.flat();

      const searchTime = performance.now() - searchStartTime;
      console.log(
        `Search completed in ${searchTime.toFixed(1)}ms, found ${
          combinedResults.length
        } results`
      );

      // Финальная сортировка и ограничение
      const limits = options.deepMode
        ? SEARCH_LIMITS.DEEP_MODE
        : SEARCH_LIMITS.FAST_MODE;
      return combinedResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limits.MAX_TOTAL_RESULTS);
    } catch (error) {
      console.error("Search coordination error:", error);
      return [];
    }
  }

  getActiveEngineCount(): number {
    return this.engines.size;
  }

  clear(): void {
    this.engines.forEach((engine) => engine.close());
    this.engines.clear();
  }
}
