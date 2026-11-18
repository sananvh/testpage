import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Content-Security-Policy with a fresh nonce per page: only scripts carrying the nonce (Next.js
 * adds it to its own scripts automatically; the theme script reads it from x-nonce) and scripts
 * they load may run, so an injected <script> or inline handler is blocked by the browser.
 */
function csp(nonce: string) {
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function withCsp(request: NextRequest, extra?: (h: Headers) => void) {
  const nonce = btoa(crypto.randomUUID());
  const policy = csp(nonce);
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("content-security-policy", policy);
  extra?.(headers);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", policy);
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return withCsp(request);

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return withCsp(request, (h) => h.set("x-pathname", pathname));

  const preferred = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const match = locales.find((l) => preferred.startsWith(l)) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${match}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Pages only (admin included): skip Next internals, API routes, uploads, brand assets and files with an extension.
  matcher: ["/((?!_next|api|uploads|brand/|md/|\\.well-known|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)"],
};
