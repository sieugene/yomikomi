# PaddleOCR FastAPI for Japanese OCR

This project sets up a FastAPI service using PaddleOCR for Japanese text recognition, containerized with Docker. It supports both CPU and GPU modes via environment variables.

## Prerequisites
- Docker and Docker Compose installed
- Python 3.10 (for local development, optional)

## Setup Instructions
1. **Clone the repository** or create the directory structure as shown above.
2. **Build and run the Docker container**:
   ```bash
   docker-compose up --build
   ```
3. **For GPU mode**:
   - Ensure NVIDIA Container Toolkit is installed on the host.
   - Set the environment variable:
     ```bash
     USE_GPU=true docker-compose up --build
     ```
4. **Access the API**:
   - Swagger UI: `http://localhost:8000/docs`
   - POST endpoint: `http://localhost:8000/ocr/`
5. **Test the OCR endpoint**:
   Use `curl` or a tool like Postman to send a POST request with an image file:
   ```bash
   curl -X POST -F "file=@/path/to/image.jpg" http://localhost:8000/ocr/
   ```

## Environment Variables
- `OCR_LANG`: Set to `japan` for Japanese text recognition (default).
- `USE_GPU`: Set to `true` for GPU mode or `false` for CPU mode (default: `false`).
- `TZ`: Timezone, set to `Asia/Tokyo` for Japan.

## Notes
- The PaddleOCR model downloads automatically on first run.
- Ensure sufficient disk space for model files (~1GB).
- Tested with PaddleOCR v2.7 and Python 3.10.

## License
MIT License