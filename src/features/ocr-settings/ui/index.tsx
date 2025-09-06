import { Modal } from "@/shared/ui/Modal";
import { RotateCcw, Save } from "lucide-react";
import React, { useState } from "react";
import { useOCRSettings } from "../context/OCRSettingsContext";

interface OCRSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OCRSettingsPanel: React.FC<OCRSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, resetToDefaults } = useOCRSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings, isOpen]);

  const handleChange = (
    field: keyof typeof settings,
    value: string | number | boolean
  ) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    resetToDefaults();
    setHasChanges(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"OCR Settings"}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client side ocr
          </label>
          <button
            type="button"
            onClick={() =>
              handleChange("isClientSide", !localSettings.isClientSide)
            }
            className={`w-14 h-8 flex items-center rounded-full p-1 duration-300 ${
              localSettings.isClientSide ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${
                localSettings.isClientSide ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {!localSettings.isClientSide && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API
              </label>
              <input
                type="url"
                value={localSettings.apiEndpoint}
                onChange={(e) => handleChange("apiEndpoint", e.target.value)}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://ocr.api"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Api token
              </label>
              <input
                type="url"
                value={localSettings.bearerToken}
                onChange={(e) => handleChange("bearerToken", e.target.value)}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="asdasdsad&sd"
              />
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={localSettings.timeout / 1000}
                onChange={(e) =>
                  handleChange("timeout", parseInt(e.target.value) * 1000)
                }
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Retry Attempts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retry Attempts
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={localSettings.retryAttempts}
                onChange={(e) =>
                  handleChange("retryAttempts", parseInt(e.target.value))
                }
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={localSettings.batchSize}
                onChange={(e) =>
                  handleChange("batchSize", parseInt(e.target.value))
                }
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of files to process simultaneously
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center p-4 border-t bg-gray-50">
        <button
          onClick={handleReset}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset to Defaults
        </button>

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
