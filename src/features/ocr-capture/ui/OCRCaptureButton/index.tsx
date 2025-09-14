import { AlertTriangle } from "lucide-react";
import React from "react";
import { useOCRCapture } from "../../context/OCRCaptureProvider";
import { OCRCapture } from "../OCRCapture";
import { OCRResponse } from "@/features/ocr/types";

interface OCRCaptureButtonProps {
  onResult?: (result: OCRResponse) => void;
}

export const OCRCaptureButton: React.FC<OCRCaptureButtonProps> = ({
  onResult,
}) => {
  const { performOCR, isReady } = useOCRCapture();

  if (!isReady) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-center text-sm text-yellow-800">
          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
          OCR is still initializing or something went wrong. Processing may be
          unstable. (try refresh page and wait or restart web browser)
        </div>
      </div>
    );
  }

  return <OCRCapture performOCR={performOCR} onOCRResult={onResult} />;
};
