import { ALBUM_PAGE_PARAMS } from "@/views/album/types";


// TODO support a locales!
export const ROUTES = {
  home: "/en",
  app: "/en/app",
  albums: "/en/app/albums",
  album: ({ albumId, page }: ALBUM_PAGE_PARAMS) =>
    `/en/app/album/${albumId}/${page}`,
  simpleReader: (sentence: string) =>
    "/en/app/simple-reader?sentence=" + encodeURIComponent(sentence),
  simpleReaderRoot: "/en/app/simple-reader",
  dict: "/en/app/dict",
  ocrCapture: "/en/app/ocr-capture",
  settings: "/en/app/settings",
  ankiImport: "/en/app/anki-import",
  favorites: "/en/app/favorites",
  translator: "/en/app/translator",
};
