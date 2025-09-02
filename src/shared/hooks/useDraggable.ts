import { useEffect, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

export const useDraggable = (
  storageKey: string,
  initialPosition: Position = { x: 0, y: 0 },
  revoke?: boolean
) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (!savedPosition && elementRef.current) {
      setPosition({
        x: elementRef.current.offsetLeft,
        y: elementRef.current.offsetTop,
      });
    }
  }, [storageKey, revoke]);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
      element.style.position = "absolute";
    }
  }, [position]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!elementRef.current) return;
    isDragging.current = true;
    offset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    document.body.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      localStorage.setItem(storageKey, JSON.stringify(position));
      document.body.style.cursor = "default";
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging.current) {
      const newX = event.clientX - offset.current.x;
      const newY = event.clientY - offset.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position]);

  return { elementRef, handleMouseDown };
};
