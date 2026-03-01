import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROXY_SETTINGS } from './shared/proxy';

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  res.headers.set(PROXY_SETTINGS.headers.pathname, req.nextUrl.pathname);

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
