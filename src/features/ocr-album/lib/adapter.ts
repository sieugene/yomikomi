import { ImageInfo, OCRResponse, TextBlock } from "@/features/ocr/types";
import type { RecognizeResult } from "tesseract.js";

export function adaptTesseractResult(result: RecognizeResult, imageInfo: ImageInfo): OCRResponse {
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
