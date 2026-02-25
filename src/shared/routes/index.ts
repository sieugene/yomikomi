import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { BindLang, RouteValue } from "./types";
import { bindLang } from "./bindLang";
import { APP_LANG } from '../types';

const ROUTES = {
  home: "",
  app: "/app",
  albums: "/app/albums",
  album: ({ albumId, page }: ALBUM_PAGE_PARAMS) =>
    `/app/album/${albumId}/${page}`,
  simpleReader: (sentence: string) =>
    "/app/simple-reader?sentence=" + encodeURIComponent(sentence),
  simpleReaderRoot: "/app/simple-reader",
  dict: "/app/dict",
  ocrCapture: "/app/ocr-capture",
  settings: "/app/settings",
  ankiImport: "/app/anki-import",
  favorites: "/app/favorites",
  translator: "/app/translator",
} as const;

export class Routes {
  readonly routes: BindLang<typeof ROUTES>;

  constructor(lang: APP_LANG) {
    this.routes = bindLang(
      ROUTES as Record<string, RouteValue>,
      lang,
    ) as BindLang<typeof ROUTES>;
  }
}
