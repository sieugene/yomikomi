import { Routes } from "@/shared/routes";
import { LangParams } from "@/shared/types";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<LangParams & Omit<ALBUM_PAGE_PARAMS, "page">>;
};

export default async function PageRedirect({ params }: Props) {
  const { albumId, lang } = await params;
  const { routes: ROUTES } = new Routes(lang);
  redirect(
    ROUTES.album({
      albumId,
      page: 1,
    }),
  );
}
