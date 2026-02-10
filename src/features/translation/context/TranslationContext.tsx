import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_TRANSLATION_SETTINGS } from "../lib/constants";
import {
  TranslationSettings,
  TranslationSettingsContextType,
} from "../types/index";

const TRANSLATION_SETTINGS_STORAGE_KEY = "translation-settings";

const TranslationSettingsContext = createContext<
  TranslationSettingsContextType | undefined
>(undefined);

export const TranslationSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [settings, setSettings] = useState<TranslationSettings>(
    DEFAULT_TRANSLATION_SETTINGS.settings,
  );

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TRANSLATION_SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings({
          ...DEFAULT_TRANSLATION_SETTINGS.settings,
          ...parsedSettings,
        });
      }
    } catch (error) {
      console.warn("Failed to load translation settings:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: Partial<TranslationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      localStorage.setItem(
        TRANSLATION_SETTINGS_STORAGE_KEY,
        JSON.stringify(updatedSettings),
      );
    } catch (error) {
      console.warn("Failed to save translation settings:", error);
    }
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_TRANSLATION_SETTINGS.settings);
    try {
      localStorage.removeItem(TRANSLATION_SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to reset translation settings:", error);
    }
  };

  return (
    <TranslationSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetToDefaults,
      }}
    >
      {children}
    </TranslationSettingsContext.Provider>
  );
};

export const useTranslationSettings = () => {
  const context = useContext(TranslationSettingsContext);
  if (!context) {
    throw new Error(
      "useTranslationSettings must be used within an TranslationSettingsProvider",
    );
  }
  return context;
};
