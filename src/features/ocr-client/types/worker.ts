export enum PADDLEOCR_WORKER_MESSAGES {
  "PROCESS" = "PROCESS",
}
export type WorkerMessage = {
  [PADDLEOCR_WORKER_MESSAGES.PROCESS]: {
    type: PADDLEOCR_WORKER_MESSAGES.PROCESS;
    requestId: string;
    payload: {
      value: string;
    };
  };
};

export enum PADDLEOCR_WORKER_RESPONSE {
  "PROCESSED" = "PROCESSED",
  "ERROR" = "ERROR",
}

export type WorkerResponse = {
  [PADDLEOCR_WORKER_RESPONSE.PROCESSED]: {
    type: PADDLEOCR_WORKER_RESPONSE.PROCESSED;
    requestId: string;
  };
  [PADDLEOCR_WORKER_RESPONSE.ERROR]: {
    type: PADDLEOCR_WORKER_RESPONSE.ERROR;
    requestId: string;
    error: string;
  };
};

export type WorkerRequestResponseMap = {
  [PADDLEOCR_WORKER_MESSAGES.PROCESS]: WorkerResponse[PADDLEOCR_WORKER_RESPONSE.PROCESSED];
};

export type AnyWorkerMessage = WorkerMessage[keyof WorkerMessage];
export type AnyWorkerResponse = WorkerResponse[keyof WorkerResponse];

export type ResponseFor<M extends AnyWorkerMessage> =
  M["type"] extends keyof WorkerRequestResponseMap
    ? WorkerRequestResponseMap[M["type"]]
    : never;
