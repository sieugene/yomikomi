import type { PaddleOcrInitOptions } from "@oovz/esearch-ocr";

const PADDLE_OCR_OPTIONS = async (
  ortOnnxruntimeWebInstance: object,
): Promise<PaddleOcrInitOptions> => {
  const dicResponse = await fetch("/ocr/ppocrv5_dict.txt");
  const decodeDic = await dicResponse.text();
  return {
    ort: ortOnnxruntimeWebInstance,
    det: { input: "/ocr/ppocr_v5_mobile_det.onnx" },
    rec: {
      input: "/ocr/ppocr_v5_mobile_rec.onnx",
      decodeDic,
      optimize: { space: false },
    },
    docCls: {
      input: "/ocr/doc_cls.onnx"
    }
  };
};
export enum OCR_ENGINE {
  "PADDLEOCR" = "PADDLEOCR",
  "TESSERACT" = "TESSERACT",
}

export const OCR_ENGINES = {
  [OCR_ENGINE.PADDLEOCR]: {
    name: "paddleocr",
    options: PADDLE_OCR_OPTIONS,
  },
  [OCR_ENGINE.TESSERACT]: {
    name: "tesseract",
    cdn: "/tesseract/tesseract.min.js",
  },
};
