import { Modal } from "@/shared/ui/Modal";
import { AlertCircle, FileImage, FolderPlus, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useOCRCatalog } from "../../context/OCRCatalogContext";

interface BatchUploadProps {
  onComplete?: (albumId: string) => void;
}

export const BatchUpload: React.FC<BatchUploadProps> = ({ onComplete }) => {
  const { createAlbum } = useOCRCatalog();
  const [isOpen, setIsOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError("No valid image files selected");
      return;
    }

    if (imageFiles.length > 500) {
      setError("Too many files selected (maximum 500)");
      return;
    }

    setSelectedFiles(imageFiles);
    setError(null);
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

  const handleSubmit = async () => {
    if (!albumName.trim()) {
      setError("Album name is required");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("No files selected");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const albumId = await createAlbum(albumName.trim(), selectedFiles);

      // Reset form
      setAlbumName("");
      setSelectedFiles([]);
      setIsOpen(false);

      onComplete?.(albumId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create album");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    setIsOpen(false);
    setAlbumName("");
    setSelectedFiles([]);
    setError(null);
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <FolderPlus className="w-4 h-4 mr-2" />
        New Album
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Album">
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Album Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Album Name
            </label>
            <input
              type="text"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="Enter album name..."
              disabled={isCreating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FileImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">
                  Drop images here or click to select
                </div>
                <div className="text-xs text-gray-500">
                  Supports: JPG, PNG, GIF, WebP (Max 500 files)
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                disabled={isCreating}
                className="hidden"
                id="batch-file-input"
              />
              <label
                htmlFor="batch-file-input"
                className="inline-flex items-center px-3 py-2 mt-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-1" />
                Choose Files
              </label>
            </div>
          </div>

          {/* Selected Files Summary */}
          {selectedFiles.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedFiles.length} files selected
                </span>
                <span className="text-sm text-blue-700">
                  Total: {formatSize(totalSize)}
                </span>
              </div>

              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1 text-xs text-blue-800">
                  {selectedFiles.slice(0, 10).map((file, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate mr-2">{file.name}</span>
                      <span>{formatSize(file.size)}</span>
                    </div>
                  ))}
                  {selectedFiles.length > 10 && (
                    <div className="text-blue-600 font-medium pt-1">
                      ... and {selectedFiles.length - 10} more files
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 space-x-2">
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isCreating || !albumName.trim() || selectedFiles.length === 0
            }
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Album
              </>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};
