import { OCRAlbumAlbum } from "@/features/ocr-album/types";

export type ALBUM_PAGE_PARAMS = {
  albumId: OCRAlbumAlbum["id"] | null;
  page: number;
};
