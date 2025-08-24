from paddleocr import PaddleOCR
import os

def ocr_image(image_path):
    ocr = PaddleOCR(use_angle_cls=True, lang="japan")
    result = ocr.ocr(image_path, cls=True)
    extracted_text = []
    for idx in range(len(result)):
        res = result[idx]
        for line in res:
            extracted_text.append(line[1][0])
    return "\n".join(extracted_text)