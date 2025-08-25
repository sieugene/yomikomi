from __future__ import annotations
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ocr_paddle import ocr_image_with_positions
from PIL import Image
import os
import io
from schemas.ocr import OCRResult
from schemas.image import OCRResultWithImage



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ocr/", response_model=OCRResult)
async def perform_ocr(file: UploadFile = File(...)) -> OCRResult:
    try:
        if not file.content_type or not file.content_type.startswith("image"):
            raise HTTPException(status_code=400, detail="Invalid file format. Only images are allowed.")

        save_path = f"/tmp/{file.filename}"
        with open(save_path, "wb") as f:
            f.write(await file.read())

        result = ocr_image_with_positions(save_path)

        if os.path.exists(save_path):
            os.remove(save_path)

        return result

    except Exception as e:
        if 'save_path' in locals() and os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr/with-positions/", response_model=OCRResultWithImage)
async def perform_ocr_with_positions(file: UploadFile = File(...)) -> OCRResultWithImage:
    try:
        if not file.content_type or not file.content_type.startswith("image"):
            raise HTTPException(status_code=400, detail="Invalid file format. Only images are allowed.")

        save_path = f"/tmp/{file.filename}"
        content = await file.read()

        with open(save_path, "wb") as f:
            f.write(content)

        image = Image.open(io.BytesIO(content))
        image_width, image_height = image.size

        result = ocr_image_with_positions(save_path)

        if os.path.exists(save_path):
            os.remove(save_path)

        response_data = {
            **result,
            "image_info": {
                "width": image_width,
                "height": image_height,
                "format": image.format or "unknown"
            }
        }

        return response_data

    except Exception as e:
        if 'save_path' in locals() and os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "PaddleOCR"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
