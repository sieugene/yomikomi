import { MODALS_LAYERS } from "@/shared/modals";
import { Modal } from "@/shared/ui/Modal";
import { RotateCcw, Save } from "lucide-react";
import React, { useState } from "react";
import { useTranslationSettings } from "../../context/TranslationContext";
import { SUPPORTED_TRANSLATIONS } from "../../lib/constants";
import { TranslateSupportedLang, TranslationSettings } from "../../types";

interface TranslationSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TranslationSettingsPanel: React.FC<
  TranslationSettingsPanelProps
> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaults, loading } =
    useTranslationSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings, isOpen]);

  const handleChange = (
    field: keyof typeof settings,
    value: string | boolean | TranslateSupportedLang,
  ) => {
    const newSettings = {
      ...localSettings,
      [field]: value,
    } as unknown as TranslationSettings;
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

  const supportedLanguages = Object.keys(
    SUPPORTED_TRANSLATIONS,
  ) as TranslateSupportedLang[];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Translation Settings"
      style={{ zIndex: MODALS_LAYERS.top }}
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Language
          </label>
          <select
            disabled={loading}
            value={localSettings.language}
            onChange={(e) =>
              handleChange(
                "language",
                e.target.value as unknown as TranslateSupportedLang,
              )
            }
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the language to translate Japanese text into
          </p>
        </div>

        {loading ? <Loading /> : <Note />}
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
            disabled={!hasChanges || loading}
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

const Loading = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="text-xs text-black-800">
        Translation models are loading...
      </p>
    </div>
  );
};

const Note = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="text-xs text-blue-800">
        <strong>Note:</strong> Translation models will be downloaded on first
        use. This may take some time depending on your connection speed.
      </p>
    </div>
  );
};
