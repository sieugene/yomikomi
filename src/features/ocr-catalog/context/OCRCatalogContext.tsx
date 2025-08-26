import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  OCRCatalogContextType,
  OCRCatalogAlbum,
  OCRCatalogImage,
  BatchProcessingProgress,
} from "../types";
import { OCRCatalogIndexedDB } from "../services/indexedDbService";
import { OCRApi } from "@/features/ocr/api/ocrApi";
import { useOCRSettings } from "@/features/ocr-settings/context/OCRSettingsContext";

const OCRCatalogContext = createContext<OCRCatalogContextType | undefined>(
  undefined
);

export const OCRCatalogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useOCRSettings();
  const db = useRef(new OCRCatalogIndexedDB());
  const [albums, setAlbums] = useState<OCRCatalogAlbum[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<OCRCatalogAlbum | null>(
    null
  );
  const [batchProgress, setBatchProgress] =
    useState<BatchProcessingProgress | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDb = async () => {
      try {
        await db.current.init();
        setIsDbReady(true);
        loadAlbums();
      } catch (error) {
        console.error("Failed to initialize OCR Catalog database:", error);
      }
    };

    initDb();
  }, []);

  const loadAlbums = useCallback(async () => {
    try {
      const albumList = await db.current.getAllAlbums();
      setAlbums(albumList);
    } catch (error) {
      console.error("Failed to load albums:", error);
    }
  }, [db, isDbReady]);

  const generateFilename = (originalName: string, index: number): string => {
    const timestamp = Date.now();
    const extension = originalName.split(".").pop() || "jpg";
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    return `${baseName}_${String(index + 1).padStart(
      3,
      "0"
    )}_${timestamp}.${extension}`;
  };

  const createAlbum = async (name: string, files: File[]): Promise<string> => {
    if (!isDbReady) throw new Error("Database not ready");

    const albumId = `album_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date();

    const album: OCRCatalogAlbum = {
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
    const images: OCRCatalogImage[] = sortedFiles.map((file, index) => ({
      id: `image_${albumId}_${index}`,
      filename: generateFilename(file.name, index),
      originalFile: file,
      processedAt: now,
      status: "pending",
      order: index,
      fileSize: file.size,
      mimeType: file.type,
      albumId: album.id,
    }));

    try {
      // Store album
      await db.current.createAlbum(album);

      // Store images and files
      for (const image of images) {
        await db.current.createImage(image);
        await db.current.storeFile(`file_${image.id}`, image.originalFile);
      }

      await loadAlbums();
      return albumId;
    } catch (error) {
      console.error("Failed to create album:", error);
      throw error;
    }
  };

  const getAlbum = async (albumId: string): Promise<OCRCatalogAlbum | null> => {
    if (!isDbReady) return null;
    return await db.current.getAlbum(albumId);
  };

  const getAlbumImages = async (
    albumId: string
  ): Promise<OCRCatalogImage[]> => {
    if (!isDbReady) return [];
    return await db.current.getAlbumImages(albumId);
  };

  const deleteAlbum = async (albumId: string): Promise<void> => {
    if (!isDbReady) throw new Error("Database not ready");

    await db.current.deleteAlbum(albumId);
    await loadAlbums();

    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(null);
    }
  };

  const updateAlbumStatus = async (
    albumId: string,
    processedCount: number,
    failedCount: number
  ) => {
    const album = await db.current.getAlbum(albumId);
    if (!album) return;

    const totalImages = album.totalImages;
    let status: OCRCatalogAlbum["status"];

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

    const updatedAlbum: OCRCatalogAlbum = {
      ...album,
      processedImages: processedCount,
      failedImages: failedCount,
      status,
      updatedAt: new Date(),
    };

    await db.current.updateAlbum(updatedAlbum);
    await loadAlbums();

    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(updatedAlbum);
    }
  };

  const processImageBatch = async (
    images: OCRCatalogImage[]
  ): Promise<void> => {
    const batchPromises = images.map(async (image) => {
      try {
        // Update status to processing
        const updatedImage = { ...image, status: "processing" as const };
        await db.current.updateImage(updatedImage);

        // Get the file
        const file = await db.current.getFile(`file_${image.id}`);
        if (!file) {
          throw new Error("File not found");
        }

        // Process with OCR
        const ocrResult = await OCRApi.performOCRWithPositions(
          file,
          settings.apiEndpoint
        );

        // Update with result
        const completedImage: OCRCatalogImage = {
          ...updatedImage,
          status: "completed",
          ocrResult,
          processedAt: new Date(),
        };
        await db.current.updateImage(completedImage);

        return { success: true, image: completedImage };
      } catch (error) {
        // Update with error
        const failedImage: OCRCatalogImage = {
          ...image,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          processedAt: new Date(),
        };
        await db.current.updateImage(failedImage);

        return { success: false, image: failedImage };
      }
    });

    await Promise.all(batchPromises);
  };

  const startBatchProcessing = async (albumId: string): Promise<void> => {
    if (!isDbReady) throw new Error("Database not ready");

    const images = await db.current.getAlbumImages(albumId);
    const pendingImages = images.filter(
      (img) => img.status === "pending" || img.status === "failed"
    );

    if (pendingImages.length === 0) {
      console.log("No pending images to process");
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
        const currentImages = await db.current.getAlbumImages(albumId);
        const completedCount = currentImages.filter(
          (img) => img.status === "completed"
        ).length;
        const failedCount = currentImages.filter(
          (img) => img.status === "failed"
        ).length;
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

  const value: OCRCatalogContextType = {
    albums,
    currentAlbum,
    batchProgress,
    createAlbum,
    getAlbum,
    getAlbumImages,
    deleteAlbum,
    startBatchProcessing,
    cancelBatchProcessing,
  };

  return (
    <OCRCatalogContext.Provider value={value}>
      {children}
    </OCRCatalogContext.Provider>
  );
};

export const useOCRCatalog = () => {
  const context = useContext(OCRCatalogContext);
  if (!context) {
    throw new Error("useOCRCatalog must be used within an OCRCatalogProvider");
  }
  return context;
};
