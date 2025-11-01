const GUTENYE_OPTIONS: GutenyeOCRCreateOptions = {
  models: {
    detectionPath: "/ocr/multilingual_det_infer_dynamic.onnx",
    recognitionPath: "/ocr/japan_rec_infer.onnx",
    dictionaryPath: "/ocr/japan_keys.txt",
  },
};

export enum OCR_ENGINE {
  "TESSERACT" = "TESSERACT",
  "GUTENYE" = "GUTENYE",
}

export const OCR_ENGINES = {
  [OCR_ENGINE.TESSERACT]: {
    name: "tesseract",
    cdn: "/tesseract/tesseract.min.js",
  },
  [OCR_ENGINE.GUTENYE]: {
    name: "gutenye",
    cdn: "/ocr/ocr-browser.umd.js",
    options: GUTENYE_OPTIONS,
  },
};
