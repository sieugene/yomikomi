"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { DictionarySearchSettingsProvider } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";
import { OCRAlbumProvider } from "@/features/ocr-album/context/OCRAlbumContext";
import JapaneseOCR from "@/features/ocr-client/ui";
import { OCRProvider } from "@/features/ocr-client/ui/OCRProvider";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { Suspense } from "react";

export default function Page() {
  return (
    <OCRSettingsProvider>
      <OCRAlbumProvider>
        <ApplicationContext>
          <DictionarySearchSettingsProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <OCRProvider>
                <JapaneseOCR />
              </OCRProvider>
            </Suspense>
          </DictionarySearchSettingsProvider>
        </ApplicationContext>
      </OCRAlbumProvider>
    </OCRSettingsProvider>
  );
}
