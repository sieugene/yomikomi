from __future__ import annotations
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import os
import io
import asyncio
from schemas.ocr import OCRResult
from schemas.image import OCRResultWithImage

# Determine which OCR engine to use based on environment variable
OCR_ENGINE = os.getenv("OCR_ENGINE", "paddle").lower()

# Import the appropriate OCR module
if OCR_ENGINE == "yomitoku":
    try:
        from ocr_yomitoku import ocr_image_with_positions

        ENGINE_NAME = "YomiToku"
    except ImportError:
        print("Warning: YomiToku not available, falling back to PaddleOCR")
        from ocr_paddle import ocr_image_with_positions

        ENGINE_NAME = "PaddleOCR (fallback)"
elif OCR_ENGINE == "paddle":
    from ocr_paddle import ocr_image_with_positions

    ENGINE_NAME = "PaddleOCR"
else:
    # Default to PaddleOCR for unknown engines
    print(f"Warning: Unknown OCR_ENGINE '{OCR_ENGINE}', using PaddleOCR")
    from ocr_paddle import ocr_image_with_positions

    ENGINE_NAME = "PaddleOCR (default)"

print(f"Starting with OCR Engine: {ENGINE_NAME}")

app = FastAPI(title=f"OCR API ({ENGINE_NAME})")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_ocr(image_path: str) -> OCRResult:
    """
    Wrapper to handle synchronous or asynchronous OCR functions
    """
    if OCR_ENGINE == "yomitoku":
        # YomiToku's ocr_image_with_positions is async
        return await ocr_image_with_positions(image_path)
    else:
        # Assume PaddleOCR's ocr_image_with_positions is synchronous
        return ocr_image_with_positions(image_path)


@app.post("/ocr/", response_model=OCRResult)
async def perform_ocr(file: UploadFile = File(...)) -> OCRResult:
    try:
        if not file.content_type or not file.content_type.startswith("image"):
            raise HTTPException(
                status_code=400, detail="Invalid file format. Only images are allowed."
            )

        save_path = f"/tmp/{file.filename}"
        with open(save_path, "wb") as f:
            f.write(await file.read())

        result = await run_ocr(save_path)

        if os.path.exists(save_path):
            os.remove(save_path)

        return result

    except Exception as e:
        if "save_path" in locals() and os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr/with-positions/", response_model=OCRResultWithImage)
async def perform_ocr_with_positions(
    file: UploadFile = File(...),
) -> OCRResultWithImage:
    try:
        if not file.content_type or not file.content_type.startswith("image"):
            raise HTTPException(
                status_code=400, detail="Invalid file format. Only images are allowed."
            )

        save_path = f"/tmp/{file.filename}"
        content = await file.read()

        with open(save_path, "wb") as f:
            f.write(content)

        image = Image.open(io.BytesIO(content))
        image_width, image_height = image.size

        result = await run_ocr(save_path)

        if os.path.exists(save_path):
            os.remove(save_path)

        response_data = {
            **result,
            "image_info": {
                "width": image_width,
                "height": image_height,
                "format": image.format or "unknown",
            },
        }

        return response_data

    except Exception as e:
        if "save_path" in locals() and os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": ENGINE_NAME, "ocr_engine": OCR_ENGINE}


@app.get("/")
async def root():
    return {
        "message": f"OCR API powered by {ENGINE_NAME}",
        "engine": OCR_ENGINE,
        "endpoints": ["/ocr/", "/ocr/with-positions/", "/health"],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
