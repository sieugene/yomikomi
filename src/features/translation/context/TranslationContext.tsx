import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DEFAULT_TRANSLATION_SETTINGS } from "../lib/constants";
import { loadTranslationConfig } from "../lib/loadTranslationConfig";
import {
  PipelineTransformers,
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
  const [cdnLoading, setCdnLoaded] = useState(false);
  const [settings, setSettings] = useState<TranslationSettings>(
    DEFAULT_TRANSLATION_SETTINGS.settings,
  );
  useSWR(settings.on && `translate-lib`, async () => {
    if (!settings.on) return;
    let transformersPromise: Promise<void> | null = null;

    if (transformersPromise) return transformersPromise;
    transformersPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";

      script.textContent = `
      import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js";
      window.__transformers = { pipeline, env };
      window.dispatchEvent(new Event("transformers-ready"));
    `;

      script.onerror = reject;

      document.body.appendChild(script);
      window.addEventListener("transformers-ready", () => resolve(), {
        once: true,
      });
    });

    await transformersPromise;
    setCdnLoaded(true);
  });

  const { data: translateConfigData, isLoading } = useSWR(
    settings.on &&
      cdnLoading &&
      settings.language &&
      `translation-config-${settings.language}`,
    async () => {
      try {
        const config = await loadTranslationConfig(
          (
            window as unknown as {
              __transformers: { pipeline: PipelineTransformers };
            }
          ).__transformers.pipeline,
          settings.language,
        );
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
    <>
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
    </>
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
