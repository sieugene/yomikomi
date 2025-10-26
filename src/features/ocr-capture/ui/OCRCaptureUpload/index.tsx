"use client";

import { OCRCapture } from "@/features/ocr-capture/ui/OCRCapture";
import { Button } from "@/shared/ui/button";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import { Scan } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

export function OCRCaptureUpload() {
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setCurrentImageFile(file);
    setShowCaptureModal(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  const handleCloseCapture = () => {
    setShowCaptureModal(false);
    setCurrentImageFile(null);
  };

  return (
    <>
      <Button
        onClick={() => setShowCaptureModal(false)}
        disabled={!currentImageFile}
      >
        <Scan className="w-4 h-4 mr-2" />
        Analyze Image
      </Button>

      <ImageUploader
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onFileInput={handleFileInput}
        onFilesSelected={handleFileSelect}
      />

      {showCaptureModal && currentImageFile && (
        <OCRCapture imageFile={currentImageFile} onClose={handleCloseCapture} />
      )}
    </>
  );
}
