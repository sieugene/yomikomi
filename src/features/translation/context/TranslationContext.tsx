import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DEFAULT_TRANSLATION_SETTINGS } from "../lib/constants";
import { loadTranslationConfig } from "../lib/loadTranslationConfig";
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
  const { data: translateConfigData, isLoading } = useSWR(
    settings.language && `translation-config-${settings.language}`,
    async () => {
      try {
        const config = await loadTranslationConfig(settings.language);
        toast.success("Translation models loaded");
        return config;
      } catch (error) {
        console.error("Failed to load translation models:", error);
        toast.error("Failed to load translation models");
      }
    },
  );

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
        translateConfig: translateConfigData || null,
        loading: isLoading,
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
