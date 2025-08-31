// src/entities/OcrViewer/ui/MobileSettingsPanel/index.tsx
import { FC, useState } from "react";
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Type, 
  Image as ImageIcon, 
  Book,
  ChevronDown,
  ChevronUp,
  Sliders
} from "lucide-react";

interface MobileSettingsPanelProps {
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

export const MobileSettingsPanel: FC<MobileSettingsPanelProps> = ({
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
              {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
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
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
                title="Toggle bounding boxes"
              >
                {showBoundingBoxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDictionary(!showDictionary);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showDictionary 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
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
                    <span className="text-sm font-medium text-gray-700">Text Scale</span>
                  </div>
                  <span className="text-sm text-gray-500">{textScale.toFixed(1)}x</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={textScale}
                    onChange={(e) => setTextScale(parseFloat(e.target.value))}
                    className="mobile-slider text-scale"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.5x</span>
                    <span>3x</span>
                  </div>
                </div>
              </div>

              {/* Font Transparency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Sliders className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Text Opacity</span>
                  </div>
                  <span className="text-sm text-gray-500">{(fontTransparency * 100).toFixed(0)}%</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={fontTransparency}
                    onChange={(e) => setFontTransparency(parseFloat(e.target.value))}
                    className="mobile-slider text-opacity"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Image Transparency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Image Opacity</span>
                  </div>
                  <span className="text-sm text-gray-500">{(imageTransparency * 100).toFixed(0)}%</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={imageTransparency}
                    onChange={(e) => setImageTransparency(parseFloat(e.target.value))}
                    className="mobile-slider image-opacity"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};