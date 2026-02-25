import { AlbumList } from "@/features/ocr-album/ui/AlbumList";
import { BatchUpload } from "@/features/ocr-album/ui/BatchUpload";
import { ProgressTracker } from "@/features/ocr-album/ui/ProgressTracker";
import { useClientRoutes } from "@/shared/hooks/useClientRoutes";
import { redirect } from "next/navigation";

import React from "react";

export const OCRPage: React.FC = () => {
  const { routes: ROUTES } = useClientRoutes();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Japanese OCR Tool
          </h1>
          <p className="text-gray-600">
            Upload an image to extract Japanese text with precise positioning
          </p>
        </div>

        <BatchUpload />
        <ProgressTracker />
        <AlbumList
          onAlbumSelect={(album) => {
            redirect(ROUTES.album({ albumId: album.id, page: 1 }));
          }}
        />
      </div>
    </div>
  );
};
