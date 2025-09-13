import { useCallback, useRef } from "react";

interface UseDoubleTapOptions {
  onDoubleTap: (x: number, y: number) => void;
  doubleTapDelay?: number;
}

export const useDoubleTap = (options: UseDoubleTapOptions) => {
  const { onDoubleTap, doubleTapDelay = 300 } = options;
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  const getAbsoluteCoords = useCallback(
    (event: React.Touch | React.MouseEvent) => {
      let x = 0;
      let y = 0;

      if ("pageX" in event && "pageY" in event) {
        x = event.pageX;
        y = event.pageY;
      }

      return { x, y };
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const touch = "changedTouches" in e ? e.changedTouches[0] : e;
      if (!touch) return;

      const now = Date.now();
      const { x, y } = getAbsoluteCoords(touch);

      if (lastTapRef.current) {
        const timeSinceLastTap = now - lastTapRef.current.time;
        const distance = Math.hypot(x - lastTapRef.current.x, y - lastTapRef.current.y);

        if (timeSinceLastTap < doubleTapDelay && distance < 30) {
          onDoubleTap(x, y);
          lastTapRef.current = null;
          return;
        }
      }

      lastTapRef.current = { time: now, x, y };
    },
    [getAbsoluteCoords, onDoubleTap, doubleTapDelay]
  );

  return {
    handleTouchEnd,
  };
};
