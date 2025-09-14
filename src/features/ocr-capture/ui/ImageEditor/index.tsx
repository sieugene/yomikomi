import { OCRResponse } from "@/features/ocr/types";
import { Copy, Crop, Eye } from "lucide-react";
import React from "react";
import { SelectionArea } from "../../types";

interface ImageEditorProps {
  image: string;
  imageRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  selection: SelectionArea | null;
  renderSelectionOverlay: () => React.ReactNode;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleAnalyze: () => void;
  reset: () => void;
  copyToClipboard: () => void;
  isProcessing: boolean;
  ocrResult: OCRResponse | null;
  selectionExists: boolean;
  error: string | null;
  clearSelection: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  imageRef,
  containerRef,
  selection,
  renderSelectionOverlay,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleAnalyze,
  reset,
  copyToClipboard,
  isProcessing,
  ocrResult,
  selectionExists,
  error,
  clearSelection,
}) => {
  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <Crop className="w-4 h-4 inline mr-1" />
          {!selection
            ? "Click and drag to select the area you want to analyze with OCR"
            : "Selected area ready for analysis. Click 'Analyze' to process with OCR"}
        </p>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative border rounded-lg overflow-hidden bg-gray-50 touch-none"
        style={{ minHeight: "300px" }}
      >
        <img
          ref={imageRef}
          src={image}
          alt="OCR Source"
          className="max-w-full max-h-96 mx-auto block cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        />
        {renderSelectionOverlay()}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-between">
        <button
          onClick={reset}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          New Image
        </button>

        <div className="flex gap-2">
          <button
            onClick={clearSelection}
            disabled={!selectionExists}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Clear Selection
          </button>

          <button
            onClick={handleAnalyze}
            disabled={!selectionExists || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* OCR Results */}
      {ocrResult && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 border-t pt-4">
            OCR Results:
          </h3>

          {/* Full Text */}
          <div className="bg-gray-50 border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Extracted Text:
              </span>
              <button
                onClick={copyToClipboard}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded border max-h-32 overflow-y-auto">
              {ocrResult.full_text || "No text detected"}
            </div>
          </div>

          {/* Text Blocks */}
          {ocrResult.text_blocks && ocrResult.text_blocks.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-3">
              <span className="text-sm font-medium text-gray-700">
                Detected {ocrResult.text_blocks.length} text block(s):
              </span>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {ocrResult.text_blocks.map((block, index: number) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    <div className="text-xs text-gray-500 mb-1">
                      Block {index + 1} (confidence:{" "}
                      {Math.round(block.confidence || 0)}%)
                    </div>
                    <div className="text-sm text-gray-900">{block.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
