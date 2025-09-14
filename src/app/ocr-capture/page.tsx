"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { OCRAlbumProvider } from "@/features/ocr-album/context/OCRAlbumContext";
import { OCRCaptureButton, OCRCaptureProvider } from "@/features/ocr-capture";
import { OCRProvider } from "@/features/ocr-client/context/OCRProvider";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { OCRResponse } from "@/features/ocr/types";

export default function OcrCapturePage() {
  const handleOCRResult = (result: OCRResponse) => {
    console.log("OCR Text:", result.full_text);
  };

  return (
    <div>
      <OCRProvider>
        <OCRSettingsProvider>
          <OCRAlbumProvider>
            <ApplicationContext>
              <OCRCaptureProvider>
                <OCRCaptureButton onResult={handleOCRResult} />
              </OCRCaptureProvider>
            </ApplicationContext>
          </OCRAlbumProvider>
        </OCRSettingsProvider>
      </OCRProvider>
    </div>
  );
}
