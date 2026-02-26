import Tesseract from "tesseract.js";

import type { pipeline, env } from "@xenova/transformers";
export type PipelineTransformers = typeof pipeline;
export type EnvTransformers = typeof env;
export type TransformesCDN = {
  pipeline: PipelineTransformers;
  env: EnvTransformers;
};

export {};

declare global {
  // ─── eSearch-OCR (PaddleOCR-based) types ────────────────────────────────────

  type Point = [number, number];

  /** Четыре угла ограничивающего прямоугольника: ↖ ↗ ↘ ↙ */
  type BoxType = [Point, Point, Point, Point];

  type color = [number, number, number]; // RGB

  type ReadingDirPart = "lr" | "rl" | "tb" | "bt";

  interface OCRResultItem {
    text: string;
    mean: number;
    box: BoxType;
    style: { bg: color; text: color };
  }

  type OCRResultType = OCRResultItem[];

  interface OCROutput {
    /** Каждая визуальная строка, выход rec */
    src: OCRResultType;
    /** Колонки (например, левая/правая колонка) */
    columns: {
      src: OCRResultType;
      outerBox: BoxType;
      parragraphs: {
        src: OCRResultType;
        parse: OCRResultItem;
      }[];
    }[];
    /** Агрегированные абзацы из всех колонок */
    parragraphs: OCRResultType;
    readingDir: {
      /** Направление чтения внутри строки */
      inline: ReadingDirPart;
      /** Направление расположения строк */
      block: ReadingDirPart;
    };
    angle: {
      reading: { inline: number; block: number };
      /** Общий угол поворота; если < 1° — можно игнорировать */
      angle: number;
    };
  }

  // ─── Init options ────────────────────────────────────────────────────────────

  type PaddleOcrInitOptions = {
    /** Экземпляр onnxruntime-web или onnxruntime-node */
    ort: object;
    det: {
      /** Путь, ArrayBufferLike или Uint8Array к модели det.onnx */
      input: string | ArrayBufferLike | Uint8Array;
      /** Масштаб: чем меньше — тем быстрее, но ниже точность */
      ratio?: number;
      on?: (r: OCRResultType) => void;
    };
    rec: {
      /** Путь, ArrayBufferLike или Uint8Array к модели rec.onnx */
      input: string | ArrayBufferLike | Uint8Array;
      /** Содержимое словарного файла (не путь!) */
      decodeDic: string;
      imgh?: number;
      on?: (
        index: number,
        result: { text: string; mean: number },
        total: number
      ) => void;
      optimize?: {
        /** v3/v4: пробелы распознаются неидеально; для v5 передавайте false */
        space?: boolean;
      };
      multiChar?: {
        topK?: number;
        threshold?: number;
      };
    };
    docCls?: {
      /** Модель определения угла поворота документа */
      input: string | ArrayBufferLike | Uint8Array;
    };
    analyzeLayout?: {
      docDirs?: ReadingDirPart[];
      columnsTip?: unknown; // ColumnsTip — уточни из кода библиотеки при необходимости
    };
    dev?: boolean;
  };

  // ─── PaddleOcr instance ──────────────────────────────────────────────────────

  type PaddleOcrInstance = {
    ocr: (
      image:
        | string
        | HTMLImageElement
        | HTMLCanvasElement
        | ImageData
    ) => Promise<OCROutput>;
    det: (
      image:
        | string
        | HTMLImageElement
        | HTMLCanvasElement
        | ImageData
    ) => Promise<OCRResultType>;
    rec: (
      image:
        | string
        | HTMLImageElement
        | HTMLCanvasElement
        | ImageData
    ) => Promise<OCRResultType>;
  };

  // ─── Window augmentation ─────────────────────────────────────────────────────

  interface Window {
    Tesseract: typeof Tesseract;
    PaddleOcr: {
      instance?: PaddleOcrInstance;
      default: {
        init: (options: PaddleOcrInitOptions) => Promise<PaddleOcrInstance>;
      };
    };
    __transformers: TransformesCDN;
  }
}