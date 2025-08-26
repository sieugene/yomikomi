import React, { createContext, useContext, useState, useEffect } from "react";
import {
  OCRSettings,
  OCRSettingsContextType,
  DEFAULT_OCR_SETTINGS,
} from "../types";

const OCR_SETTINGS_STORAGE_KEY = "ocr-settings";

const OCRSettingsContext = createContext<OCRSettingsContextType | undefined>(
  undefined
);

export const OCRSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<OCRSettings>(DEFAULT_OCR_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(OCR_SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...DEFAULT_OCR_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn("Failed to load OCR settings:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: Partial<OCRSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      localStorage.setItem(
        OCR_SETTINGS_STORAGE_KEY,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.warn("Failed to save OCR settings:", error);
    }
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_OCR_SETTINGS);
    try {
      localStorage.removeItem(OCR_SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to reset OCR settings:", error);
    }
  };

  return (
    <OCRSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetToDefaults,
      }}
    >
      {children}
    </OCRSettingsContext.Provider>
  );
};

export const useOCRSettings = () => {
  const context = useContext(OCRSettingsContext);
  if (!context) {
    throw new Error(
      "useOCRSettings must be used within an OCRSettingsProvider"
    );
  }
  return context;
};
