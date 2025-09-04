import { useState, useEffect } from "react";

const STORAGE_KEY = "textBlockSettings";

type Settings = {
  showBoundingBoxes: boolean;
  textScale: number;
  imageTransparency: number;
  fontTransparency: number;
  showDictionary: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  showBoundingBoxes: true,
  textScale: 14,
  imageTransparency: 1,
  fontTransparency: 1,
  showDictionary: true,
};

export const useTextBlockSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  return {
    ...settings,
    setShowBoundingBoxes: (v: boolean) =>
      updateSettings({ showBoundingBoxes: v }),
    setTextScale: (v: number) => updateSettings({ textScale: v }),
    setImageTransparency: (v: number) =>
      updateSettings({ imageTransparency: v }),
    setFontTransparency: (v: number) => updateSettings({ fontTransparency: v }),
    setShowDictionary: (v: boolean) => updateSettings({ showDictionary: v }),
  };
};
