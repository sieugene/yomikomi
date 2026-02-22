import {
  DictionaryEntry,
  DictionaryParserConfig,
} from "@/features/dictionary/types";
import { SearchOptions, SearchResult } from ".";

export enum DICTIONARY_WORKER_MESSAGES {
  "INIT_ENGINE" = "INIT_ENGINE",
  "SEARCH" = "SEARCH",
  "HAS_TOKENS_BULK" = "HAS_TOKENS_BULK",
  "REMOVE_ENGINE" = "REMOVE_ENGINE",
}
export type WorkerMessage = {
  [DICTIONARY_WORKER_MESSAGES.INIT_ENGINE]: {
    type: DICTIONARY_WORKER_MESSAGES.INIT_ENGINE;
    id: string;
    requestId: string;
    payload: {
      dbBuffer: ArrayBuffer;
      config: DictionaryParserConfig;
      name: string;
      dictionaryType?: "standard" | "kanji";
    };
  };

  [DICTIONARY_WORKER_MESSAGES.SEARCH]: {
    type: DICTIONARY_WORKER_MESSAGES.SEARCH;
    requestId: string;
    payload: {
      engineId: string;
      term: string;
      options: SearchOptions;
    };
  };

  [DICTIONARY_WORKER_MESSAGES.HAS_TOKENS_BULK]: {
    type: DICTIONARY_WORKER_MESSAGES.HAS_TOKENS_BULK;
    requestId: string;
    payload: {
      engineId: string;
      tokens: string[];
    };
  };

  [DICTIONARY_WORKER_MESSAGES.REMOVE_ENGINE]: {
    type: DICTIONARY_WORKER_MESSAGES.REMOVE_ENGINE;
    id: string;
  };
};

export enum DICTIONARY_WORKER_RESPONSE {
  "ENGINE_READY" = "ENGINE_READY",
  "SEARCH_RESULT" = "SEARCH_RESULT",
  "HAS_TOKENS_RESULT" = "HAS_TOKENS_RESULT",
  "ERROR" = "ERROR",
}

export type WorkerResponse = {
  [DICTIONARY_WORKER_RESPONSE.ENGINE_READY]: {
    type: DICTIONARY_WORKER_RESPONSE.ENGINE_READY;
    requestId: string;
    id: string;
  };
  [DICTIONARY_WORKER_RESPONSE.SEARCH_RESULT]: {
    type: DICTIONARY_WORKER_RESPONSE.SEARCH_RESULT;
    requestId: string;
    results: SearchResult[];
  };
  [DICTIONARY_WORKER_RESPONSE.HAS_TOKENS_RESULT]: {
    type: DICTIONARY_WORKER_RESPONSE.HAS_TOKENS_RESULT;
    requestId: string;
    entries: DictionaryEntry[];
  };
  [DICTIONARY_WORKER_RESPONSE.ERROR]: {
    type: DICTIONARY_WORKER_RESPONSE.ERROR;
    requestId: string;
    error: string;
  };
};

export type WorkerRequestResponseMap = {
  [DICTIONARY_WORKER_MESSAGES.INIT_ENGINE]: WorkerResponse[DICTIONARY_WORKER_RESPONSE.ENGINE_READY];

  [DICTIONARY_WORKER_MESSAGES.SEARCH]: WorkerResponse[DICTIONARY_WORKER_RESPONSE.SEARCH_RESULT];

  [DICTIONARY_WORKER_MESSAGES.HAS_TOKENS_BULK]: WorkerResponse[DICTIONARY_WORKER_RESPONSE.HAS_TOKENS_RESULT];
};


export type AnyWorkerMessage = WorkerMessage[keyof WorkerMessage];
export type AnyWorkerResponse = WorkerResponse[keyof WorkerResponse];

export type ResponseFor<M extends AnyWorkerMessage> =
  M["type"] extends keyof WorkerRequestResponseMap
    ? WorkerRequestResponseMap[M["type"]]
    : never;