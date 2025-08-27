import { FC } from "react";
import { ALBUM_PAGE_PARAMS } from "./types";
import { AlbumViewer } from "@/features/ocr-album/ui/AlbumViewer";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

type Props = ALBUM_PAGE_PARAMS;
export const AlbumPage: FC<Props> = ({ albumId, page }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href={ROUTES.ocr} className="text-blue-600 hover:underline">
          Back to Ocr
        </Link>
      </div>
      <AlbumViewer albumId={albumId} page={Number(page)} />
    </div>
  );
};
