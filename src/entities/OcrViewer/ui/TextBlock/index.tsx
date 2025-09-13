import type { TextBlock as TextBlockT } from "@/features/ocr/types";
import { FC, useCallback, useMemo, useState } from "react";

import { useDoubleTap } from "@/shared/hooks/useDoubleTap";
import { CompactDictionaryLookup } from "../../../OcrCompactDictionaryLookup/ui/CompactDictionaryLookup";
import { useCompactDictionary } from "../../hooks/useCompactDictionary";
import { ContextMenu } from "../ContextMenu";

type Props = {
  textBlock: TextBlockT;
  showBoundingBoxes: boolean;
  showDictionary: boolean;
  isSelected: boolean;
  onTextClick: (textBlock: TextBlockT) => void;
  onTextCopy?: (text: string) => void;
  displayDimensions: {
    width: number;
    height: number;
  };
  originalDimensions: {
    width: number;
    height: number;
  };
  fontTransparency: number;
  textScale: number;
};

export const TextBlock: FC<Props> = ({
  textBlock,
  displayDimensions,
  originalDimensions,
  onTextClick,
  onTextCopy,
  isSelected,
  fontTransparency,
  showBoundingBoxes,
  textScale,
  showDictionary,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const dictionary = useCompactDictionary();

  // Calculate scaled coordinates
  const coords = useMemo(() => {
    if (
      displayDimensions.width === 0 ||
      displayDimensions.height === 0 ||
      originalDimensions.width === 0 ||
      originalDimensions.height === 0
    ) {
      return null;
    }

    const scaleX = displayDimensions.width / originalDimensions.width;
    const scaleY = displayDimensions.height / originalDimensions.height;

    return {
      x: textBlock.bbox.x_min * scaleX,
      y: textBlock.bbox.y_min * scaleY,
      width: textBlock.bbox.width * scaleX,
      height: textBlock.bbox.height * scaleY,
    };
  }, [displayDimensions, originalDimensions, textBlock]);

  const fontSize = useMemo(() => {
    if (!coords) return 12;

    const baseSize = Math.min(coords.height / 3, 4);
    const scaledSize = baseSize * textScale;

    return scaledSize;
  }, [coords, textScale]);

  const handleDoubleTap = useCallback(
    () => {
      setShowContextMenu(true);
      onTextClick(textBlock);
      // dictionary.handleToggle(textBlock.text);
    },
    [dictionary, showDictionary, textBlock.text]
  );

  const { handleTouchEnd } = useDoubleTap({
    onDoubleTap: handleDoubleTap,
    doubleTapDelay: 800,
  });

  // Context menu actions
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textBlock.text);
      onTextCopy?.(textBlock.text);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }, [textBlock.text, onTextCopy]);

  const handleTranslate = useCallback(() => {
    if (showDictionary) {
      dictionary.handleOpen(textBlock.text);
    }
  }, [dictionary, showDictionary, textBlock.text]);

  const handleSearch = useCallback(() => {
    const query = encodeURIComponent(textBlock.text);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
  }, [textBlock.text]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: textBlock.text,
          title: "OCR Text",
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    }
  }, [textBlock.text]);

  if (!coords) return null;

  // Dynamic styling based on state and settings
  const getBoundingBoxStyle = () => {
    const baseClasses =
      "overflow-hidden absolute cursor-pointer user-select-none touch-manipulation transition-all duration-150 ease-out";

    if (!showBoundingBoxes)
      return `${baseClasses} bg-transparent border-transparent`;

    if (isSelected) {
      return `${baseClasses} bg-blue-500/20 shadow-lg shadow-blue-500/20`;
    }

    return `${baseClasses} bg-green-500/10 hover:bg-green-500/20`;
  };

  const getTextStyle = () => {
    const baseClasses = "select-none font-medium transition-all duration-150";

    if (isSelected) {
      return `${baseClasses} text-blue-900 drop-shadow-sm`;
    }

    return `${baseClasses} text-gray-800 drop-shadow-sm`;
  };

  return (
    <>
      <div
        className={`${getBoundingBoxStyle()} ${
          isSelected ? "z-20 overflow-y-scroll" : "z-10"
        }`}
        style={{
          left: coords.x,
          top: coords.y,
          width: coords.width,
          height: coords.height,
        }}
        onClick={() => {
          onTextClick(textBlock);
        }}
        onTouchEnd={isSelected ? handleTouchEnd : () => {}}
        onMouseUp={isSelected ? handleTouchEnd : () => {}}
        title={`${textBlock.text} (${(textBlock.confidence * 100).toFixed(
          1
        )}%)`}
        role="button"
        tabIndex={0}
        aria-label={`Text block: ${textBlock.text}`}
        aria-pressed={isSelected}
        data-text-block-id={textBlock.id}
      >
        {/* Text overlay - only show when selected or pressed */}
        {
          <div
            className={`
              ${getTextStyle()}
            `}
            style={{
              fontSize: `${fontSize}px`,
              opacity: fontTransparency,
            }}
          >
            <span
              className="text-left break-words black block max-w"
              style={{
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                textAlign: "justify",
                textAlignLast: "justify",
              }}
            >
              {textBlock.text}
            </span>
          </div>
        }

        {/* Confidence indicator for selected blocks */}
        {isSelected && showBoundingBoxes && (
          <div
            className="absolute -top-6 left-0 px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-medium shadow-sm z-30"
            style={{ fontSize: "10px" }}
          >
            {(textBlock.confidence * 100).toFixed(0)}%
          </div>
        )}

        {/* Selection indicator dots */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 z-30">
            <div className="w-3 h-3 bg-blue-600 rounded-full border-white shadow-sm animate-pulse" />
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={showContextMenu}
        coordsY={coords.y}
        selectedText={textBlock.text}
        onClose={() => setShowContextMenu(false)}
        onCopy={handleCopy}
        onTranslate={handleTranslate}
        onSearch={handleSearch}
        onShare={handleShare}
      />

      {/* Compact Dictionary Lookup */}
      {showDictionary && isSelected && (
        <CompactDictionaryLookup
          sentence={textBlock.text}
          isOpen={dictionary.isOpen}
          onClose={dictionary.handleClose}
        />
      )}
    </>
  );
};
