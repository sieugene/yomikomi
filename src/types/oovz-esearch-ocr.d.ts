declare module "@oovz/esearch-ocr" {
  type Point = [number, number];
  type BoxType = [Point, Point, Point, Point];
  type color = [number, number, number];
  type ReadingDirPart = "lr" | "rl" | "tb" | "bt";

  interface OCRResultItem {
    text: string;
    mean: number;
    box: BoxType;
    style: { bg: color; text: color };
  }

  type OCRResultType = OCRResultItem[];

  interface OCROutput {
    src: OCRResultType;
    columns: {
      src: OCRResultType;
      outerBox: BoxType;
      parragraphs: {
        src: OCRResultType;
        parse: OCRResultItem;
      }[];
    }[];
    parragraphs: OCRResultType;
    readingDir: {
      inline: ReadingDirPart;
      block: ReadingDirPart;
    };
    angle: {
      reading: { inline: number; block: number };
      angle: number;
    };
  }

  type PaddleOcrInstance = {
    ocr: (
      image: string | HTMLImageElement | HTMLCanvasElement | ImageData,
    ) => Promise<OCROutput>;
    det: (
      image: string | HTMLImageElement | HTMLCanvasElement | ImageData,
    ) => Promise<OCRResultType>;
    rec: (
      image: string | HTMLImageElement | HTMLCanvasElement | ImageData,
    ) => Promise<OCRResultType>;
  };

  type PaddleOcrInitOptions = {
    ort: object;
    det: {
      input: string | ArrayBufferLike | Uint8Array;
      ratio?: number;
      on?: (r: OCRResultType) => void;
    };
    rec: {
      input: string | ArrayBufferLike | Uint8Array;
      decodeDic: string;
      imgh?: number;
      on?: (
        index: number,
        result: { text: string; mean: number },
        total: number,
      ) => void;
      optimize?: {
        /** for v5 recommend is false */
        space?: boolean;
      };
      multiChar?: {
        topK?: number;
        threshold?: number;
      };
    };
    docCls?: {
      /** Model for determining the document rotation angle */
      input: string | ArrayBufferLike | Uint8Array;
    };
    analyzeLayout?: {
      docDirs?: ReadingDirPart[];
      columnsTip?: unknown;
    };
    dev?: boolean;
  };

  export function init(
    options: PaddleOcrInitOptions,
  ): Promise<PaddleOcrInstance>;
}
