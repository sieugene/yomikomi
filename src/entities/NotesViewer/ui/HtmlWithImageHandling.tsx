"use client";
import { FormattedImportData } from "@/features/Collection/types";
import { useEffect, useRef, useState } from "react";

export const HtmlWithImageHandling = ({
  html,
  media,
}: {
  html: string;
  noteId: string;
  media: FormattedImportData["media"];
}) => {
  const [processedHtml, setProcessedHtml] = useState<null | string>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const staticRender = async () => {
    const usedFilenames = new Set(
      Array.from(html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi))
        .map(([, src]) => src.split("/").pop())
        .filter(Boolean) as string[]
    );

    const mediaUrls: Record<string, string> = {};
    await Promise.all(
      media
        .filter((item) => usedFilenames.has(item.originalName))
        .map(async (item) => {
          if (!item.getBlob) {
            mediaUrls[item.originalName] = item.path;
            return;
          }
          const blobUrl = await item.getBlob();
          mediaUrls[item.originalName] = blobUrl;
        })
    );

    const updatedHtml = html.replace(
      /<img[^>]*src=["']([^"']+)["'][^>]*>/gi,
      (match, src) => {
        const filename = src.split("/").pop() as string;
        const newSrc = mediaUrls[filename];
        return newSrc ? match.replace(src, newSrc) : "";
      }
    );

    setProcessedHtml(updatedHtml);
  };

  useEffect(() => {
    staticRender();
  }, []);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: processedHtml || "" }}
    />
  );
};
