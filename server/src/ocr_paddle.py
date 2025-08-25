from __future__ import annotations
from typing import List
from paddleocr import PaddleOCR
import numpy as np
from schemas.ocr import OCRResult, TextBlock



def ocr_image_with_positions(image_path: str) -> OCRResult:
    ocr = PaddleOCR(use_angle_cls=True, lang="japan")
    result = ocr.ocr(image_path, cls=True)

    if not result or not result[0]:
        return {
            "full_text": "",
            "text_blocks": []
        }

    text_blocks: List[TextBlock] = []
    full_text_lines: List[str] = []

    for idx, line_result in enumerate(result[0]):
        bbox = line_result[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
        text_info = line_result[1]  # (text, confidence)

        text: str = text_info[0]
        confidence: float = float(text_info[1])

        bbox_coords = np.array(bbox)

        x_coords = bbox_coords[:, 0]
        y_coords = bbox_coords[:, 1]

        x_min = float(np.min(x_coords))
        y_min = float(np.min(y_coords))
        x_max = float(np.max(x_coords))
        y_max = float(np.max(y_coords))

        text_block: TextBlock = {
            "id": idx,
            "text": text,
            "confidence": confidence,
            "bbox": {
                "x_min": x_min,
                "y_min": y_min,
                "x_max": x_max,
                "y_max": y_max,
                "width": x_max - x_min,
                "height": y_max - y_min,
            },
            "polygon": [(float(p[0]), float(p[1])) for p in bbox],
        }

        text_blocks.append(text_block)
        full_text_lines.append(text)

    return {
        "full_text": "\n".join(full_text_lines),
        "text_blocks": text_blocks,
    }


def ocr_image(image_path: str) -> str:
    result = ocr_image_with_positions(image_path)
    return result["full_text"]
