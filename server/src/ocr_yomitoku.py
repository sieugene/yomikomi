from __future__ import annotations
from typing import List
from PIL import Image
import os
import asyncio
import numpy as np
from schemas.ocr import OCRResult, TextBlock

async def ocr_image_with_positions(image_path: str) -> OCRResult:
    """
    Process image with YomiToku and return in PaddleOCR-compatible format
    """
    try:
        from yomitoku import DocumentAnalyzer
        
        # Ensure CPU-only execution
        os.environ["CUDA_VISIBLE_DEVICES"] = ""  # Disable GPU
        analyzer = DocumentAnalyzer(device="cpu")
        
        # Load image as a PIL Image and convert to NumPy array
        with Image.open(image_path) as img:
            img = img.convert("RGB")  # Ensure RGB format
            img_array = np.array(img)  # Convert to NumPy array
        
        # Debug: Log input shape
        print(f"Input type: {type(img_array)}, Shape: {img_array.shape}")
        
        # Workaround: Set analyzer.img to mimic __call__ behavior
        analyzer.img = img_array
        
        # Run OCR asynchronously with the NumPy array
        results = await analyzer.run(img_array)
        
        # DocumentAnalyzer.run returns a tuple (results, ocr, layout); extract results
        if isinstance(results, tuple):
            results = results[0]  # Get DocumentAnalyzerSchema object
        
        return _convert_yomitoku_results(results, image_path)
        
    except ImportError:
        raise ImportError("YomiToku is not available. Please install yomitoku package.")
    except Exception as e:
        raise RuntimeError(f"YomiToku OCR failed: {str(e)}")

def _convert_yomitoku_results(yomitoku_results, image_path: str) -> OCRResult:
    """
    Convert YomiToku results to PaddleOCR-compatible format
    """
    text_blocks: List[TextBlock] = []
    full_text_lines: List[str] = []
    
    # Get image dimensions
    with Image.open(image_path) as img:
        img_width, img_height = img.size
    
    block_id = 0
    
    # Process paragraphs
    if hasattr(yomitoku_results, "paragraphs"):
        for paragraph in yomitoku_results.paragraphs:
            text = str(paragraph.contents).strip()
            if not text:
                continue
                
            bbox = paragraph.box
            if not bbox or len(bbox) != 4:
                continue
                
            x_min, y_min, x_max, y_max = bbox
            polygon = [
                (float(x_min), float(y_min)),
                (float(x_max), float(y_min)),
                (float(x_max), float(y_max)),
                (float(x_min), float(y_max))
            ]
            
            text_block: TextBlock = {
                "id": block_id,
                "text": text,
                "confidence": 0.9,  # YomiToku doesn't provide confidence; use default
                "bbox": {
                    "x_min": float(x_min),
                    "y_min": float(y_min),
                    "x_max": float(x_max),
                    "y_max": float(y_max),
                    "width": float(x_max - x_min),
                    "height": float(y_max - y_min),
                },
                "polygon": polygon,
            }
            
            text_blocks.append(text_block)
            full_text_lines.append(text)
            block_id += 1
    
    # Process tables
    if hasattr(yomitoku_results, "tables"):
        for table in yomitoku_results.tables:
            for cell in table.cells:
                text = str(cell.contents).strip()
                if not text:
                    continue
                    
                bbox = cell.box
                if not bbox or len(bbox) != 4:
                    continue
                    
                x_min, y_min, x_max, y_max = bbox
                polygon = [
                    (float(x_min), float(y_min)),
                    (float(x_max), float(y_min)),
                    (float(x_max), float(y_max)),
                    (float(x_min), float(y_max))
                ]
                
                text_block: TextBlock = {
                    "id": block_id,
                    "text": text,
                    "confidence": 0.9,
                    "bbox": {
                        "x_min": float(x_min),
                        "y_min": float(y_min),
                        "x_max": float(x_max),
                        "y_max": float(y_max),
                        "width": float(x_max - x_min),
                        "height": float(y_max - y_min),
                    },
                    "polygon": polygon,
                }
                
                text_blocks.append(text_block)
                full_text_lines.append(text)
                block_id += 1
    
    # Process figures
    if hasattr(yomitoku_results, "figures"):
        for figure in yomitoku_results.figures:
            for paragraph in figure.paragraphs:
                text = str(paragraph.contents).strip()
                if not text:
                    continue
                    
                bbox = paragraph.box
                if not bbox or len(bbox) != 4:
                    continue
                    
                x_min, y_min, x_max, y_max = bbox
                polygon = [
                    (float(x_min), float(y_min)),
                    (float(x_max), float(y_min)),
                    (float(x_max), float(y_max)),
                    (float(x_min), float(y_max))
                ]
                
                text_block: TextBlock = {
                    "id": block_id,
                    "text": text,
                    "confidence": 0.9,
                    "bbox": {
                        "x_min": float(x_min),
                        "y_min": float(y_min),
                        "x_max": float(x_max),
                        "y_max": float(y_max),
                        "width": float(x_max - x_min),
                        "height": float(y_max - y_min),
                    },
                    "polygon": polygon,
                }
                
                text_blocks.append(text_block)
                full_text_lines.append(text)
                block_id += 1
    
    # Fallback if no text blocks
    if not text_blocks and full_text_lines:
        text_block: TextBlock = {
            "id": 0,
            "text": "\n".join(full_text_lines),
            "confidence": 0.9,
            "bbox": {
                "x_min": 0.0,
                "y_min": 0.0,
                "x_max": float(img_width),
                "y_max": float(img_height),
                "width": float(img_width),
                "height": float(img_height),
            },
            "polygon": [
                (0.0, 0.0),
                (float(img_width), 0.0),
                (float(img_width), float(img_height)),
                (0.0, float(img_height)),
            ],
        }
        text_blocks.append(text_block)
    
    return {
        "full_text": "\n".join(full_text_lines),
        "text_blocks": text_blocks,
    }

async def ocr_image(image_path: str) -> str:
    """
    Extract text from image (simple interface)
    """
    result = await ocr_image_with_positions(image_path)
    return result["full_text"]