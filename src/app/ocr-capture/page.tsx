"use client";
import { OCRCaptureButton } from "@/features/ocr-capture";
import { OCRResponse } from "@/features/ocr/types";

export default function OcrCapturePage() {
  const handleOCRResult = (result: OCRResponse) => {
    console.log("OCR Text:", result.full_text);
  };

  return (
    <div>
      <OCRCaptureButton onResult={handleOCRResult} />
    </div>
  );
}
