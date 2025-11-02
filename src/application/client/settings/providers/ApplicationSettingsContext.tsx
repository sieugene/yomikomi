import { OCRSettingsPanel } from "@/features/ocr-settings/ui";
import { createContext, useContext, useState } from "react";

type ApplicationSettingsContextType = {
  ocrSettingsIsOpen: boolean;
  setOcrSettingsIsOpen: (isOpen: boolean) => void;
};

const ApplicationSettingsContext = createContext<
  ApplicationSettingsContextType | undefined
>(undefined);

export const ApplicationSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [ocrSettingsIsOpen, setOcrSettingsIsOpen] = useState(false);
  const contextValue: ApplicationSettingsContextType = {
    ocrSettingsIsOpen,
    setOcrSettingsIsOpen,
  };

  return (
    <ApplicationSettingsContext.Provider value={contextValue}>
      <OCRSettingsPanel
        isOpen={ocrSettingsIsOpen}
        onClose={() => setOcrSettingsIsOpen(false)}
      />
      {children}
    </ApplicationSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(ApplicationSettingsContext);
  if (!context) {
    throw new Error(
      "useAppSettings must be used within an ApplicationSettingsProvider"
    );
  }
  return context;
};
