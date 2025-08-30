"use client";
import { ImageInfo, TextBlock as TextBlockT } from "@/features/ocr/types";
import React, { useState, useRef, useEffect } from "react";
import { useTextBlockSettings } from "../../hooks/useTextBlockSettings";
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

  return (
    <div>
      <div className="block-settings">
        <label className="mr-4">
          <input
            type="checkbox"
            checked={showDictionary}
            onChange={(e) => setShowDictionary(e.target.checked)}
            className="mr-1"
          />
          Show dictionary
        </label>
        <label className="mr-4">
          <input
            type="checkbox"
            checked={showBoundingBoxes}
            onChange={(e) => setShowBoundingBoxes(e.target.checked)}
            className="mr-1"
          />
          Show Bounding Boxes
        </label>
        <h2>Font scale settings</h2>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={textScale}
          onChange={(e) => setTextScale(parseFloat(e.target.value))}
          className="w-48"
        />
        <span className="ml-2">{textScale.toFixed(1)}x</span>
        <h2>Font Transparency</h2>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={fontTransparency}
          onChange={(e) => setFontTransparency(parseFloat(e.target.value))}
          className="w-48"
        />
        <span className="ml-2">{(fontTransparency * 100).toFixed(0)}%</span>
        <h2>Image Transparency</h2>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={imageTransparency}
          onChange={(e) => setImageTransparency(parseFloat(e.target.value))}
          className="w-48"
        />
        <span className="ml-2">{(imageTransparency * 100).toFixed(0)}%</span>
      </div>
      <div className={`relative inline-block ${className}`}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="OCR Image"
          // height={originalDimensions.height}
          // width={originalDimensions.width}
          className="w-full h-full max-w-full border rounded-lg shadow-sm "
          style={{ opacity: imageTransparency }}
        />

        {textBlocks.map((textBlock) => {
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
      </div>
    </div>
  );
};
