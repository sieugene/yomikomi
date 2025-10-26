import { ZoomIn, ZoomOut, Loader2, Sparkles } from "lucide-react";
import { FC } from "react";
import { ZOOM } from "../../lib/constants";

interface CaptureControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  hasSelection: boolean;
  isAnalyzing: boolean;
  onClear: () => void;
  onAnalyze: () => void;
}

export const CaptureControls: FC<CaptureControlsProps> = ({
  zoom,
  onZoomChange,
  hasSelection,
  isAnalyzing,
  onClear,
  onAnalyze,
}) => (
  <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-2 sm:py-3 animate-in slide-in-from-bottom duration-300">
    <div className="flex items-center justify-between gap-2 max-w-full">
      {/* Zoom controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onZoomChange(Math.max(ZOOM.MIN, zoom - ZOOM.STEP))}
          className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          disabled={zoom <= ZOOM.MIN || isAnalyzing}
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <span className="text-xs sm:text-sm text-gray-600 w-10 sm:w-16 text-center font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(ZOOM.MAX, zoom + ZOOM.STEP))}
          className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          disabled={zoom >= ZOOM.MAX || isAnalyzing}
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onClear}
          disabled={!hasSelection || isAnalyzing}
          className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-xs sm:text-sm font-medium touch-manipulation"
        >
          Clear
        </button>
        <button
          onClick={onAnalyze}
          disabled={!hasSelection || isAnalyzing}
          className="px-3 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 touch-manipulation whitespace-nowrap"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
              <span className="sm:hidden">Wait...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
