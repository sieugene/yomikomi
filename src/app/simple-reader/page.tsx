"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { DictionarySearchSettingsProvider } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";
import { OCRAlbumProvider } from "@/features/ocr-album/context/OCRAlbumContext";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { SimpleReaderPage } from "@/views/simple-reader";
import { Suspense } from "react";

export default function Page() {
  return (
    <OCRSettingsProvider>
      <OCRAlbumProvider>
        <ApplicationContext>
          <DictionarySearchSettingsProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <SimpleReaderPage />
            </Suspense>
          </DictionarySearchSettingsProvider>
        </ApplicationContext>
      </OCRAlbumProvider>
    </OCRSettingsProvider>
  );
}
