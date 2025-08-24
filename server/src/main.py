from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from ocr_paddle import ocr_image
import os
from PIL import Image
import io

app = FastAPI()

@app.post("/ocr/")
async def perform_ocr(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image'):
            raise HTTPException(status_code=400, detail="Invalid file format. Only images are allowed.")
        
        # Save uploaded image temporarily
        save_path = f"/tmp/{file.filename}"
        with open(save_path, "wb") as f:
            f.write(await file.read())
        
        # Perform OCR
        result = ocr_image(save_path)
        
        # Clean up
        if os.path.exists(save_path):
            os.remove(save_path)
        
        return JSONResponse(content={"text": result}, status_code=200)
    
    except Exception as e:
        # Clean up in case of error
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)