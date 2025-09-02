// src/entities/OcrViewer/ui/ImageWithTextOverlays/index.tsx
"use client";
import { ImageInfo, TextBlock as TextBlockT } from "@/features/ocr/types";
import React, { useState, useRef, useEffect } from "react";
import { useTextBlockSettings } from "../../hooks/useTextBlockSettings";
import { TextBlock } from "../TextBlock";
import { SettingsPanel } from "../SettingsPanel";

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
  const {
    showBoundingBoxes,
    setShowBoundingBoxes,
    textScale,
    setTextScale,
    imageTransparency,
    setImageTransparency,
    fontTransparency,
    setFontTransparency,
    setShowDictionary,
    showDictionary,
  } = useTextBlockSettings();

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

  // Prevent zoom on double tap for better UX
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

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
      <SettingsPanel
        showBoundingBoxes={showBoundingBoxes}
        setShowBoundingBoxes={setShowBoundingBoxes}
        showDictionary={showDictionary}
        setShowDictionary={setShowDictionary}
        textScale={textScale}
        setTextScale={setTextScale}
        imageTransparency={imageTransparency}
        setImageTransparency={setImageTransparency}
        fontTransparency={fontTransparency}
        setFontTransparency={setFontTransparency}
      />

      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`
          relative inline-block w-full bg-white
          touch-pan-x touch-pan-y
          ${className}
        `}
        style={{
          touchAction: "pan-x pan-y", // Allow panning but prevent zoom
        }}
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
            transition-opacity duration-200 pointer-events-none
            ${isImageLoaded ? "opacity-100" : "opacity-0"}
          `}
          style={{
            opacity: isImageLoaded ? imageTransparency : 0,
          }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu on mobile
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
                showDictionary={showDictionary}
              />
            );
          })}

        {/* Selection Hint for Mobile */}
        {isImageLoaded &&
          textBlocks.length > 0 &&
          !selectedTextId?.toString() &&
          showBoundingBoxes && (
            <div className="absolute top-4 left-4 right-4 sm:hidden">
              <div className="bg-blue-600/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                <p className="font-medium">
                  💡 Tap any highlighted text to select it
                </p>
                {showDictionary && (
                  <p className="mt-1 opacity-90">
                    Dictionary lookup will appear after selection
                  </p>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
