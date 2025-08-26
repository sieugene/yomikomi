"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { OCRCatalogProvider } from "@/features/ocr-catalog/context/OCRCatalogContext";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { OCRPage } from "@/views/ocr";

export default function Page() {
  return (
    <OCRSettingsProvider>
      <OCRCatalogProvider>
        <ApplicationContext>
          <OCRPage />
        </ApplicationContext>
      </OCRCatalogProvider>
    </OCRSettingsProvider>
  );
}
