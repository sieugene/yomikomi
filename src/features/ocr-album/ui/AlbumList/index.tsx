import React from "react";
import {
  Play,
  Trash2,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Image,
} from "lucide-react";
import { useOCRAlbum } from "../../context/OCRAlbumContext";
import { OCRAlbumAlbum } from "../../types";

interface AlbumListProps {
  onAlbumSelect: (album: OCRAlbumAlbum) => void;
}

export const AlbumList: React.FC<AlbumListProps> = ({ onAlbumSelect }) => {
  const { albums, deleteAlbum, startBatchProcessing, batchProgress } =
    useOCRAlbum();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusIcon = (status: OCRAlbumAlbum["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "processing":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        );
      case "partial":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "pending":
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (album: OCRAlbumAlbum) => {
    switch (album.status) {
      case "completed":
        return `Completed (${album.processedImages}/${album.totalImages})`;
      case "processing":
        return `Processing (${album.processedImages}/${album.totalImages})`;
      case "partial":
        return `Partial (${album.processedImages}/${album.totalImages}, ${album.failedImages} failed)`;
      case "pending":
      default:
        return `Pending (${album.totalImages} images)`;
    }
  };

  const canStartProcessing = (album: OCRAlbumAlbum) => {
    return (
      album.status !== "processing" &&
      album.processedImages < album.totalImages &&
      (!batchProgress || !batchProgress.isProcessing)
    );
  };

  const handleStartProcessing = async (album: OCRAlbumAlbum) => {
    try {
      await startBatchProcessing(album.id);
    } catch (error) {
      console.error("Failed to start batch processing:", error);
    }
  };

  const handleDelete = async (album: OCRAlbumAlbum) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${album.name}" and all its images?`
      )
    ) {
      return;
    }

    try {
      await deleteAlbum(album.id);
    } catch (error) {
      console.error("Failed to delete album:", error);
    }
  };

  if (albums.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Albums Yet
        </h3>
        <p className="text-gray-600">
          Create your first album to start batch OCR processing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {albums.map((album) => (
        <div
          key={album.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FolderOpen className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {album.name}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {canStartProcessing(album) && (
                  <button
                    onClick={() => handleStartProcessing(album)}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    title="Start OCR processing"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Process
                  </button>
                )}

                <button
                  onClick={() => onAlbumSelect?.(album)}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  title="View album details"
                >
                  <Image className="w-3 h-3 mr-1" />
                  View
                </button>

                <button
                  onClick={() => handleDelete(album)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                {getStatusIcon(album.status)}
                <span className="ml-2">{getStatusText(album)}</span>
              </div>

              <div className="text-right">
                <div>Created: {formatDate(album.createdAt)}</div>
                {album.updatedAt.getTime() !== album.createdAt.getTime() && (
                  <div>Updated: {formatDate(album.updatedAt)}</div>
                )}
              </div>
            </div>

            {/* Progress Bar for non-completed albums */}
            {album.status !== "pending" && album.totalImages > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (album.processedImages / album.totalImages) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      album.status === "completed"
                        ? "bg-green-600"
                        : album.status === "partial"
                        ? "bg-orange-600"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.max(
                        (album.processedImages / album.totalImages) * 100,
                        2
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Current processing indicator */}
            {batchProgress?.isProcessing &&
              batchProgress.albumId === album.id && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center text-sm text-blue-700">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                    Currently processing this album...
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};
