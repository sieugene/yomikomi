"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { DictionarySearchSettingsProvider } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";
import { OCRAlbumProvider } from "@/features/ocr-album/context/OCRAlbumContext";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { AlbumPage } from "@/views/album";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams() as unknown as ALBUM_PAGE_PARAMS;

  return (
    <OCRSettingsProvider>
      <OCRAlbumProvider>
        <ApplicationContext>
          <DictionarySearchSettingsProvider>
            <AlbumPage albumId={params.albumId} page={params.page} />
          </DictionarySearchSettingsProvider>
        </ApplicationContext>
      </OCRAlbumProvider>
    </OCRSettingsProvider>
  );
}
