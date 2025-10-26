// src/features/ocr-capture/lib/coordinates.ts

export interface RelativeCoordinates {
  x: number;
  y: number;
}

export interface ScaleFactors {
  scaleX: number;
  scaleY: number;
}

export interface SelectionBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Convert client coordinates to image-relative coordinates
 */
export const getRelativeCoordinates = (
  clientX: number,
  clientY: number,
  imageElement: HTMLImageElement
): RelativeCoordinates => {
  const imgRect = imageElement.getBoundingClientRect();
  const x = ((clientX - imgRect.left) / imgRect.width) * imageElement.naturalWidth;
  const y = ((clientY - imgRect.top) / imgRect.height) * imageElement.naturalHeight;
  return { x, y };
};

/**
 * Calculate scale factors between displayed and natural image size
 */
export const getScaleFactors = (imageElement: HTMLImageElement): ScaleFactors => {
  const imgRect = imageElement.getBoundingClientRect();
  return {
    scaleX: imgRect.width / imageElement.naturalWidth,
    scaleY: imgRect.height / imageElement.naturalHeight,
  };
};

/**
 * Calculate selection bounds from start and end coordinates
 */
export const getSelectionBounds = (
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SelectionBounds => {
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Check if selection is large enough to be valid
 */
export const isSelectionValid = (bounds: SelectionBounds, minSize: number): boolean => {
  return bounds.width >= minSize && bounds.height >= minSize;
};