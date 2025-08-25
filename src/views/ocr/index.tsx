import { OcrTool } from "@/features/ocr/ui";
import React from "react";

export const OCRPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Japanese OCR Tool
          </h1>
          <p className="text-gray-600">
            Upload an image to extract Japanese text with precise positioning
          </p>
        </div>

        <OcrTool />
      </div>
    </div>
  );
};
