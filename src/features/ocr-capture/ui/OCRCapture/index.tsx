import { useAppSettings } from "@/application/client/settings/providers/ApplicationSettingsContext";
import { FC, useRef, useState } from "react";
import { useImageLoader } from "../../hooks/useImageLoader";
import { useImageSelection } from "../../hooks/useImageSelection";
import { useOCRAnalyzer } from "../../hooks/useOCRAnalyzer";
import { ZOOM } from "../../lib/constants";
import { AnalyzingOverlay } from "../AnalyzingOverlay";
import { CaptureControls } from "../CaptureControls";
import { CaptureHeader } from "../CaptureHeader";
import { CaptureInstructions } from "../CaptureInstructions";
import { LoadingScreen } from "../LoadingScreen";
import { SelectionOverlay } from "../SelectionOverlay";

interface OCRCaptureProps {
  imageFile: File;
  onClose: () => void;
}

export const OCRCapture: FC<OCRCaptureProps> = ({ imageFile, onClose }) => {
  const { compactDictionary: dictionary } = useAppSettings();
  const [zoom, setZoom] = useState(1);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { image, isLoading, progress } = useImageLoader(imageFile);
  const { analyze, isAnalyzing } = useOCRAnalyzer();
  const { selection, handlers, clearSelection } = useImageSelection({
    imageRef,
    containerRef,
    overlayRef,
    isDisabled: isAnalyzing,
  });

  // Handlers
  const handleAnalyze = async () => {
    const text = await analyze(
      selection,
      imageRef.current,
      imageFile.name,
      imageFile.type
    );

    if (text) {
      dictionary.handleOpen(text);
    }
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(ZOOM.MIN, Math.min(ZOOM.MAX, newZoom)));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <CaptureHeader onClose={onClose} isDisabled={isAnalyzing} />

        {/* Instructions */}
        {!isLoading && (
          <CaptureInstructions
            hasSelection={!!selection}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* Loading State */}
        {isLoading && <LoadingScreen progress={progress} />}

        {/* Image Container */}
        {!isLoading && image && (
          <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                ref={imageRef}
                src={image}
                alt="OCR Source"
                className={`max-w-full max-h-full object-contain touch-none select-none rounded-lg shadow-2xl transition-opacity duration-300 ${
                  isAnalyzing
                    ? "cursor-wait opacity-70"
                    : "cursor-crosshair opacity-100"
                }`}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center",
                }}
                {...handlers}
                draggable={false}
              />

              {/* Analyzing Overlay */}
              {isAnalyzing && <AnalyzingOverlay />}

              {/* Selection Overlay */}
              {selection && <SelectionOverlay overlayRef={overlayRef} />}
            </div>
          </div>
        )}

        {/* Controls */}
        {!isLoading && (
          <CaptureControls
            zoom={zoom}
            onZoomChange={handleZoomChange}
            hasSelection={!!selection}
            isAnalyzing={isAnalyzing}
            onClear={clearSelection}
            onAnalyze={handleAnalyze}
          />
        )}
      </div>
    </>
  );
};
