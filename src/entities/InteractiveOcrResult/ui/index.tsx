import { Copy, Download } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ImageWithTextOverlays } from "./ImageWithTextOverlays";
import { TextBlocksList } from "./TextBlocksList";

import { OCRResponse } from "@/features/ocr/types";
import { useDownloadText } from "../hooks/useDownloadText";
import { useInteractiveOcr } from "../hooks/useInteractiveOcr";
import { useOcrCopy } from "../hooks/useOcrCopy";

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
  const { handleTextBlockClick, selectedTextBlock } = useInteractiveOcr();
  const { handleCopyFullText, handleCopyText } = useOcrCopy(setCopyFeedback);
  const { handleDownloadText } = useDownloadText();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Image with overlays */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Image with Detected Text
        </h2>
        <ImageWithTextOverlays
          selectedTextId={selectedTextBlock?.id || undefined}
          imageUrl={imageUrl}
          textBlocks={result.text_blocks}
          onTextClick={handleTextBlockClick}
          className="w-full"
        />
        {selectedTextBlock && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">
              Selected Text Block:
            </div>
            <div className="text-blue-800 font-medium">
              {selectedTextBlock.text}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Confidence: {(selectedTextBlock.confidence * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Text blocks and full text */}
      <div className="space-y-6">
        {/* Full Text */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Full Text</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopyFullText(result)}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
              <button
                onClick={() => handleDownloadText(result)}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-64 overflow-y-auto">
              {result.full_text}
            </pre>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {result.text_blocks.length} text blocks detected
            {result.image_info && (
              <>
                {" "}
                • Image: {result.image_info.width} × {result.image_info.height}
                px
              </>
            )}
          </div>
        </div>

        {/* Text Blocks List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TextBlocksList
            textBlocks={result.text_blocks}
            onTextBlockClick={handleTextBlockClick}
            onCopyText={handleCopyText}
          />
        </div>
      </div>
    </div>
  );
};
