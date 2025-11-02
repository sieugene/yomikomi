import { OcrSettingsButton } from "@/features/ocr-settings/ui/OcrSettingsButton";
import { Crop, X } from "lucide-react";
import { FC } from "react";

interface CaptureHeaderProps {
  onClose: () => void;
  isDisabled?: boolean;
}

export const CaptureHeader: FC<CaptureHeaderProps> = ({
  onClose,
  isDisabled,
}) => (
  <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <Crop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
      </div>
      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
        Select Text
      </h2>
    </div>
    <div className="flex items-center gap-5">
      <OcrSettingsButton type="icon" />
      <button
        onClick={onClose}
        disabled={isDisabled}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
);
