import { Dispatch, SetStateAction, useMemo, useState, useEffect } from "react";
import { ImageWithTextOverlays } from "../ImageWithTextOverlays";
import { OCRResponse } from "@/features/ocr/types";
import { useInteractiveOcr } from "../../hooks/useInteractiveOcr";
import { Copy, Download, RotateCcw, Info } from "lucide-react";
import { useOcrCopy } from "../../hooks/useOcrCopy";
import { useDownloadText } from "../../hooks/useDownloadText";

type Props = {
  imageUrl: string;
  setCopyFeedback: Dispatch<SetStateAction<string | null>>;
  result: OCRResponse;
};

export const InteractiveOcrResult: React.FC<Props> = ({
  imageUrl,
  result,
  setCopyFeedback,
}) => {
  const { handleTextBlockClick, selectedTextBlock, handleReset } = useInteractiveOcr();
  const { handleCopyFullText, handleCopyText } = useOcrCopy(setCopyFeedback);
  const { handleDownloadText } = useDownloadText();
  const [showInfo, setShowInfo] = useState(false);

  const selectedTextId = useMemo(
    () => selectedTextBlock?.id,
    [selectedTextBlock]
  );

  // Auto-hide info after 3 seconds
  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => setShowInfo(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showInfo]);

  const handleTextBlockClickWithFeedback = (textBlock: any) => {
    handleTextBlockClick(textBlock);
    
    // Copy text to clipboard on mobile when selected
    if (window.innerWidth < 640) {
      navigator.clipboard.writeText(textBlock.text).then(() => {
        handleCopyText(textBlock.text);
      });
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Action Bar */}
      <div className="sm:hidden sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-full transition-colors ${
                showInfo ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
              title="Show OCR info"
            >
              <Info className="w-4 h-4" />
            </button>
            
            {selectedTextBlock && (
              <button
                onClick={handleReset}
                className="p-2 rounded-full bg-orange-100 text-orange-600 transition-colors"
                title="Clear selection"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCopyFullText(result)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-blue-700"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy All
            </button>
            
            <button
              onClick={() => handleDownloadText(result)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
              title="Download text"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="border-t border-gray-100 bg-blue-50 p-3">
            <div className="text-xs space-y-1">
              <div className="font-medium text-blue-900">OCR Results</div>
              <div className="text-blue-700">
                📝 {result.text_blocks.length} text blocks found
              </div>
              <div className="text-blue-600">
                📱 Tap any text to select • Long press to copy
              </div>
              {selectedTextBlock && (
                <div className="text-blue-800 font-medium mt-2">
                  ✅ Selected: "{selectedTextBlock.text.substring(0, 30)}..."
                  <br />
                  🎯 Confidence: {(selectedTextBlock.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Action Bar */}
      <div className="hidden sm:flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">
          Found {result.text_blocks.length} text blocks
          {selectedTextBlock && (
            <span className="ml-2 text-blue-600 font-medium">
              • Selected: {selectedTextBlock.text.substring(0, 50)}...
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedTextBlock && (
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear Selection
            </button>
          )}
          
          <button
            onClick={() => handleCopyFullText(result)}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy All Text
          </button>
          
          <button
            onClick={() => handleDownloadText(result)}
            className="flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
        </div>
      </div>

      {/* Main Image Viewer */}
      <ImageWithTextOverlays
        selectedTextId={selectedTextId}
        imageUrl={imageUrl}
        textBlocks={result.text_blocks}
        onTextClick={handleTextBlockClickWithFeedback}
        className="w-full"
        imageInfo={result.image_info}
      />

      {/* Selected Text Block Details (Mobile) */}
      {selectedTextBlock && (
        <div className="sm:hidden mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-blue-900">Selected Text</div>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {(selectedTextBlock.confidence * 100).toFixed(1)}% confidence
            </div>
          </div>
          
          <div className="text-blue-800 font-medium text-sm leading-relaxed mb-3">
            {selectedTextBlock.text}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedTextBlock.text);
                handleCopyText(selectedTextBlock.text);
              }}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Text
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Desktop Selected Text Block Details */}
      {selectedTextBlock && (
        <div className="hidden sm:block mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-blue-900">Selected Text Block</div>
            <div className="text-xs text-blue-600">
              Confidence: {(selectedTextBlock.confidence * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="text-blue-800 font-medium mb-3">
            {selectedTextBlock.text}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedTextBlock.text);
                handleCopyText(selectedTextBlock.text);
              }}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy This Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};