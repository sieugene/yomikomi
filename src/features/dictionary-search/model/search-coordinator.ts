import {
  DictionaryEntry,
  DictionaryParserConfig,
} from "@/features/dictionary/types";
import { SearchOptions } from "../types";
import { WorkerEngineProxy } from "./worker-engine-proxy.ts";

export class DictionarySearchCoordinator {
  private proxy = new WorkerEngineProxy();
  private engines = new Map<string, { type: "standard" | "kanji" }>();

  async addEngine(
    dictId: string,
    dbBuffer: ArrayBuffer,
    config: DictionaryParserConfig,
    name: string,
    dictionaryType: "standard" | "kanji" = "standard",
  ): Promise<void> {
    this.removeEngine(dictId);
    await this.proxy.initEngine(dictId, dbBuffer, config, name, dictionaryType);
    this.engines.set(dictId, { type: dictionaryType });
  }

  removeEngine(dictId: string): void {
    if (this.engines.has(dictId)) {
      this.proxy.removeEngine(dictId);
      this.engines.delete(dictId);
    }
  }

  searchSingleToken(searchTerm: string, options: SearchOptions) {
    return [...this.engines.keys()].map(
      (engineId) => () => this.proxy.searchToken(engineId, searchTerm, options),
    );
  }

  async checkTokensAsync(tokens: string[]): Promise<DictionaryEntry[]> {
    const results = await Promise.all(
      [...this.engines.keys()].map((id) => this.proxy.hasTokenBulk(id, tokens)),
    );
    return results.flat();
  }

  getActiveEngineCount() {
    return this.engines.size;
  }

  clear() {
    this.engines.forEach((_, id) => this.proxy.removeEngine(id));
    this.engines.clear();
    this.proxy.terminate();
  }
}
