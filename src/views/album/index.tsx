import { AlbumViewer } from "@/features/ocr-album/ui/AlbumViewer";
import { FC } from "react";
import { ALBUM_PAGE_PARAMS } from "./types";

type Props = ALBUM_PAGE_PARAMS;
export const AlbumPage: FC<Props> = ({ albumId, page }) => {
  return (
    <div className="pb-14">
      <AlbumViewer albumId={albumId} page={Number(page)} />
    </div>
  );
};
