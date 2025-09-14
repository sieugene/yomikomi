import { Camera, Upload, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { ImageEditor } from "../ImageEditor";
import { OCRResponse } from "@/features/ocr/types";
import { SelectionArea } from "../../types";

interface OCRCaptureProps {
  onOCRResult?: (result: OCRResponse) => void;
  performOCR?: (file: File) => Promise<OCRResponse>;
}



export const OCRCapture: React.FC<OCRCaptureProps> = ({
  onOCRResult,
  performOCR,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // -----------------------------
  // File Upload
  // -----------------------------
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setOriginalFile(file);
    setImage(null);
    setSelection(null);
    setOcrResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // -----------------------------
  // Coordinates & Selection
  // -----------------------------
  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 };
    const imgRect = imageRef.current.getBoundingClientRect();
    const x =
      ((clientX - imgRect.left) / imgRect.width) *
      imageRef.current.naturalWidth;
    const y =
      ((clientY - imgRect.top) / imgRect.height) *
      imageRef.current.naturalHeight;
    return { x, y };
  };

  const startSelection = (x: number, y: number) => {
    setSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsSelecting(true);
    setOcrResult(null);
    setError(null);
  };

  const updateSelection = (x: number, y: number) => {
    if (!selection) return;
    setSelection({ ...selection, endX: x, endY: y });
  };

  const endSelection = () => setIsSelecting(false);

  // -----------------------------
  // Mouse & Touch Handlers
  // -----------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    startSelection(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    updateSelection(x, y);
  };

  const handleMouseUp = () => endSelection();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!image) return;
    const touch = e.touches[0];
    const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
    startSelection(x, y);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting) return;
    const touch = e.touches[0];
    const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
    updateSelection(x, y);
    e.preventDefault();
  };

  const handleTouchEnd = () => endSelection();

  // -----------------------------
  // Crop & OCR
  // -----------------------------
  const cropSelectedArea = useCallback(async (): Promise<File | null> => {
    if (!selection || !originalFile || !imageRef.current) return null;

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const minX = Math.min(selection.startX, selection.endX);
    const maxX = Math.max(selection.startX, selection.endX);
    const minY = Math.min(selection.startY, selection.endY);
    const maxY = Math.max(selection.startY, selection.endY);

    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 10 || height < 10) {
      setError("Selection area is too small");
      return null;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, minX, minY, width, height, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        resolve(
          new File([blob], `cropped_${originalFile.name}`, {
            type: originalFile.type,
          })
        );
      }, originalFile.type);
    });
  }, [selection, originalFile]);

  const handleAnalyze = async () => {
    if (!selection || !performOCR)
      return setError("No selection or OCR function available");

    setIsProcessing(true);
    setError(null);
    try {
      const croppedFile = await cropSelectedArea();
      if (!croppedFile) return setError("Failed to crop selected area");

      const result = await performOCR(croppedFile);
      setOcrResult(result);
      onOCRResult?.(result);
    } catch (err) {
      setError(
        (err as { message: string })?.message || "OCR processing failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!ocrResult?.full_text) return;
    try {
      await navigator.clipboard.writeText(ocrResult.full_text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // -----------------------------
  // Selection Overlay
  // -----------------------------
  const renderSelectionOverlay = () => {
    if (!selection || !imageRef.current || !containerRef.current) return null;

    const img = imageRef.current;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const imageRect = img.getBoundingClientRect();

    const scaleX = imageRect.width / img.naturalWidth;
    const scaleY = imageRect.height / img.naturalHeight;

    const minX = Math.min(selection.startX, selection.endX) * scaleX;
    const minY = Math.min(selection.startY, selection.endY) * scaleY;
    const width =
      (Math.max(selection.startX, selection.endX) -
        Math.min(selection.startX, selection.endX)) *
      scaleX;
    const height =
      (Math.max(selection.startY, selection.endY) -
        Math.min(selection.startY, selection.endY)) *
      scaleY;

    const left = minX + (imageRect.left - containerRect.left);
    const top = minY + (imageRect.top - containerRect.top);

    return (
      <div
        className="absolute border-2 border-blue-500 bg-blue-500 opacity-70 pointer-events-none"
        style={{ left, top, width, height }}
      >
        <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
          {Math.round(width)}×{Math.round(height)}
        </div>
      </div>
    );
  };

  // -----------------------------
  // Reset
  // -----------------------------
  const reset = () => {
    setImage(null);
    setOriginalFile(null);
    setSelection(null);
    setOcrResult(null);
    setError(null);
    setIsProcessing(false);
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="OCR Capture"
      >
        <Camera className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <Header
          onClose={() => {
            setIsOpen(false);
            reset();
          }}
        />

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {!image ? (
            <UploadArea onUpload={handleFileUpload} />
          ) : (
            <ImageEditor
              image={image}
              imageRef={imageRef}
              containerRef={containerRef}
              selection={selection}
              renderSelectionOverlay={renderSelectionOverlay}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              handleTouchStart={handleTouchStart}
              handleTouchMove={handleTouchMove}
              handleTouchEnd={handleTouchEnd}
              handleAnalyze={handleAnalyze}
              reset={reset}
              copyToClipboard={copyToClipboard}
              isProcessing={isProcessing}
              ocrResult={ocrResult}
              selectionExists={!!selection}
              error={error}
              clearSelection={() => setSelection(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="flex items-center justify-between p-4 border-b">
    <h2 className="text-xl font-semibold flex items-center">
      <Camera className="w-5 h-5 mr-2" />
      OCR Capture
    </h2>
    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
      <X className="w-5 h-5" />
    </button>
  </div>
);

const UploadArea: React.FC<{
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ onUpload }) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Upload Image for OCR
    </h3>
    <p className="text-gray-600 mb-4">
      Select an image, then draw a rectangle to analyze text in that area
    </p>
    <input
      type="file"
      accept="image/*"
      onChange={onUpload}
      className="hidden"
      id="ocr-file-input"
    />
    <label
      htmlFor="ocr-file-input"
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
    >
      <Upload className="w-4 h-4 mr-2" />
      Choose Image
    </label>
  </div>
);
