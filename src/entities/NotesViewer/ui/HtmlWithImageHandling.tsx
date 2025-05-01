"use client";
import { useEffect, useRef, useState } from "react";

const globalFailedImagesCache = new Set<string>();

export const HtmlWithImageHandling = ({
  html,
  onImageLoad,
}: {
  html: string;
  noteId: string;
  onImageLoad?: () => void;
}) => {
  const [removeFailedImages, setRemoveFailedImages] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const processHtml = (html: string): string => {
    if (!removeFailedImages) {
      return html;
    }

    return html.replace(/<img[^>]*>/gi, "");
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const images = container.querySelectorAll("img");

    const handleImageLoad = (img: HTMLImageElement) => {
      if (onImageLoad) onImageLoad();
    };

    const handleImageError = (img: HTMLImageElement) => {
      const src = img.src;
      globalFailedImagesCache.add(src);
      img.style.display = "none";
    };

    images.forEach((img) => {
      const src = img.src;
      if (globalFailedImagesCache.has(src)) {
        img.style.display = "none";
        return;
      }

      if (img.complete && img.naturalHeight !== 0) {
        handleImageLoad(img);
        return;
      }

      img.addEventListener("load", () => handleImageLoad(img));
      img.addEventListener("error", () => handleImageError(img));
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", () => handleImageLoad(img));
        img.removeEventListener("error", () => handleImageError(img));
      });
    };
  }, [html, onImageLoad]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: processHtml(html) }}
    />
  );
};
