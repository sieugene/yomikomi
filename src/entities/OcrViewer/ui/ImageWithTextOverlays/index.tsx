// src/entities/OcrViewer/ui/ImageWithTextOverlays/index.tsx
"use client";
import { CompactDictionaryLookup } from "@/entities/OcrCompactDictionaryLookup/ui/CompactDictionaryLookup";
import { ImageInfo, TextBlock as TextBlockT } from "@/features/ocr/types";
import React, { useEffect, useRef, useState } from "react";
import { useCompactDictionary } from "../../hooks/useCompactDictionary";
import { useTextBlockSettings } from "../../hooks/useTextBlockSettings";
import { SettingsPanel } from "../SettingsPanel";
import { TextBlock } from "../TextBlock";

interface ImageWithTextOverlaysProps {
  imageUrl: string;
  textBlocks: TextBlockT[];
  onTextClick: (textBlock: TextBlockT) => void;
  className?: string;
  selectedTextId: TextBlockT["id"] | undefined;
  imageInfo: ImageInfo;
}

export const ImageWithTextOverlays: React.FC<ImageWithTextOverlaysProps> = ({
  imageUrl,
  textBlocks,
  onTextClick,
  className = "",
  selectedTextId,
}) => {
  const dictionary = useCompactDictionary();

  const settingsControl = useTextBlockSettings();
  const {
    showBoundingBoxes,
    textScale,
    imageTransparency,
    fontTransparency,
    rotateContent,
  } = settingsControl;

  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle image loading and dimension calculations
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const updateDimensions = () => {
      const rect = image.getBoundingClientRect();
      setDisplayDimensions({
        width: rect.width,
        height: rect.height,
      });
      setOriginalDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    const handleLoad = () => {
      setIsImageLoaded(true);
      setImageError(false);
      updateDimensions();
    };

    const handleError = () => {
      setImageError(true);
      setIsImageLoaded(false);
    };

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);

    if (image.complete && image.naturalWidth > 0) {
      handleLoad();
    }

    // Use ResizeObserver for better performance than window resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(image);

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      resizeObserver.disconnect();
    };
  }, [imageUrl]);

  if (imageError) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gray-50 rounded-lg border-2 border-gray-200">
        <div className="text-center p-6">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Failed to load image</p>
          <p className="text-gray-400 text-sm mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SettingsPanel settingsControl={settingsControl} />

      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`
          relative inline-block w-full bg-white no-select ${rotateContent ? "rotate-90" : "rotate-0"}
          ${className}
        `}
      >
        {/* Loading State */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500 text-sm">Loading image...</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="OCR Image"
          className={`
            w-full h-auto max-w-full border rounded-lg shadow-sm
            transition-opacity duration-200 no-select
            ${isImageLoaded ? "opacity-100" : "opacity-0"}
          `}
          style={{
            opacity: isImageLoaded ? imageTransparency : 0,
          }}
          draggable={false}
        />

        {/* Text Block Overlays */}
        {isImageLoaded &&
          textBlocks.map((textBlock) => {
            const isSelected = selectedTextId === textBlock.id;

            return (
              <TextBlock
                key={textBlock.id}
                displayDimensions={displayDimensions}
                fontTransparency={fontTransparency}
                isSelected={isSelected}
                onTextClick={onTextClick}
                originalDimensions={originalDimensions}
                showBoundingBoxes={showBoundingBoxes}
                textBlock={textBlock}
                textScale={textScale}
                onOpenDictionary={() => dictionary.handleOpen(textBlock.text)}
                rotateContent={rotateContent}
              />
            );
          })}
      </div>

      <CompactDictionaryLookup
        sentence={dictionary.selectedText || ""}
        isOpen={dictionary.isOpen}
        onClose={dictionary.handleClose}
      />
    </div>
  );
};
