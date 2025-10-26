import { Loader2 } from "lucide-react";
import { FC } from "react";

export const AnalyzingOverlay: FC = () => (
  <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm rounded-lg flex items-center justify-center animate-in fade-in duration-200 p-4 z-50">
    <div className="bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl border border-blue-200">
      <div className="flex items-center gap-2 sm:gap-3">
        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin flex-shrink-0" />
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-900">
            Analyzing Text
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600">
            Extracting characters...
          </p>
        </div>
      </div>
    </div>
  </div>
);