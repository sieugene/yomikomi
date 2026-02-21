import { ALBUM_PAGE_PARAMS } from "@/views/album/types";

export const ROUTES = {
  home: "/",
  app: "/app",
  albums: "/app/albums",
  album: ({ albumId, page }: ALBUM_PAGE_PARAMS) =>
    `/app/album/${albumId}/${page}`,
  simpleReader: (sentence: string) =>
    "/app/simple-reader?sentence=" + encodeURIComponent(sentence),
  simpleReaderRoot: "/app/simple-reader",
  dict: "/app/dict",
  ocrCapture: "/app/ocr-capture",
  settings: "/app/settings",
  ankiImport: "/app/anki-import",
  favorites: "/app/favorites",
  translator: "/app/translator",
};
