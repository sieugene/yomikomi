import { ALBUM_PAGE_PARAMS } from "@/views/album/types";

export const ROUTES = {
  home: "/",
  collection: (collectionId: string) => `/collection/${collectionId}`,
  ocr: "/ocr",
  album: ({ albumId, page }: ALBUM_PAGE_PARAMS) => `/album/${albumId}/${page}`,
  simpleReader: (sentence: string) =>
    "/simple-reader?sentence=" + encodeURIComponent(sentence),
  dict: "/dict",
};
