import { ImageInfo, OCRResponse, TextBlock } from "@/features/ocr/types";
import type { RecognizeResult } from "tesseract.js";

export function adaptTesseractResult(
  result: RecognizeResult,
  imageInfo: ImageInfo
): OCRResponse {
  const blocks: TextBlock[] = [];

  const page = result.data;

  if (page.blocks) {
    page.blocks.forEach((block, blockIndex) => {
      const textBlock: TextBlock = {
        id: blockIndex,
        text: block.text,
        confidence: block.confidence,
        bbox: {
          x_min: block.bbox.x0,
          y_min: block.bbox.y0,
          x_max: block.bbox.x1,
          y_max: block.bbox.y1,
          width: block.bbox.x1 - block.bbox.x0,
          height: block.bbox.y1 - block.bbox.y0,
        },
        polygon: [
          [block.bbox.x0, block.bbox.y0],
          [block.bbox.x1, block.bbox.y0],
          [block.bbox.x1, block.bbox.y1],
          [block.bbox.x0, block.bbox.y1],
        ],
      };
      blocks.push(textBlock);
    });
  }

  return {
    full_text: page.text,
    text_blocks: blocks,
    image_info: imageInfo,
  };
}

export function adaptGutenyeOCR(
  raw: GutenyeOCRResult,
  imageInfo: ImageInfo
): OCRResponse {
  const text_blocks: TextBlock[] = raw.map((item, idx) => {
    const xs = item.box.map((p) => p[0]);
    const ys = item.box.map((p) => p[1]);

    const x_min = Math.min(...xs);
    const x_max = Math.max(...xs);
    const y_min = Math.min(...ys);
    const y_max = Math.max(...ys);

    return {
      id: idx,
      text: item.text.replace(/[\r\n\s]+/g, ""),
      confidence: item.mean,
      bbox: {
        x_min,
        y_min,
        x_max,
        y_max,
        width: x_max - x_min,
        height: y_max - y_min,
      },
      polygon: item.box,
    };
  });

  return {
    full_text: text_blocks.map((b) => b.text).join(" "),
    text_blocks,
    image_info: imageInfo,
  };
}
