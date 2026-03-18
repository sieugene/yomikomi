import {
  AnyWorkerResponse,
  PADDLEOCR_WORKER_MESSAGES,
  PADDLEOCR_WORKER_RESPONSE,
  WorkerMessage,
} from "../types/worker";

function respond<R extends AnyWorkerResponse>(response: R) {
  self.postMessage(response);
}

self.onmessage = async (
  e: MessageEvent<WorkerMessage[keyof WorkerMessage]>,
) => {
  const msg = e.data;
  console.info(`WORKER :: paddleocr.worker :: handle a ${msg?.type}`);

  try {
    switch (msg.type) {
      case PADDLEOCR_WORKER_MESSAGES.PROCESS: {
        const { requestId, payload } = msg;
        // engines.get(id)?.close();
        // const engine = new EnhancedDictionarySearchEngine(
        //   SQL,
        //   payload.dbBuffer,
        //   payload.config,
        //   payload.name,
        //   payload.dictionaryType,
        // );
        // engines.set(id, engine);

        respond({
          type: PADDLEOCR_WORKER_RESPONSE.PROCESSED,
          requestId,
        });
        break;
      }
    }
  } catch (err) {
    const requestId = "requestId" in msg ? msg.requestId : undefined;

    respond({
      type: PADDLEOCR_WORKER_RESPONSE.ERROR,
      requestId: requestId || "unknown request id",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
