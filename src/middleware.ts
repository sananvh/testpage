import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    const headers = new Headers(request.headers);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  }

  const preferred = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const match = locales.find((l) => preferred.startsWith(l)) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${match}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, admin, uploads and files with an extension.
  matcher: ["/((?!_next|api|admin|uploads|brand/|md/|\\.well-known|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)"],
};
