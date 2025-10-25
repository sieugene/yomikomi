import { X, Crop, ZoomIn, ZoomOut } from "lucide-react";
import { FC, useState, useRef, useCallback, useEffect } from "react";
import { SelectionArea } from "@/features/ocr-capture/types";

interface OCRCaptureModalProps {
  imageFile: File;
  onClose: () => void;
  onAnalyze: (croppedFile: File) => void;
}

export const OCRCaptureModal: FC<OCRCaptureModalProps> = ({
  imageFile,
  onClose,
  onAnalyze,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Get relative coordinates
  const getRelativeCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 };
    const imgRect = imageRef.current.getBoundingClientRect();
    const x = ((clientX - imgRect.left) / imgRect.width) * imageRef.current.naturalWidth;
    const y = ((clientY - imgRect.top) / imgRect.height) * imageRef.current.naturalHeight;
    return { x, y };
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    setSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selection) return;
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    setSelection({ ...selection, endX: x, endY: y });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
    setSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsSelecting(true);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !selection) return;
    const touch = e.touches[0];
    const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
    setSelection({ ...selection, endX: x, endY: y });
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsSelecting(false);
  };

  // Crop and analyze
  const handleAnalyze = async () => {
    if (!selection || !imageRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const minX = Math.min(selection.startX, selection.endX);
    const maxX = Math.max(selection.startX, selection.endX);
    const minY = Math.min(selection.startY, selection.endY);
    const maxY = Math.max(selection.startY, selection.endY);

    const width = maxX - minX;
    const height = maxY - minY;

    if (width < 10 || height < 10) return;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageRef.current, minX, minY, width, height, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], `cropped_${imageFile.name}`, {
        type: imageFile.type,
      });
      onAnalyze(croppedFile);
    }, imageFile.type);
  };

  // Render selection overlay
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
    const width = Math.abs((selection.endX - selection.startX) * scaleX);
    const height = Math.abs((selection.endY - selection.startY) * scaleY);

    const left = minX + (imageRect.left - containerRect.left);
    const top = minY + (imageRect.top - containerRect.top);

    return (
      <div
        className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none backdrop-blur-[1px]"
        style={{ left, top, width, height }}
      >
        <div className="absolute -top-8 left-0 text-xs bg-blue-600 text-white px-2 py-1 rounded shadow-lg font-medium">
          {Math.round(width / scaleX)}×{Math.round(height / scaleY)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Crop className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Select Text Area</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-800 text-center">
          {!selection 
            ? "Click and drag to select the text area you want to look up in the dictionary"
            : "Selected area ready. Click 'Analyze' to look up words in this area"}
        </p>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div
          ref={containerRef}
          className="relative max-w-full max-h-full"
          style={{ minHeight: "300px" }}
        >
          {image && (
            <img
              ref={imageRef}
              src={image}
              alt="OCR Source"
              className="max-w-full max-h-[calc(100vh-200px)] object-contain cursor-crosshair touch-none select-none"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              draggable={false}
            />
          )}
          {renderSelectionOverlay()}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg">
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelection(null)}
            disabled={!selection}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Clear
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!selection}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            Analyze Selection
          </button>
        </div>
      </div>
    </div>
  );
};