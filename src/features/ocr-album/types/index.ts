import { OCRResponse } from "@/features/ocr/types";

export interface OCRAlbumImage {
  id: string;
  filename: string;
  processedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  ocrResult?: OCRResponse;
  error?: string;
  order: number;
  fileSize: number;
  mimeType: string;
  albumId: string;
}

export interface OCRAlbumAlbum {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "processing" | "completed" | "partial";
}

export type Album = OCRAlbumAlbum & {
  totalImages: number;
  processedImages: number;
}

export interface BatchProcessingProgress {
  albumId: string;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  currentFile?: string;
  isProcessing: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface OCRAlbumContextType {
  getImageFile: (imageId: string) => Promise<File | null>;
  isDbReady: boolean;
  albums: Album[];
  currentAlbum: Album | null;
  batchProgress: BatchProcessingProgress | null;
  createAlbum: (name: string, files: File[]) => Promise<string>;
  getAlbum: (albumId: string) => Promise<OCRAlbumAlbum | null>;
  getAlbumImages: (albumId: string) => Promise<OCRAlbumImage[]>;
  deleteAlbum: (albumId: string) => Promise<void>;
  startBatchProcessing: (albumId: string) => Promise<void>;
  cancelBatchProcessing: () => void;
  addImageToAlbum: (
    albumId: string,
    file: File,
    order: number,
  ) => Promise<string>;
  deleteImage: (imageId: string, albumId: string) => Promise<void>;
  reanalyzeImage: (imageId: string, albumId: string) => Promise<void>;
}
