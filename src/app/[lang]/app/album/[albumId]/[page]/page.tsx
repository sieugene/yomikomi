"use client";
import { AlbumPage } from "@/views/album";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams() as unknown as ALBUM_PAGE_PARAMS;

  return <AlbumPage albumId={params.albumId} page={params.page} />;
}
