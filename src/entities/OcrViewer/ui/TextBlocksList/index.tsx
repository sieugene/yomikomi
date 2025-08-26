import React from "react";

import { Copy, Eye } from "lucide-react";
import { TextBlock } from "@/features/ocr/types";

interface TextBlocksListProps {
  textBlocks: TextBlock[];
  onTextBlockClick: (textBlock: TextBlock) => void;
  onCopyText: (text: string) => void;
  className?: string;
}

export const TextBlocksList: React.FC<TextBlocksListProps> = ({
  textBlocks,
  onTextBlockClick,
  onCopyText,
  className = "",
}) => {
  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      onCopyText?.(text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-50";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Detected Text Blocks ({textBlocks.length})
        </h3>
      </div>

      {textBlocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No text blocks detected
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {textBlocks.map((textBlock) => (
            <div
              key={textBlock.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group"
              onClick={() => onTextBlockClick?.(textBlock)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-1 break-words">
                    {textBlock.text}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${getConfidenceColor(
                        textBlock.confidence
                      )}`}
                    >
                      {(textBlock.confidence * 100).toFixed(1)}%
                    </span>
                    <span>
                      Size: {Math.round(textBlock.bbox.width)} ×{" "}
                      {Math.round(textBlock.bbox.height)}
                    </span>
                    <span>
                      Pos: ({Math.round(textBlock.bbox.x_min)},{" "}
                      {Math.round(textBlock.bbox.y_min)})
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleCopy(textBlock.text, e)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy text"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
