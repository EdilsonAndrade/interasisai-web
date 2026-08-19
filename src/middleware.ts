import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { locales, type LocaleCode } from "@/i18n/config";

const intlMiddleware = createMiddleware(routing);

const COUNTRY_TO_LOCALE: Record<string, LocaleCode> = {
  BR: "pt-BR",
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  GQ: "es",
};

function detectFromAcceptLanguage(request: NextRequest): LocaleCode | null {
  const header = request.headers.get("Accept-Language");
  if (!header) return null;

  // Parse Accept-Language: "pt-BR,pt;q=0.9,en;q=0.8" → ["pt-BR", "pt", "en"]
  const langs = header
    .split(",")
    .map((part) => part.split(";")[0]!.trim().toLowerCase());

  for (const lang of langs) {
    if (lang === "pt-br" || lang === "pt") return "pt-BR";
    if (lang === "en" || lang === "en-us" || lang === "en-gb") return "en";
    if (lang === "es" || lang === "es-es" || lang === "es-mx" || lang === "es-ar") return "es";
  }

  return null;
}

function detectFromGeoIp(request: NextRequest): LocaleCode | null {
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-geo-country");

  if (!country) return null;
  return COUNTRY_TO_LOCALE[country.toUpperCase()] ?? null;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, the embeddable widget distribution route, Next.js
  // internals, and static files — these are not localized pages and must
  // never be redirected to a locale-prefixed path (breaks the widget
  // installation snippet, see specs/016-embeddable-chat-widget).
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/widget/") ||
    pathname.startsWith("/_next/") ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next();
  }

  // Detection for first visit (no cookie yet)
  // Precedence: cookie > Accept-Language (browser) > geo-IP > en
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;

  if (!localeCookie || !(locales as readonly string[]).includes(localeCookie)) {
    const detected =
      detectFromAcceptLanguage(request) ??
      detectFromGeoIp(request) ??
      "en";

    const url = request.nextUrl.clone();
    const pathParts = pathname.split("/").filter(Boolean);
    const firstSegment = pathParts[0] ?? "";

    if (!(locales as readonly string[]).includes(firstSegment)) {
      url.pathname = `/${detected}${pathname === "/" ? "" : pathname}`;
      const response = NextResponse.redirect(url);
      response.cookies.set("NEXT_LOCALE", detected, {
        maxAge: 31536000, // 1 year
        path: "/",
        sameSite: "lax",
      });
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|widget|favicon.ico|images).*)"],
};
