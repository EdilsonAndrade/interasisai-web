const INTERASIS_AI_NAME = "Interasis AI";

function connectPageUrl(siteUrl: string, locale: string): string {
  return `${siteUrl}/${locale}/interasisai-connect`;
}

export function buildConnectServiceJsonLd(params: {
  locale: string;
  siteUrl: string;
  name: string;
  description: string;
}): Record<string, unknown> {
  const { locale, siteUrl, name, description } = params;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: INTERASIS_AI_NAME,
      url: siteUrl,
    },
    areaServed: ["BR", "US", "Europe"],
    url: connectPageUrl(siteUrl, locale),
  };
}

export function buildConnectBreadcrumbJsonLd(params: {
  locale: string;
  siteUrl: string;
  homeLabel: string;
  pageLabel: string;
}): Record<string, unknown> {
  const { locale, siteUrl, homeLabel, pageLabel } = params;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageLabel,
        item: connectPageUrl(siteUrl, locale),
      },
    ],
  };
}
