"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { OCRAlbumProvider } from "@/features/ocr-album/context/OCRAlbumContext";
import { OCRProvider } from "@/features/ocr-client/ui/OCRProvider";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { OCRPage } from "@/views/ocr";

export default function Page() {
  return (
    <OCRProvider>
      <OCRSettingsProvider>
        <OCRAlbumProvider>
          <ApplicationContext>
            <OCRPage />
          </ApplicationContext>
        </OCRAlbumProvider>
      </OCRSettingsProvider>
    </OCRProvider>
  );
}
