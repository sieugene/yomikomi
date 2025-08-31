// src/entities/OcrViewer/ui/QuickSettingsModal/index.tsx
import { FC } from "react";
import { 
  X, 
  Eye, 
  EyeOff, 
  Book, 
  Type, 
  Image as ImageIcon, 
  Sliders,
  Volume2,
  Zap,
  RotateCcw,
  Palette
} from "lucide-react";

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onResetSettings?: () => void;
}

export const QuickSettingsModal: FC<QuickSettingsModalProps> = ({
  isOpen,
  onClose,
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
  onResetSettings,
}) => {
  if (!isOpen) return null;

  const handleResetAll = () => {
    setShowBoundingBoxes(true);
    setShowDictionary(false);
    setTextScale(1);
    setImageTransparency(1);
    setFontTransparency(1);
    onResetSettings?.();
  };

  const presets = [
    {
      name: "Default",
      icon: <Eye className="w-4 h-4" />,
      description: "Balanced view for general use",
      apply: () => {
        setShowBoundingBoxes(true);
        setTextScale(1);
        setImageTransparency(1);
        setFontTransparency(1);
      },
    },
    {
      name: "Reading Mode",
      icon: <Book className="w-4 h-4" />,
      description: "Optimized for reading text",
      apply: () => {
        setShowBoundingBoxes(false);
        setTextScale(1.2);
        setImageTransparency(0.3);
        setFontTransparency(1);
      },
    },
    {
      name: "Focus Mode",
      icon: <Zap className="w-4 h-4" />,
      description: "Highlight important elements",
      apply: () => {
        setShowBoundingBoxes(true);
        setTextScale(1.1);
        setImageTransparency(0.7);
        setFontTransparency(0.9);
      },
    },
    {
      name: "Clean View",
      icon: <EyeOff className="w-4 h-4" />,
      description: "Minimal interface",
      apply: () => {
        setShowBoundingBoxes(false);
        setTextScale(0.8);
        setImageTransparency(1);
        setFontTransparency(0.6);
      },
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sliders className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Settings</h2>
              <p className="text-sm text-gray-500">Customize your viewing experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Quick Presets */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-purple-600" />
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={preset.apply}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-blue-600">{preset.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{preset.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Display Options</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Bounding Boxes</span>
                    <p className="text-xs text-gray-500">Show text detection regions</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      showBoundingBoxes ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        showBoundingBoxes ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Book className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Dictionary Mode</span>
                    <p className="text-xs text-gray-500">Enable text translation</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showDictionary}
                    onChange={(e) => setShowDictionary(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setShowDictionary(!showDictionary)}
                    className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      showDictionary ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        showDictionary ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Slider Settings */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Appearance</h3>
            <div className="space-y-6">
              {/* Text Scale */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Text Scale</span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {textScale.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={textScale}
                  onChange={(e) => setTextScale(parseFloat(e.target.value))}
                  className="mobile-slider text-scale w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>

              {/* Text Opacity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Text Opacity</span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {(fontTransparency * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={fontTransparency}
                  onChange={(e) => setFontTransparency(parseFloat(e.target.value))}
                  className="mobile-slider text-opacity w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Hidden</span>
                  <span>Opaque</span>
                </div>
              </div>

              {/* Image Opacity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Image Opacity</span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {(imageTransparency * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={imageTransparency}
                  onChange={(e) => setImageTransparency(parseFloat(e.target.value))}
                  className="mobile-slider image-opacity w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Hidden</span>
                  <span>Opaque</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleResetAll}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};