import { OCRAlbumImage } from "@/features/ocr-album/types";
import {
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  Loader2,
  Play,
} from "lucide-react";
import { FC } from "react";
import { useReadImageFile } from "../hooks/useReadImageFile";
import { InteractiveOcrResult } from "./InteractiveOcrResult";
import { OcrFailure } from "./OcrFailure";
import { ImageConflictState } from "./ImageConflictState";

type Props = Pick<OCRAlbumImage, "ocrResult" | "error" | "id" | "status"> & {
  getImageFile: (imageId: string) => Promise<File | null>;
  onStartProcessing?: () => void;
};

export const OcrViewer: FC<Props> = ({
  getImageFile,
  ocrResult,
  error,
  id,
  status,
  onStartProcessing,
}) => {
  const { imageUrl, isLoading } = useReadImageFile({ getImageFile, id });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <ImageIcon className="w-12 h-12 text-gray-300" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Loading image...</p>
            <p className="text-gray-400 text-sm mt-1">
              Please wait while we prepare your image
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full">
        <OcrFailure error={error} />

        {/* Show image even if OCR failed */}
        {imageUrl && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  OCR Processing Failed
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The image is displayed below, but text extraction was
                  unsuccessful. Try reanalyzing the image.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <img
                src={imageUrl}
                alt="Original image (OCR failed)"
                className="w-full h-auto max-w-full border rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show no data state
  if (!imageUrl && !ocrResult) {
    return (
      <ImageConflictState
        label=" No Image Selected"
        text="Upload an image to start OCR text extraction"
      />
    );
  }

  if (!imageUrl && !!ocrResult) {
    return (
      <ImageConflictState
        label="No Image Selected"
        text="The image cache probably expired. Please try re-uploading the image."
      />
    );
  }

  // Pending state - waiting for processing
  if (status === "pending" && imageUrl && !ocrResult) {
    return (
      <div className="w-full space-y-4">
        {/* Pending Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-amber-900 mb-1">
                Ready for OCR Processing
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                This image {`hasn't `}been processed yet. Click the button below
                to start OCR text extraction, or use the batch processing button
                to analyze all pending images at once.
              </p>
              {onStartProcessing && (
                <button
                  onClick={onStartProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-sm hover:shadow-md font-medium text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Processing Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Image Preview */}
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Image awaiting OCR processing"
            className="w-full h-auto max-w-full border-2 border-gray-200 rounded-xl shadow-sm"
          />

          {/* Overlay hint on hover (desktop only) */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Pending OCR Analysis
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (status === "processing" && imageUrl) {
    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Processing Image
              </p>
              <p className="text-sm text-blue-700">
                OCR analysis in progress...
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src={imageUrl}
            alt="Image being processed"
            className="w-full h-auto max-w-full border rounded-lg shadow-sm opacity-75"
          />
          <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Analyzing text...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show OCR results
  return (
    <div className="w-full space-y-4 relative">
      {ocrResult && imageUrl ? (
        <InteractiveOcrResult imageUrl={imageUrl} result={ocrResult} />
      ) : imageUrl ? (
        // Fallback: show image without OCR results
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Image Loaded
                </p>
                <p className="text-sm text-gray-600">
                  Waiting for OCR results...
                </p>
              </div>
            </div>
          </div>

          <img
            src={imageUrl}
            alt="Image without OCR results"
            className="w-full h-auto max-w-full border rounded-lg shadow-sm"
          />
        </div>
      ) : null}
    </div>
  );
};
