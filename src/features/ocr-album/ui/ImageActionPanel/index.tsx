import { OcrSettingsButton } from "@/features/ocr-settings/ui/OcrSettingsButton";
import { Camera, Plus, RefreshCw, Trash2 } from "lucide-react";
import React, { FC, useState } from "react";
import { MobileActionButton } from "../MobileActionButton";

interface ImageActionPanelProps {
  imageId: string;
  imageFile: File | null;
  onReanalyze: () => void;
  onDelete: () => void;
  onAddImage: (file: File) => void;
  onSelectArea: () => void;
  isProcessing?: boolean;
}

export const ImageActionPanel: FC<ImageActionPanelProps> = ({
  imageId,
  imageFile,
  onReanalyze,
  onDelete,
  onAddImage,
  onSelectArea,
  isProcessing = false,
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onAddImage(file);
      e.target.value = ""; // Reset input
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm("Delete this image? This cannot be undone.")) {
      onDelete();
    }
  };

  return (
    <>
      {/* Mobile: Floating Action Button */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowActions(!showActions)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
          aria-label="Toggle actions"
        >
          <Plus
            className={`w-6 h-6 transition-transform duration-200 ${
              showActions ? "rotate-45" : "rotate-0"
            }`}
          />
        </button>

        {showActions && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setShowActions(false)}
            />

            {/* Actions Menu */}
            <div className="absolute bottom-16 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-56 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-2 space-y-1">
                <MobileActionButton
                  icon={<Camera className="w-5 h-5" />}
                  label="Select Area"
                  onClick={() => {
                    onSelectArea();
                    setShowActions(false);
                  }}
                  disabled={!imageFile}
                />
                <MobileActionButton
                  icon={
                    isProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )
                  }
                  label="Reanalyze"
                  onClick={() => {
                    onReanalyze();
                    setShowActions(false);
                  }}
                  disabled={isProcessing}
                />
                <MobileActionButton
                  onClick={() => {
                    const icon = document.querySelector<HTMLElement>(
                      ".mobile-action-ocr-settings-button"
                    );
                    if (icon) {
                      icon.click();
                    }
                  }}
                  icon={
                    <OcrSettingsButton
                      type="icon"
                      className="w-5 h-5 text-gray-700"
                      rootClassName="mobile-action-ocr-settings-button"
                    />
                  }
                  label="OCR Settings"
                  disabled={isProcessing}
                />
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileAdd}
                    className="hidden"
                    id={`mobile-add-image-${imageId}`}
                  />
                  <MobileActionButton
                    icon={<Plus className="w-5 h-5" />}
                    label="Add Image"
                    as="div"
                  />
                </label>
                <div className="border-t border-gray-100 my-1" />
                <MobileActionButton
                  icon={<Trash2 className="w-5 h-5" />}
                  label="Delete Image"
                  onClick={() => {
                    handleDeleteClick();
                    setShowActions(false);
                  }}
                  variant="danger"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Compact Action Bar */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={onSelectArea}
          disabled={!imageFile}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden md:inline">Select Area</span>
        </button>

        <button
          onClick={onReanalyze}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {isProcessing ? "Processing..." : "Reanalyze"}
          </span>
        </button>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileAdd}
            className="hidden"
            id={`desktop-add-image-${imageId}`}
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:scale-95 transition-all text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Image</span>
          </div>
        </label>
        <OcrSettingsButton type="button" text="Open ocr settings" />

        <div className="flex-1" />

        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:scale-95 transition-all text-sm font-medium border border-red-200"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden md:inline">Delete</span>
        </button>
      </div>
    </>
  );
};
