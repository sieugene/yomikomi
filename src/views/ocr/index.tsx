import { OCRCatalogAlbum } from "@/features/ocr-catalog/types";
import { AlbumList } from "@/features/ocr-catalog/ui/AlbumList";
import { AlbumViewer } from "@/features/ocr-catalog/ui/AlbumViewer";
import { BatchUpload } from "@/features/ocr-catalog/ui/BatchUpload";
import { ProgressTracker } from "@/features/ocr-catalog/ui/ProgressTracker";
import { OCRSettingsPanel } from "@/features/ocr-settings/ui";

import React, { useState } from "react";

export const OCRPage: React.FC = () => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<
    OCRCatalogAlbum["id"] | null
  >(null);
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);
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
        <button
          style={{ border: "1px solid blue", cursor: "pointer" }}
          onClick={() => setSettingsIsOpen(true)}
        >
          Open Ocr Settings
        </button>
        <OCRSettingsPanel
          isOpen={settingsIsOpen}
          onClose={() => setSettingsIsOpen(false)}
        />
        <BatchUpload />
        <ProgressTracker />
        <AlbumList
          onAlbumSelect={(album) => {
            setSelectedAlbumId(album.id);
          }}
        />
        <AlbumViewer albumId={selectedAlbumId} />
      </div>
    </div>
  );
};
