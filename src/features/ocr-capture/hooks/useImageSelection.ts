import { useState, useRef, useCallback, useEffect } from "react";
import { SelectionArea } from "../types";
import { getRelativeCoordinates, getScaleFactors } from "../lib/coordinates";

export interface UseImageSelectionProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  isDisabled?: boolean;
}

export const useImageSelection = ({
  imageRef,
  containerRef,
  overlayRef,
  isDisabled = false,
}: UseImageSelectionProps) => {
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Update overlay DOM directly for performance
  const updateOverlay = useCallback((x: number, y: number) => {
    if (!selection || !overlayRef.current || !imageRef.current || !containerRef.current) {
      return;
    }

    const img = imageRef.current;
    const container = containerRef.current;
    const overlay = overlayRef.current;

    const containerRect = container.getBoundingClientRect();
    const imageRect = img.getBoundingClientRect();
    const { scaleX, scaleY } = getScaleFactors(img);

    const minX = Math.min(selection.startX, x) * scaleX;
    const minY = Math.min(selection.startY, y) * scaleY;
    const width = Math.abs((x - selection.startX) * scaleX);
    const height = Math.abs((y - selection.startY) * scaleY);

    const left = minX + (imageRect.left - containerRect.left);
    const top = minY + (imageRect.top - containerRect.top);

    // Direct DOM manipulation for 60fps
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.display = "block";

    // Update size label
    const label = overlay.querySelector(".size-label");
    if (label) {
      label.textContent = `${Math.round(width / scaleX)}×${Math.round(height / scaleY)}`;
    }
  }, [selection, imageRef, containerRef, overlayRef]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDisabled || !imageRef.current) return;
    const coords = getRelativeCoordinates(e.clientX, e.clientY, imageRef.current);
    setSelection({ startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y });
    setIsSelecting(true);
  }, [isDisabled, imageRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selection || isDisabled || !imageRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const coords = getRelativeCoordinates(e.clientX, e.clientY, imageRef.current);

    rafRef.current = requestAnimationFrame(() => {
      setSelection((prev) => (prev ? { ...prev, endX: coords.x, endY: coords.y } : null));
      updateOverlay(coords.x, coords.y);
    });
  }, [isSelecting, selection, isDisabled, imageRef, updateOverlay]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isDisabled || !imageRef.current) return;
    const touch = e.touches[0];
    const coords = getRelativeCoordinates(touch.clientX, touch.clientY, imageRef.current);
    setSelection({ startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y });
    setIsSelecting(true);
    e.preventDefault();
  }, [isDisabled, imageRef]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || !selection || isDisabled || !imageRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const touch = e.touches[0];
    const coords = getRelativeCoordinates(touch.clientX, touch.clientY, imageRef.current);

    rafRef.current = requestAnimationFrame(() => {
      setSelection((prev) => (prev ? { ...prev, endX: coords.x, endY: coords.y } : null));
      updateOverlay(coords.x, coords.y);
    });

    e.preventDefault();
  }, [isSelecting, selection, isDisabled, imageRef, updateOverlay]);

  const handleTouchEnd = useCallback(() => {
    setIsSelecting(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection(null);
    if (overlayRef.current) {
      overlayRef.current.style.display = "none";
    }
  }, [overlayRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    selection,
    isSelecting,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    clearSelection,
  };
};