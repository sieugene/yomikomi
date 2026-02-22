import type { InitSqlJsStatic } from "sql.js";
import { EnhancedDictionarySearchEngine } from "../model/enhanced-search-engine";
import {
  AnyWorkerResponse,
  DICTIONARY_WORKER_MESSAGES,
  DICTIONARY_WORKER_RESPONSE,
  WorkerMessage,
} from "../types/worker";

const engines = new Map<string, EnhancedDictionarySearchEngine>();
let SQL: Awaited<ReturnType<InitSqlJsStatic>>;

const getSqlJsLib = async (): Promise<InitSqlJsStatic | null> => {
  try {
    const wasmJsUrl = new URL("/sql.js/sql-wasm.js", self.location.origin).href;
    const response = await fetch(wasmJsUrl);
    const code = await response.text();

    const fn = new Function("self", `${code}; return initSqlJs;`);
    const initSqlJs = fn(self) ?? self?.initSqlJs;
    return initSqlJs;
  } catch (error) {
    console.error(error, "Failed to resolve fetch sql js wasm");
    return null;
  }
};

async function ensureSql() {
  if (SQL) return;

  const initSqlJs = await getSqlJsLib();
  if (!initSqlJs) {
    throw new Error("Cannot initSqlJs for worker!");
  }
  SQL = await initSqlJs({
    locateFile: (file: string) =>
      new URL(`/sql.js/${file}`, self.location.origin).href,
  });
}

function respond<R extends AnyWorkerResponse>(response: R) {
  self.postMessage(response);
}

self.onmessage = async (
  e: MessageEvent<WorkerMessage[keyof WorkerMessage]>,
) => {
  const msg = e.data;
  console.info(`WORKER :: dictionary.worker :: handle a ${msg?.type}`);

  try {
    switch (msg.type) {
      case DICTIONARY_WORKER_MESSAGES.INIT_ENGINE: {
        await ensureSql();
        const { requestId, id, payload } = msg;
        engines.get(id)?.close();
        const engine = new EnhancedDictionarySearchEngine(
          SQL,
          payload.dbBuffer,
          payload.config,
          payload.name,
          payload.dictionaryType,
        );
        engines.set(id, engine);

        respond({
          type: DICTIONARY_WORKER_RESPONSE.ENGINE_READY,
          requestId,
          id,
        });
        break;
      }

      case DICTIONARY_WORKER_MESSAGES.SEARCH: {
        const { requestId, payload } = msg;
        const engine = engines.get(payload.engineId);
        if (!engine) throw new Error(`Engine ${payload.engineId} not found`);
        const results = engine.searchToken(payload.term, payload.options);

        respond({
          type: DICTIONARY_WORKER_RESPONSE.SEARCH_RESULT,
          requestId,
          results,
        });
        break;
      }

      case DICTIONARY_WORKER_MESSAGES.HAS_TOKENS_BULK: {
        const { requestId, payload } = msg;
        const engine = engines.get(payload.engineId);
        if (!engine) throw new Error(`Engine ${payload.engineId} not found`);
        const entries = engine.hasTokenBulk(payload.tokens);

        respond({
          type: DICTIONARY_WORKER_RESPONSE.HAS_TOKENS_RESULT,
          requestId,
          entries,
        });
        break;
      }

      case DICTIONARY_WORKER_MESSAGES.REMOVE_ENGINE: {
        engines.get(msg.id)?.close();
        engines.delete(msg.id);
        break;
      }
    }
  } catch (err) {
    const requestId = "requestId" in msg ? msg.requestId : undefined;

    respond({
      type: DICTIONARY_WORKER_RESPONSE.ERROR,
      requestId: requestId || "unknown request id",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
