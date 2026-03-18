import {
  AnyWorkerMessage,
  PADDLEOCR_WORKER_MESSAGES,
  PADDLEOCR_WORKER_RESPONSE,
  ResponseFor,
  WorkerResponse,
} from "../types/worker";

type PendingRequest<T> = {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
};

export class OcrClientWorkerEngineProxy {
  private worker: Worker;
  private pending = new Map<
    string,
    PendingRequest<WorkerResponse[keyof WorkerResponse]>
  >();
  private reqCounter = 0;

  constructor() {
    this.worker = new Worker(
      new URL(`../workers/paddleocr.worker.ts`, import.meta.url),
      { type: "module" },
    );

    this.worker.onmessage = (
      e: MessageEvent<WorkerResponse[keyof WorkerResponse]>,
    ) => {
      const msg = e.data;
      const req = this.pending.get(msg.requestId);
      if (!req) return;
      this.pending.delete(msg.requestId);

      if (msg.type === PADDLEOCR_WORKER_RESPONSE.ERROR) {
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
  async process(value: string) {
    const res = await this.call({
      type: PADDLEOCR_WORKER_MESSAGES.PROCESS,
      requestId: "",
      payload: { value },
    });
    return res;
  }

  terminate() {
    this.worker.terminate();
  }
}
