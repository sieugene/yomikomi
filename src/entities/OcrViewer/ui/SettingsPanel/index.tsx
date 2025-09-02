import {
  Book,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Settings,
  Sliders,
  Type,
} from "lucide-react";
import { FC, useRef, useState } from "react";

interface SettingsPanelProps {
  showBoundingBoxes: boolean;
  setShowBoundingBoxes: (value: boolean) => void;
  showDictionary: boolean;
  setShowDictionary: (value: boolean) => void;
  textScale: number;
  setTextScale: (value: number) => void;
  imageTransparency: number;
  setImageTransparency: (value: number) => void;
  fontTransparency: number;
  setFontTransparency: (value: number) => void;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({
  showBoundingBoxes,
  setShowBoundingBoxes,
  showDictionary,
  setShowDictionary,
  textScale,
  setTextScale,
  imageTransparency,
  setImageTransparency,
  fontTransparency,
  setFontTransparency,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      {/* Collapsed Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer select-none"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <Settings className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">View Settings</h3>
            <p className="text-xs text-gray-500">
              {isExpanded ? "Tap to collapse" : "Tap to expand"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick toggles when collapsed */}
          {!isExpanded && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBoundingBoxes(!showBoundingBoxes);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showBoundingBoxes
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
                title="Toggle bounding boxes"
              >
                {showBoundingBoxes ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDictionary(!showDictionary);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showDictionary
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
                title="Toggle dictionary"
              >
                <Book className="w-4 h-4" />
              </button>
            </>
          )}

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-4 space-y-4">
            {/* Toggle Options */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Boxes</span>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDictionary}
                  onChange={(e) => setShowDictionary(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex items-center space-x-1">
                  <Book className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Dictionary</span>
                </div>
              </label>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {/* Text Scale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Type className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Text Scale
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {textScale.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={textScale}
                  onChange={setTextScale}
                />
              </div>

              {/* Font Transparency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Sliders className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Text Opacity
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(fontTransparency * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={fontTransparency}
                  onChange={setFontTransparency}
                />
              </div>

              {/* Image Transparency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Image Opacity
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(imageTransparency * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={imageTransparency}
                  onChange={setImageTransparency}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 0.1,
  value,
  onChange,
  className,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const newRatio = Math.min(Math.max(x / rect.width, 0), 1);
    const newValue = min + newRatio * (max - min);

    const steppedValue = Math.round(newValue / step) * step;
    onChange(steppedValue);
  };

  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className={`range-wrapper relative w-full h-8 ${className || ""}`}
      onTouchMove={handleTouchMove}
      onMouseMove={(e) => {
        if (e.buttons !== 1) return;
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newRatio = Math.min(Math.max(x / rect.width, 0), 1);
        const newValue = min + newRatio * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        onChange(steppedValue);
      }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0"
      />
      <div className="bar bg-gray-300 h-2 rounded mt-3">
        <div
          className="fill bg-blue-500 h-2 rounded"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
};
