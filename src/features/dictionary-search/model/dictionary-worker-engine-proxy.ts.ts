import type {
  DictionaryParserConfig,
  DictionaryEntry,
} from "@/features/dictionary/types";
import type { SearchOptions, SearchResult } from "../types";
import {
  AnyWorkerMessage,
  DICTIONARY_WORKER_MESSAGES,
  DICTIONARY_WORKER_RESPONSE,
  ResponseFor,
  WorkerResponse,
} from "../types/worker";

type PendingRequest<T> = {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
};

export class DictionaryWorkerEngineProxy {
  private worker: Worker;
  private pending = new Map<
    string,
    PendingRequest<WorkerResponse[keyof WorkerResponse]>
  >();
  private reqCounter = 0;

  constructor() {
    this.worker = new Worker(
      new URL(`../workers/dictionary.worker.ts`, import.meta.url),
      { type: "module" },
    );

    this.worker.onmessage = (
      e: MessageEvent<WorkerResponse[keyof WorkerResponse]>,
    ) => {
      const msg = e.data;
      const req = this.pending.get(msg.requestId);
      if (!req) return;
      this.pending.delete(msg.requestId);

      if (msg.type === DICTIONARY_WORKER_RESPONSE.ERROR) {
        req.reject(new Error(msg.error));
      } else {
        req.resolve(msg);
      }
    };
  }

  private call<M extends AnyWorkerMessage>(
    msg: M,
    transfer?: Transferable[],
  ): Promise<ResponseFor<M>> {
    const requestId = String(++this.reqCounter);

    return new Promise<ResponseFor<M>>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject } as PendingRequest<
        WorkerResponse[keyof WorkerResponse]
      >);

      this.worker.postMessage({ ...msg, requestId }, transfer ?? []);
    });
  }
  async initEngine(
    id: string,
    dbBuffer: ArrayBuffer,
    config: DictionaryParserConfig,
    name: string,
    dictionaryType?: "standard" | "kanji",
  ): Promise<void> {
    await this.call(
      {
        type: DICTIONARY_WORKER_MESSAGES.INIT_ENGINE,
        requestId: "",
        id,
        payload: { dbBuffer, config, name, dictionaryType },
      },
      [dbBuffer],
    );
  }

  async searchToken(
    engineId: string,
    term: string,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    const res = await this.call({
      type: DICTIONARY_WORKER_MESSAGES.SEARCH,
      payload: { engineId, term, options },
      requestId: "",
    });
    return res.results;
  }

  async hasTokenBulk(
    engineId: string,
    tokens: string[],
  ): Promise<DictionaryEntry[]> {
    const res = await this.call({
      type: DICTIONARY_WORKER_MESSAGES.HAS_TOKENS_BULK,
      payload: { engineId, tokens },
      requestId: "",
    });
    return res.entries;
  }

  removeEngine(id: string) {
    this.worker.postMessage({
      type: DICTIONARY_WORKER_MESSAGES.REMOVE_ENGINE,
      id,
    });
  }

  terminate() {
    this.worker.terminate();
  }
}
