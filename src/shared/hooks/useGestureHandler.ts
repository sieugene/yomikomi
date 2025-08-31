import { useCallback, useRef, useState } from "react";

interface GestureHandlerOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  minSwipeDistance?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export const useGestureHandler = (options: GestureHandlerOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onDoubleTap,
    minSwipeDistance = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const clearLongPressTimeout = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const now = Date.now();
    const x = touch.clientX;
    const y = touch.clientY;

    touchStartRef.current = { x, y, time: now };
    setIsLongPressing(false);

    // Start long press timer
    if (onLongPress) {
      longPressTimeoutRef.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress(x, y);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || !touchStartRef.current) return;

    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Cancel long press if user moves too much
    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimeout();
      setIsLongPressing(false);
    }
  }, [clearLongPressTimeout]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    clearLongPressTimeout();
    
    if (isLongPressing) {
      setIsLongPressing(false);
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch || !touchStartRef.current) return;

    const now = Date.now();
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = now - touchStartRef.current.time;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Handle swipe gestures
    if (deltaTime < 500 && (absX > minSwipeDistance || absY > minSwipeDistance)) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
      touchStartRef.current = null;
      return;
    }

    // Handle double tap
    if (onDoubleTap && deltaTime < 300 && absX < 10 && absY < 10) {
      const x = touch.clientX;
      const y = touch.clientY;

      if (lastTapRef.current) {
        const timeSinceLastTap = now - lastTapRef.current.time;
        const distanceFromLastTap = Math.sqrt(
          Math.pow(x - lastTapRef.current.x, 2) + Math.pow(y - lastTapRef.current.y, 2)
        );

        if (timeSinceLastTap < doubleTapDelay && distanceFromLastTap < 30) {
          onDoubleTap(x, y);
          lastTapRef.current = null;
          touchStartRef.current = null;
          return;
        }
      }

      lastTapRef.current = { time: now, x, y };
    }

    touchStartRef.current = null;
  }, [
    clearLongPressTimeout,
    isLongPressing,
    minSwipeDistance,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDoubleTap,
    doubleTapDelay,
  ]);

  const handleTouchCancel = useCallback(() => {
    clearLongPressTimeout();
    setIsLongPressing(false);
    touchStartRef.current = null;
    lastTapRef.current = null;
  }, [clearLongPressTimeout]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    isLongPressing,
  };
};