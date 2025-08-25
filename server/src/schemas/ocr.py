from pydantic import BaseModel
from typing import List, Tuple

class BBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    width: float
    height: float

class TextBlock(BaseModel):
    id: int
    text: str
    confidence: float
    bbox: BBox
    polygon: List[Tuple[float, float]]

class OCRResult(BaseModel):
    full_text: str
    text_blocks: List[TextBlock]
