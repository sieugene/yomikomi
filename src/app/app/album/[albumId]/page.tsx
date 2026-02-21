import { ROUTES } from "@/shared/routes";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { redirect } from "next/navigation";

export default async function PageRedirect({
  params,
}: {
  params: Promise<Omit<ALBUM_PAGE_PARAMS, "page">>;
}) {
  const { albumId } = await params;
  redirect(
    ROUTES.album({
      albumId,
      page: 1,
    })
  );
}
