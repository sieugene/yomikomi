import React from "react";
import { X, Clock, CheckCircle, XCircle, Pause } from "lucide-react";
import { useOCRAlbum } from "../../context/OCRAlbumContext";

export const ProgressTracker: React.FC = () => {
  const { batchProgress, cancelBatchProcessing } = useOCRAlbum();

  if (!batchProgress) return null;

  const {
    totalFiles,
    processedFiles,
    failedFiles,
    currentFile,
    isProcessing,
    startedAt,
    completedAt,
  } = batchProgress;

  const progressPercentage = Math.round((processedFiles / totalFiles) * 100);
  const remainingFiles = totalFiles - processedFiles;

  const getElapsedTime = () => {
    if (!startedAt) return "0s";
    const end = completedAt || new Date();
    const elapsed = Math.round((end.getTime() - startedAt.getTime()) / 1000);

    if (elapsed < 60) return `${elapsed}s`;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getEstimatedTimeRemaining = () => {
    if (!startedAt || processedFiles === 0 || !isProcessing) return null;

    const elapsed = (new Date().getTime() - startedAt.getTime()) / 1000;
    const avgTimePerFile = elapsed / processedFiles;
    const remainingSeconds = Math.round(avgTimePerFile * remainingFiles);

    if (remainingSeconds < 60) return `~${remainingSeconds}s`;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `~${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          ) : completedAt ? (
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          ) : (
            <Pause className="w-4 h-4 text-orange-600 mr-2" />
          )}
          <span className="font-medium text-gray-900">
            {isProcessing
              ? "Processing Images"
              : completedAt
              ? "Processing Complete"
              : "Processing Paused"}
          </span>
        </div>

        <button
          onClick={cancelBatchProcessing}
          className="p-1 hover:bg-gray-100 rounded-md"
          title="Close progress tracker"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            {processedFiles} of {totalFiles} processed
          </span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
          <span className="text-gray-600">Success:</span>
          <span className="font-medium ml-1">
            {processedFiles - failedFiles}
          </span>
        </div>

        <div className="flex items-center">
          <XCircle className="w-4 h-4 text-red-600 mr-1" />
          <span className="text-gray-600">Failed:</span>
          <span className="font-medium ml-1">{failedFiles}</span>
        </div>

        <div className="flex items-center">
          <Clock className="w-4 h-4 text-blue-600 mr-1" />
          <span className="text-gray-600">Elapsed:</span>
          <span className="font-medium ml-1">{getElapsedTime()}</span>
        </div>

        {isProcessing && getEstimatedTimeRemaining() && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium ml-1">
              {getEstimatedTimeRemaining()}
            </span>
          </div>
        )}
      </div>

      {/* Current File */}
      {currentFile && isProcessing && (
        <div className="mt-3 p-2 bg-blue-50 rounded-md">
          <div className="text-xs text-blue-600 mb-1">
            Currently processing:
          </div>
          <div className="text-sm text-blue-900 font-medium truncate">
            {currentFile}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {completedAt && !isProcessing && (
        <div className="mt-3 p-2 bg-green-50 rounded-md">
          <div className="text-sm text-green-800">
            Processing completed in {getElapsedTime()}
            {failedFiles > 0 && (
              <span className="text-orange-600 ml-2">
                ({failedFiles} files failed)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
