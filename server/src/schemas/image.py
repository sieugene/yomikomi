from pydantic import BaseModel
from .ocr import OCRResult


class ImageInfo(BaseModel):
    width: int
    height: int
    format: str


class OCRResultWithImage(OCRResult):
    image_info: ImageInfo