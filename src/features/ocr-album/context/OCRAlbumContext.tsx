import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";
import { useOcr } from "@/features/ocr/hooks/useOcr";
import React, { createContext, useContext, useState } from "react";
import { useAlbumRepository } from "../hooks/useAlbumRepository";
import { createAlbumId, createAlbumImageId, generateFilename } from "../lib";
import {
  BatchProcessingProgress,
  OCRAlbumAlbum,
  OCRAlbumContextType,
  OCRAlbumImage,
} from "../types";
import { toast } from "sonner";

const OCRAlbumContext = createContext<OCRAlbumContextType | undefined>(
  undefined
);

export const OCRAlbumProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useOCRSettings();
  const { ocrProcess } = useOcr();
  const [currentAlbum, setCurrentAlbum] = useState<OCRAlbumAlbum | null>(null);
  const [batchProgress, setBatchProgress] =
    useState<BatchProcessingProgress | null>(null);

  const {
    db,
    isDbReady,
    albums,
    refetchAlbums,
    createAlbum,
    getAlbum,
    getAlbumImages,
    getImageFile,
    deleteAlbum,
  } = useAlbumRepository();

  const handleCreateAlbum = async (
    name: string,
    files: File[]
  ): Promise<string> => {
    if (!isDbReady) throw new Error("Database not ready");

    const albumId = createAlbumId();
    const now = new Date();

    const album: OCRAlbumAlbum = {
      id: albumId,
      name,
      createdAt: now,
      updatedAt: now,
      totalImages: files.length,
      processedImages: 0,
      failedImages: 0,
      status: "pending",
    };

    // Sort files by name to maintain consistent order
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

    // Create images with order based on filename
    const images: OCRAlbumImage[] = sortedFiles.map((file, index) => ({
      id: createAlbumImageId(albumId, index),
      filename: generateFilename(file.name, index),
      processedAt: now,
      status: "pending",
      order: index,
      fileSize: file.size,
      mimeType: file.type,
      albumId: album.id,
    }));

    try {
      // Store album
      await createAlbum(album);

      // Store images and files
      for (const [index, image] of images.entries()) {
        await db?.createImage(image, sortedFiles[index]);
      }

      await refetchAlbums();
      return albumId;
    } catch (error) {
      console.error("Failed to create album:", error);
      throw error;
    }
  };

  const updateAlbumStatus = async (
    albumId: string,
    processedCount: number,
    failedCount: number
  ) => {
    const album = await db?.getAlbum(albumId);
    if (!album) return;

    const totalImages = album.totalImages;
    let status: OCRAlbumAlbum["status"];

    if (processedCount + failedCount >= totalImages) {
      status =
        failedCount === 0
          ? "completed"
          : failedCount === totalImages
          ? "partial"
          : "partial";
    } else {
      status =
        processedCount === 0 && failedCount === 0 ? "pending" : "processing";
    }

    const updatedAlbum: OCRAlbumAlbum = {
      ...album,
      processedImages: processedCount,
      failedImages: failedCount,
      status,
      updatedAt: new Date(),
    };

    await db?.updateAlbum(updatedAlbum);
    await refetchAlbums();

    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(updatedAlbum);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    await deleteAlbum(albumId);
    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(null);
    }
  };

  const processImageBatch = async (images: OCRAlbumImage[]): Promise<void> => {
    const batchPromises = images.map(async (image) => {
      try {
        // Update status to processing
        const updatedImage: OCRAlbumImage = {
          ...image,
          // Clear prev error
          error: undefined,
          status: "processing" as const,
        };
        await db?.updateImage(updatedImage);

        const dbFile = await db?.getImageFile(image.id);

        if (!dbFile) {
          throw new Error("File not found");
        }
        const { result: ocrResult, resizedFile } = await ocrProcess(
          dbFile,
          settings
        );

        if (!ocrResult) throw new Error("OCR result is missing");

        //  Update with result
        const completedImage: OCRAlbumImage = {
          ...updatedImage,
          status: "completed",
          ocrResult,
          processedAt: new Date(),
        };
        await db?.updateImage(completedImage, resizedFile);

        return { success: true, image: completedImage };
      } catch (error) {
        toast(
          "Failed to process image. Please check the uploaded image or OCR settings"
        );
        // Update with error
        const failedImage: OCRAlbumImage = {
          ...image,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          processedAt: new Date(),
        };
        await db?.updateImage(failedImage);

        return { success: false, image: failedImage };
      }
    });

    await Promise.all(batchPromises);
  };

  const startBatchProcessing = async (albumId: string): Promise<void> => {
    if (!isDbReady) throw new Error("Database not ready");

    const images = await db?.getAlbumImages(albumId);
    if (!images || images.length === 0) {
      console.log("No images found in album");
      return;
    }

    const pendingImages = images.filter(
      (img) => img.status === "pending" || img.status === "failed"
    );

    if (pendingImages.length === 0) {
      toast("No pending images to process, try later or delete album");
      return;
    }

    setBatchProgress({
      albumId,
      totalFiles: images.length,
      processedFiles: images.length - pendingImages.length,
      failedFiles: 0,
      isProcessing: true,
      startedAt: new Date(),
    });

    try {
      // Process in batches
      for (let i = 0; i < pendingImages.length; i += settings.batchSize) {
        const batch = pendingImages.slice(i, i + settings.batchSize);

        // Update progress with current file
        setBatchProgress((prev) =>
          prev
            ? {
                ...prev,
                currentFile: batch[0]?.filename,
              }
            : null
        );

        await processImageBatch(batch);

        // Update progress
        const processed = Math.min(
          i + settings.batchSize,
          pendingImages.length
        );
        setBatchProgress((prev) =>
          prev
            ? {
                ...prev,
                processedFiles:
                  images.length - pendingImages.length + processed,
              }
            : null
        );

        // Update album status
        const currentImages = await db?.getAlbumImages(albumId);
        const completedCount =
          currentImages?.filter((img) => img.status === "completed").length ||
          0;
        const failedCount =
          currentImages?.filter((img) => img.status === "failed").length || 0;
        await updateAlbumStatus(albumId, completedCount, failedCount);
      }

      // Final progress update
      setBatchProgress((prev) =>
        prev
          ? {
              ...prev,
              isProcessing: false,
              completedAt: new Date(),
              currentFile: undefined,
            }
          : null
      );
    } catch (error) {
      console.error("Batch processing failed:", error);
      setBatchProgress((prev) =>
        prev
          ? {
              ...prev,
              isProcessing: false,
              currentFile: undefined,
            }
          : null
      );
      throw error;
    }
  };

  const cancelBatchProcessing = () => {
    setBatchProgress(null);
  };

  const handleAddImageToAlbum = async (
    albumId: string,
    file: File,
    order: number
  ): Promise<string> => {
    if (!isDbReady) throw new Error("Database not ready");

    const album = await db?.getAlbum(albumId);
    if (!album) throw new Error("Album not found");

    const imageId = createAlbumImageId(albumId, Date.now());
    const now = new Date();

    const newImage: OCRAlbumImage = {
      id: imageId,
      filename: generateFilename(file.name, order),
      processedAt: now,
      status: "pending",
      order,
      fileSize: file.size,
      mimeType: file.type,
      albumId,
    };

    try {
      await db?.createImage(newImage, file);

      // Update album totals
      const updatedAlbum: OCRAlbumAlbum = {
        ...album,
        totalImages: album.totalImages + 1,
        updatedAt: now,
      };
      await db?.updateAlbum(updatedAlbum);
      await refetchAlbums();

      if (currentAlbum?.id === albumId) {
        setCurrentAlbum(updatedAlbum);
      }

      toast.success("Image added to album");
      return imageId;
    } catch (error) {
      console.error("Failed to add image:", error);
      throw error;
    }
  };

  const handleDeleteImage = async (
    imageId: string,
    albumId: string
  ): Promise<void> => {
    if (!isDbReady) throw new Error("Database not ready");

    const album = await db?.getAlbum(albumId);
    if (!album) throw new Error("Album not found");

    try {
      // await db?.updateImage({ id: imageId } as OCRAlbumImage);

      const images = await db?.getAlbumImages(albumId);
      const imageToDelete = images?.find((img) => img.id === imageId);

      if (imageToDelete) {
        const wasProcessed = imageToDelete.status === "completed";
        const wasFailed = imageToDelete.status === "failed";

        await db?.deleteImage(imageId);

        // Update album counts
        const updatedAlbum: OCRAlbumAlbum = {
          ...album,
          totalImages: album.totalImages - 1,
          processedImages: wasProcessed
            ? album.processedImages - 1
            : album.processedImages,
          failedImages: wasFailed ? album.failedImages - 1 : album.failedImages,
          updatedAt: new Date(),
        };
        await db?.updateAlbum(updatedAlbum);
        await refetchAlbums();

        if (currentAlbum?.id === albumId) {
          setCurrentAlbum(updatedAlbum);
        }
      }

      toast.success("Image deleted");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image");
      throw error;
    }
  };

  const handleReanalyzeImage = async (
    imageId: string,
    albumId: string
  ): Promise<void> => {
    if (!isDbReady) throw new Error("Database not ready");

    const images = await db?.getAlbumImages(albumId);
    const image = images?.find((img) => img.id === imageId);

    if (!image) throw new Error("Image not found");

    try {
      // Reset image status
      const resetImage: OCRAlbumImage = {
        ...image,
        status: "processing",
        error: undefined,
        processedAt: new Date(),
      };
      await db?.updateImage(resetImage);

      const dbFile = await db?.getImageFile(image.id);
      if (!dbFile) throw new Error("File not found");

      const { result: ocrResult, resizedFile } = await ocrProcess(
        dbFile,
        settings
      );

      if (!ocrResult) throw new Error("OCR result is missing");

      const completedImage: OCRAlbumImage = {
        ...resetImage,
        status: "completed",
        ocrResult,
        processedAt: new Date(),
      };
      await db?.updateImage(completedImage, resizedFile);

      // Update album status
      const album = await db?.getAlbum(albumId);
      if (album) {
        const allImages = await db?.getAlbumImages(albumId);
        const completedCount =
          allImages?.filter((img) => img.status === "completed").length || 0;
        const failedCount =
          allImages?.filter((img) => img.status === "failed").length || 0;
        await updateAlbumStatus(albumId, completedCount, failedCount);
      }

      toast.success("Image reanalyzed successfully");
    } catch (error) {
      console.error("Reanalyze failed:", error);

      const failedImage: OCRAlbumImage = {
        ...image,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        processedAt: new Date(),
      };
      await db?.updateImage(failedImage);

      toast.error("Failed to reanalyze image");
      throw error;
    }
  };

  const value: OCRAlbumContextType = {
    getImageFile,
    isDbReady,
    albums,
    currentAlbum,
    batchProgress,
    createAlbum: handleCreateAlbum,
    getAlbum,
    getAlbumImages,
    deleteAlbum: handleDeleteAlbum,
    startBatchProcessing,
    cancelBatchProcessing,
    addImageToAlbum: handleAddImageToAlbum,
    deleteImage: handleDeleteImage,
    reanalyzeImage: handleReanalyzeImage,
  };

  return (
    <OCRAlbumContext.Provider value={value}>
      {children}
    </OCRAlbumContext.Provider>
  );
};

export const useOCRAlbum = () => {
  const context = useContext(OCRAlbumContext);
  if (!context) {
    throw new Error("useOCRAlbum must be used within an OCRAlbumProvider");
  }
  return context;
};
