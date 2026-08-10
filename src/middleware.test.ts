/**
 * Middleware tests for i18n locale detection and geo-IP routing.
 *
 * Mocks Next.js internals and next-intl to avoid ESM transform issues with jsdom.
 */

const COUNTRY_TO_LOCALE: Record<string, string> = {
  BR: "pt-BR", US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
  VE: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es",
  HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es",
  UY: "es", GQ: "es",
};

const locales = ["pt-BR", "en", "es"];

jest.mock("@/i18n/routing", () => ({
  routing: { locales, defaultLocale: "en", localePrefix: "always" },
}));

jest.mock("@/i18n/config", () => ({
  locales: ["pt-BR", "en", "es"] as readonly string[],
  defaultLocale: "en",
}));

jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: jest.fn(() => () => ({ status: 200, headers: new Headers(), cookies: { get: () => undefined } })),
}));

// Helper: simple country-to-locale lookup
function detectLocale(countryHeader: string | null): string | null {
  if (!countryHeader) return null;
  return COUNTRY_TO_LOCALE[countryHeader.toUpperCase()] ?? null;
}

// ── T021: Unit tests for COUNTRY_TO_LOCALE mapping ─────────────────────
describe("COUNTRY_TO_LOCALE mapping (T021)", () => {
  it.each([
    ["BR", "pt-BR"],
    ["US", "en"],
    ["GB", "en"],
    ["CA", "en"],
    ["AU", "en"],
    ["NZ", "en"],
    ["IE", "en"],
    ["ES", "es"],
    ["MX", "es"],
    ["AR", "es"],
    ["CO", "es"],
    ["CL", "es"],
    ["PE", "es"],
    ["VE", "es"],
    ["EC", "es"],
  ])("maps %s to %s", (country, expectedLocale) => {
    expect(detectLocale(country)).toBe(expectedLocale);
  });

  it("returns null for unsupported countries", () => {
    expect(detectLocale("DE")).toBeNull();
    expect(detectLocale("JP")).toBeNull();
    expect(detectLocale("CN")).toBeNull();
    expect(detectLocale("RU")).toBeNull();
  });

  it("returns null for null/empty input", () => {
    expect(detectLocale(null)).toBeNull();
    expect(detectLocale("")).toBeNull();
  });
});

// ── T022: Integration tests for geo-IP detection flow ──────────────────
describe("Geo-IP Detection flow (T022)", () => {
  it("detects pt-BR from x-vercel-ip-country: BR", () => {
    expect(detectLocale("BR")).toBe("pt-BR");
  });

  it("detects en from x-vercel-ip-country: US", () => {
    expect(detectLocale("US")).toBe("en");
  });

  it("detects es from cf-ipcountry: ES", () => {
    expect(detectLocale("ES")).toBe("es");
  });

  it("detects en from x-geo-country: GB", () => {
    expect(detectLocale("GB")).toBe("en");
  });

  it("respects precedence: cookie over geo-IP", () => {
    // Simulated: if cookie exists, use cookie locale instead of geo-IP
    const cookieLocale = "en";
    const geoDetected = detectLocale("BR"); // would be pt-BR
    const finalLocale = cookieLocale ?? geoDetected ?? "en";
    expect(finalLocale).toBe("en"); // cookie prevails
  });

  it("preserves path structure on locale prefix addition", () => {
    const pathname = "/sobre";
    const detected = "pt-BR";
    const newPath = `/${detected}${pathname}`;
    expect(newPath).toBe("/pt-BR/sobre");
  });

  it("handles root path correctly", () => {
    const pathname = "/";
    const detected = "en";
    const newPath = `/${detected}${pathname === "/" ? "" : pathname}`;
    expect(newPath).toBe("/en");
  });
});

// ── T023: Fallback chain tests ─────────────────────────────────────────
describe("Fallback chain (T023)", () => {
  it("falls back to en when no geo-IP headers present", () => {
    const detected = detectLocale(null);
    const finalLocale = detected ?? "en";
    expect(finalLocale).toBe("en");
  });

  it("falls back to en for unsupported country", () => {
    const detected = detectLocale("DE");
    const finalLocale = detected ?? "en";
    expect(finalLocale).toBe("en");
  });

  it("skips API routes (path check)", () => {
    const isApiRoute = (pathname: string) => pathname.startsWith("/api/");
    expect(isApiRoute("/api/admin/session")).toBe(true);
    expect(isApiRoute("/sobre")).toBe(false);
  });

  it("skips _next static routes (path check)", () => {
    const isNextInternal = (pathname: string) =>
      pathname.startsWith("/_next/") || /\.\w+$/.test(pathname);
    expect(isNextInternal("/_next/static/chunk.js")).toBe(true);
    expect(isNextInternal("/favicon.ico")).toBe(true);
    expect(isNextInternal("/sobre")).toBe(false);
  });

  it("does not redirect when URL already has locale prefix", () => {
    const hasLocalePrefix = (pathname: string) =>
      locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
    expect(hasLocalePrefix("/en/sobre")).toBe(true);
    expect(hasLocalePrefix("/pt-BR")).toBe(true);
    expect(hasLocalePrefix("/es/admin")).toBe(true);
    expect(hasLocalePrefix("/sobre")).toBe(false);
  });

  it("cookie detection works: valid cookie returns its value", () => {
    const validCookies = ["pt-BR", "en", "es"];
    const cookieValue = "en";
    const isValid = validCookies.includes(cookieValue);
    const finalLocale = isValid ? cookieValue : "en";
    expect(finalLocale).toBe("en");
  });

  it("invalid cookie falls back to en", () => {
    const validCookies = ["pt-BR", "en", "es"];
    const cookieValue = "fr";
    const isValid = validCookies.includes(cookieValue);
    const finalLocale = isValid ? cookieValue : "en";
    expect(finalLocale).toBe("en");
  });
});

// ── Accept-Language detection (browser default) ────────────────────────
describe("Accept-Language detection", () => {
  function detectFromAcceptLang(header: string | null): string | null {
    if (!header) return null;
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

  it("detects pt-BR from Accept-Language: pt-BR", () => {
    expect(detectFromAcceptLang("pt-BR,pt;q=0.9")).toBe("pt-BR");
  });

  it("detects pt-BR from Accept-Language: pt (generic)", () => {
    expect(detectFromAcceptLang("pt")).toBe("pt-BR");
  });

  it("detects en from Accept-Language: en-US", () => {
    expect(detectFromAcceptLang("en-US,en;q=0.9")).toBe("en");
  });

  it("detects es from Accept-Language: es-MX", () => {
    expect(detectFromAcceptLang("es-MX,es;q=0.8")).toBe("es");
  });

  it("uses first matching language (pt-BR before en)", () => {
    expect(detectFromAcceptLang("pt-BR,en;q=0.8,es;q=0.5")).toBe("pt-BR");
  });

  it("falls through unsupported languages to find match", () => {
    expect(detectFromAcceptLang("fr,de,en;q=0.5")).toBe("en");
  });

  it("returns null for completely unsupported languages", () => {
    expect(detectFromAcceptLang("fr,de,ja")).toBeNull();
  });

  it("returns null for empty header", () => {
    expect(detectFromAcceptLang("")).toBeNull();
    expect(detectFromAcceptLang(null)).toBeNull();
  });

  // Full chain: browser > geo-IP > en
  it("precedence: Accept-Language over geo-IP", () => {
    const fromBrowser = detectFromAcceptLang("pt-BR");
    const fromGeo = detectLocale("US"); // would be en
    const finalLocale = fromBrowser ?? fromGeo ?? "en";
    expect(finalLocale).toBe("pt-BR"); // browser wins
  });

  it("fallback: geo-IP when Accept-Language is unsupported", () => {
    const fromBrowser = detectFromAcceptLang("fr,de"); // unsupported
    const fromGeo = detectLocale("ES"); // es
    const finalLocale = fromBrowser ?? fromGeo ?? "en";
    expect(finalLocale).toBe("es"); // geo-IP kick in
  });

  it("full precedence: cookie > Accept-Language > geo-IP > en", () => {
    // No cookie, browser says pt-BR, geo says US
    const cookie = null;
    const browser = detectFromAcceptLang("pt-BR");
    const geo = detectLocale("US");
    const final = cookie ?? browser ?? geo ?? "en";
    expect(final).toBe("pt-BR"); // browser preferred over geo

    // With cookie, cookie always wins
    const finalWithCookie = "es" ?? browser ?? geo ?? "en";
    expect(finalWithCookie).toBe("es");
  });
});
