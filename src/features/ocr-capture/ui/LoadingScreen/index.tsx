// src/features/ocr-capture/ui/LoadingScreen.tsx
import { Sparkles } from "lucide-react";
import { FC } from "react";

interface LoadingScreenProps {
  progress: number;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ progress }) => (
  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
    <div className="text-center max-w-xs sm:max-w-sm">
      <div className="relative mb-4 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-xl">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        Loading Image
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
        Preparing for text selection...
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-2">{progress}%</p>
    </div>
  </div>
);
