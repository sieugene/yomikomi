import { OCRResponse } from "@/features/ocr/types";
import React from "react";
import { useOCRCapture } from "../../context/OCRCaptureProvider";
import { OCRCapture } from "../OCRCapture";

interface OCRCaptureButtonProps {
  onResult?: (result: OCRResponse) => void;
}

export const OCRCaptureButton: React.FC<OCRCaptureButtonProps> = ({
  onResult,
}) => {
  const { performOCR } = useOCRCapture();

  return <OCRCapture performOCR={performOCR} onOCRResult={onResult} />;
};
