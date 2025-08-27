import { ALBUM_PAGE_PARAMS } from "@/views/album/types";

export const ROUTES = {
  collection: (collectionId: string) => `/collection/${collectionId}`,
  ocr: "/ocr",
  album: ({ albumId, page }: ALBUM_PAGE_PARAMS) => `/album/${albumId}/${page}`,
};
