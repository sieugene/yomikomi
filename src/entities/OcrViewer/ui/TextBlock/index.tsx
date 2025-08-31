// src/entities/OcrViewer/ui/TextBlock/index.tsx
import type { TextBlock as TextBlockT } from "@/features/ocr/types";
import { FC, useCallback, useMemo, useState } from "react";
import { useGestureHandler } from "../../../../shared/hooks/useGestureHandler";
import { useCompactDictionary } from "../../hooks/useCompactDictionary";
import { CompactDictionaryLookup } from "../../../OcrCompactDictionaryLookup/ui/CompactDictionaryLookup";
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
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  
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

  // Calculate responsive font size
  const fontSize = useMemo(() => {
    if (!coords) return 12;
    
    const baseSize = Math.min(coords.height / 3, 12);
    const scaledSize = baseSize * textScale;
    
    // Ensure minimum readable size on mobile
    const minSize = window.innerWidth < 640 ? 10 : 8;
    const maxSize = window.innerWidth < 640 ? 16 : 20;
    
    return Math.max(minSize, Math.min(maxSize, scaledSize));
  }, [coords, textScale]);

  // Gesture handlers
  const handleLongPress = useCallback((x: number, y: number) => {
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
    onTextClick(textBlock);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [onTextClick, textBlock]);

  const handleDoubleTap = useCallback(() => {
    if (showDictionary) {
      dictionary.handleToggle(textBlock.text);
    }
  }, [dictionary, showDictionary, textBlock.text]);

  const handleSwipeUp = useCallback(() => {
    if (isSelected && showDictionary) {
      dictionary.handleOpen(textBlock.text);
    }
  }, [dictionary, isSelected, showDictionary, textBlock.text]);

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    isLongPressing,
  } = useGestureHandler({
    onLongPress: handleLongPress,
    onDoubleTap: handleDoubleTap,
    onSwipeUp: handleSwipeUp,
  });

  // Context menu actions
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textBlock.text);
      onTextCopy?.(textBlock.text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [textBlock.text, onTextCopy]);

  const handleTranslate = useCallback(() => {
    if (showDictionary) {
      dictionary.handleOpen(textBlock.text);
    }
  }, [dictionary, showDictionary, textBlock.text]);

  const handleSearch = useCallback(() => {
    const query = encodeURIComponent(textBlock.text);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  }, [textBlock.text]);


  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: textBlock.text,
          title: 'OCR Text',
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  }, [textBlock.text]);

  // Touch event handlers with gesture support
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsPressed(true);
    
    // Convert to touch event for gesture handler
    const touchEvent = {
      touches: [{ clientX: e.clientX, clientY: e.clientY }],
    } as unknown;
    
    handleTouchStart(touchEvent as React.TouchEvent);
  }, [handleTouchStart]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const touchEvent = {
      touches: [{ clientX: e.clientX, clientY: e.clientY }],
    } as unknown;
    
    handleTouchMove(touchEvent as React.TouchEvent);
  }, [handleTouchMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsPressed(false);
    
    if (!isLongPressing && !showContextMenu) {
      onTextClick(textBlock);
    }

    const touchEvent = {
      changedTouches: [{ clientX: e.clientX, clientY: e.clientY }],
    } as unknown;
    
    handleTouchEnd(touchEvent as React.TouchEvent);
  }, [handleTouchEnd, isLongPressing, onTextClick, textBlock, showContextMenu]);

  const handlePointerCancel = useCallback(() => {
    setIsPressed(false);
    handleTouchCancel();
  }, [handleTouchCancel]);

  if (!coords) return null;

  // Dynamic styling based on state and settings
  const getBoundingBoxStyle = () => {
    const baseClasses = "overflow-hidden absolute cursor-pointer user-select-none touch-manipulation transition-all duration-150 ease-out";
    
    if (!showBoundingBoxes) return `${baseClasses} bg-transparent border-transparent`;
    
    if (isSelected) {
      return `${baseClasses} bg-blue-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20 ${
        isPressed || isLongPressing ? 'bg-blue-500/30 scale-[1.02]' : ''
      }`;
    }
    
    return `${baseClasses} bg-green-500/10 border border-green-400 hover:bg-green-500/20 ${
      isPressed ? 'bg-green-500/25 scale-[1.01]' : ''
    }`;
  };

  const getTextStyle = () => {
    const baseClasses = "pointer-events-none select-none font-medium transition-all duration-150";
    
    if (isSelected) {
      return `${baseClasses} text-blue-900 drop-shadow-sm`;
    }
    
    return `${baseClasses} text-gray-800 drop-shadow-sm`;
  };

  return (
    <>
      <div
        className={`${getBoundingBoxStyle()} ${isSelected ? 'z-20' : 'z-10'}`}
        style={{
          left: coords.x,
          top: coords.y,
          width: coords.width,
          height: coords.height,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => setIsPressed(false)}
        title={`${textBlock.text} (${(textBlock.confidence * 100).toFixed(1)}%)`}
        role="button"
        tabIndex={0}
        aria-label={`Text block: ${textBlock.text}`}
        aria-pressed={isSelected}
        data-text-block-id={textBlock.id}
      >
        {/* Long press indicator */}
        {isLongPressing && (
          <div className="absolute inset-0 bg-orange-500/30 rounded animate-pulse border-2 border-orange-500" />
        )}

        {/* Text overlay - only show when selected or pressed */}
        {(isSelected || isPressed) && (
          <div
            className={`
              absolute inset-0 flex items-center justify-center p-1
              ${getTextStyle()}
            `}
            style={{
              fontSize: `${fontSize}px`,
              opacity: fontTransparency,
              lineHeight: '1.1',
            }}
          >
            <span 
              className="text-center break-words leading-tight"
              style={{
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              }}
            >
              {textBlock.text}
            </span>
          </div>
        )}

        {/* Confidence indicator for selected blocks */}
        {isSelected && showBoundingBoxes && (
          <div 
            className="absolute -top-6 left-0 px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-medium shadow-sm z-30"
            style={{ fontSize: '10px' }}
          >
            {(textBlock.confidence * 100).toFixed(0)}%
          </div>
        )}

        {/* Selection indicator dots */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 z-30">
            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm animate-pulse" />
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={showContextMenu}
        position={contextMenuPosition}
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
