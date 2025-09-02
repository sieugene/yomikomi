// src/entities/OcrViewer/ui/GestureHints/index.tsx
import { ArrowUp, Hand, X, Zap } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface GestureHintsProps {
  isFirstVisit?: boolean;
  onClose?: () => void;
}

export const GestureHints: FC<GestureHintsProps> = ({
  isFirstVisit = false,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  const hints = [
    {
      icon: <Hand className="w-6 h-6 text-blue-600" />,
      title: "Tap to Select",
      description: "Tap any text block to select it",
      gesture: "👆 Tap",
    },
    {
      icon: <Hand className="w-6 h-6 text-purple-600" />,
      title: "Long Press for Menu",
      description: "Hold down to open context menu with more options",
      gesture: "👆 Hold",
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      title: "Double Tap for Dictionary",
      description: "Quickly tap twice to open translation",
      gesture: "👆👆 Double tap",
    },
    {
      icon: <ArrowUp className="w-6 h-6 text-green-600" />,
      title: "Swipe Up for Dictionary",
      description: "Swipe up on selected text to translate",
      gesture: "👆⬆️ Swipe up",
    },
  ];

  useEffect(() => {
    if (isFirstVisit) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const nextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1);
    } else {
      handleClose();
    }
  };

  const prevHint = () => {
    if (currentHint > 0) {
      setCurrentHint(currentHint - 1);
    }
  };

  if (!isVisible && !isFirstVisit) return null;

  return (
    <div className="sm:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Hint Card */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {hints[currentHint].icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Touch Gestures
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentHint + 1} of {hints.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/60 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{hints[currentHint].gesture}</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {hints[currentHint].title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {hints[currentHint].description}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center space-x-2 mb-6">
              {hints.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentHint
                      ? "bg-blue-600"
                      : index < currentHint
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevHint}
                disabled={currentHint === 0}
                className="px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="text-sm text-gray-500">
                {currentHint + 1} / {hints.length}
              </div>

              <button
                onClick={nextHint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {currentHint === hints.length - 1 ? "Got it!" : "Next"}
              </button>
            </div>
          </div>

          {/* Skip option */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
