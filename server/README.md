# Multi-Engine OCR API

OCR API that supports both PaddleOCR and YomiToku engines with identical response formats.

## Files Structure

```
src/
├── main.py                    # Unified main application
├── ocr_paddle.py             # PaddleOCR implementation
├── ocr_yomitoku.py           # YomiToku implementation (new)
├── requirements-paddle.txt    # PaddleOCR dependencies
├── requirements-yomitoku.txt  # YomiToku dependencies
├── schemas/
│   ├── ocr.py
│   └── image.py
├── Dockerfile-paddle          # PaddleOCR Docker image
├── Dockerfile-yomitoku        # YomiToku Docker image
├── docker-compose.yml         # Unified compose with switching
├── .env.paddle               # PaddleOCR environment
└── .env.yomitoku             # YomiToku environment
```

## Usage

### Option 1: Using Environment Variables

**For PaddleOCR:**
```bash
export OCR_ENGINE=paddle
export DOCKERFILE=Dockerfile-paddle
docker-compose up --build
```

**For YomiToku:**
```bash
export OCR_ENGINE=yomitoku  
export DOCKERFILE=Dockerfile-yomitoku
docker-compose up --build
```

### Option 2: Using Environment Files

**For PaddleOCR:**
```bash
docker-compose --env-file .env.paddle up --build
```

**For YomiToku:**
```bash
docker-compose --env-file .env.yomitoku up --build
```

### Option 3: Manual Docker Build

**PaddleOCR:**
```bash
docker build -f Dockerfile-paddle -t ocr-paddle .
docker run -p 8000:8000 -e OCR_ENGINE=paddle ocr-paddle
```

**YomiToku:**
```bash
docker build -f Dockerfile-yomitoku -t ocr-yomitoku .
docker run -p 8000:8000 -e OCR_ENGINE=yomitoku ocr-yomitoku
```

## API Endpoints

Both engines provide identical API interfaces:

- `POST /ocr/` - Extract text from image
- `POST /ocr/with-positions/` - Extract text with position information
- `GET /health` - Health check (shows which engine is active)
- `GET /` - API information

## Response Format

Both engines return the same response format:

```json
{
  "full_text": "Extracted text content",
  "text_blocks": [
    {
      "id": 0,
      "text": "Text block content",
      "confidence": 0.95,
      "bbox": {
        "x_min": 100.0,
        "y_min": 200.0,
        "x_max": 300.0,
        "y_max": 250.0,
        "width": 200.0,
        "height": 50.0
      },
      "polygon": [[100.0, 200.0], [300.0, 200.0], [300.0, 250.0], [100.0, 250.0]]
    }
  ]
}
```

## Engine Differences

### PaddleOCR
- **Pros**: Stable, lightweight, good for general OCR
- **Cons**: Basic layout analysis
- **Docker Image Size**: ~2GB
- **Memory Usage**: Low-moderate

### YomiToku  
- **Pros**: Advanced document analysis, better for complex layouts
- **Cons**: Heavier, requires PyTorch
- **Docker Image Size**: ~4GB
- **Memory Usage**: Higher (especially on first run)

## Switching Between Engines

The application automatically detects which engine to use based on the `OCR_ENGINE` environment variable. If YomiToku is requested but not available, it falls back to PaddleOCR.

## Development

To add support for a new OCR engine:

1. Create `ocr_<engine_name>.py` with `ocr_image_with_positions()` function
2. Create `requirements-<engine_name>.txt` 
3. Create `Dockerfile-<engine_name>`
4. Update `main.py` to include the new engine
5. Add environment configuration

The key requirement is that `ocr_image_with_positions()` must return the same format as the existing implementations.