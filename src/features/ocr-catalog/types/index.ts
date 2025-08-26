import { OCRResponse } from "@/features/ocr/types";

export interface OCRCatalogImage {
  id: string;
  filename: string;
  originalFile: File;
  processedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  ocrResult?: OCRResponse;
  error?: string;
  order: number;
  fileSize: number;
  mimeType: string;
  albumId: string;
}

export interface OCRCatalogAlbum {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  totalImages: number;
  processedImages: number;
  failedImages: number;
  status: "pending" | "processing" | "completed" | "partial";
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

export interface OCRCatalogContextType {
  albums: OCRCatalogAlbum[];
  currentAlbum: OCRCatalogAlbum | null;
  batchProgress: BatchProcessingProgress | null;
  createAlbum: (name: string, files: File[]) => Promise<string>;
  getAlbum: (albumId: string) => Promise<OCRCatalogAlbum | null>;
  getAlbumImages: (albumId: string) => Promise<OCRCatalogImage[]>;
  deleteAlbum: (albumId: string) => Promise<void>;
  startBatchProcessing: (albumId: string) => Promise<void>;
  cancelBatchProcessing: () => void;
}
