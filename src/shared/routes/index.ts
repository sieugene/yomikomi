import { ALBUM_PAGE_PARAMS } from "@/views/album/types";

export const ROUTES = {
  home: "/",
  collection: (collectionId: string) => `/collection/${collectionId}`,
  albums: "/albums",
  album: ({ albumId, page }: ALBUM_PAGE_PARAMS) => `/album/${albumId}/${page}`,
  simpleReader: (sentence: string) =>
    "/simple-reader?sentence=" + encodeURIComponent(sentence),
  simpleReaderRoot: "/simple-reader",
  dict: "/dict",
  ocrCapture: "/ocr-capture",
  settings: "/settings",
  ankiImport: "/anki-import",
  favorites: "/favorites",
};
