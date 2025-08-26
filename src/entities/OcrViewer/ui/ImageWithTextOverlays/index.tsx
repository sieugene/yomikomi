"use client";
import { TextBlock } from "@/features/ocr/types";
import React, { useState, useRef, useEffect } from "react";

interface ImageWithTextOverlaysProps {
  imageUrl: string;
  textBlocks: TextBlock[];
  onTextClick: (textBlock: TextBlock) => void;
  className?: string;
  selectedTextId: TextBlock["id"] | undefined;
}

export const ImageWithTextOverlays: React.FC<ImageWithTextOverlaysProps> = ({
  imageUrl,
  textBlocks,
  onTextClick,
  className = "",
  selectedTextId,
}) => {
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const imageRef = useRef<HTMLImageElement>(null);

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

    image.onload = updateDimensions;
    if (image.complete) {
      updateDimensions();
    }

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(image);

    return () => {
      resizeObserver.disconnect();
    };
  }, [imageUrl]);

  const getScaledCoordinates = (textBlock: TextBlock) => {
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
  };

  const handleTextClick = (textBlock: TextBlock) => {
    onTextClick?.(textBlock);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="OCR Image"
        className="max-w-full h-auto border rounded-lg shadow-sm"
      />

      {textBlocks.map((textBlock) => {
        const coords = getScaledCoordinates(textBlock);
        if (!coords) return null;

        const isSelected = selectedTextId === textBlock.id;

        return (
          <div
            key={textBlock.id}
            className={`absolute cursor-pointer transition-all duration-200 ${
              isSelected
                ? "bg-blue-500/30 border-2 border-blue-500"
                : "bg-green-500/20 border border-green-500 hover:bg-green-500/30"
            }`}
            style={{
              left: coords.x,
              top: coords.y,
              width: coords.width,
              height: coords.height,
            }}
            onClick={() => handleTextClick(textBlock)}
            title={`Text: ${textBlock.text}\nConfidence: ${(
              textBlock.confidence * 100
            ).toFixed(1)}%`}
          >
            {coords.height > 20 && coords.width > 40 && (
              <div
                className="text-xs font-semibold text-gray-800 p-1 truncate"
                style={{
                  fontSize: Math.min(coords.height / 3, 12),
                }}
              >
                {textBlock.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
