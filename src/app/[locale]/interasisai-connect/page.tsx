import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ConnectPage from "@/components/connect/ConnectPage";
import {
  buildConnectBreadcrumbJsonLd,
  buildConnectServiceJsonLd,
} from "@/components/connect/connectStructuredData";
import type { ConnectPageContent } from "@/components/connect/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://interasisai.com.br";

// TODO: replace with a dedicated /images/interasisai-connect-cover.png once the
// requester provides the asset (FR-015) — falls back to the generic site cover so
// openGraph.images is never empty.
const CONNECT_OG_IMAGE = "/images/interasisai_coverpage.png";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "connect" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `/${locale}/interasisai-connect`,
      languages: {
        "pt-BR": "/pt-BR/interasisai-connect",
        en: "/en/interasisai-connect",
        es: "/es/interasisai-connect",
        "x-default": "/en/interasisai-connect",
      },
    },
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: `/${locale}/interasisai-connect`,
      type: "website",
      locale,
      images: [{ url: CONNECT_OG_IMAGE, width: 1200, height: 630, alt: "InterasisAI Connect" }],
    },
  };
}

export default async function InterasisAIConnectPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "connect" });

  const content: ConnectPageContent = {
    metadata: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      breadcrumbHomeLabel: t("metadata.breadcrumbHomeLabel"),
    },
    eyebrow: t("eyebrow"),
    title: t.rich("title", {
      em: (chunks) => (
        <em className="not-italic text-brand-primary">{chunks}</em>
      ),
    }),
    lead: t("lead"),
    comparisonLabels: {
      common: t("comparisonLabels.common"),
      connect: t("comparisonLabels.connect"),
    },
    comparisonBadges: {
      common: t("comparisonBadges.common"),
      connect: t("comparisonBadges.connect"),
    },
    architecture: {
      title: t("architecture.title"),
      description: t("architecture.description"),
      analogy: t("architecture.analogy"),
      highlight: t("architecture.highlight"),
    },
    comparisonTable: {
      title: t("comparisonTable.title"),
      rows: t.raw("comparisonTable.rows"),
    },
    steps: {
      title: t("steps.title"),
      items: t.raw("steps.items"),
    },
    cta: {
      title: t("cta.title"),
      description: t("cta.description"),
      buttonLabel: t("cta.buttonLabel"),
    },
    verticals: t.raw("verticals"),
  };

  const serviceJsonLd = buildConnectServiceJsonLd({
    locale,
    siteUrl,
    name: "InterasisAI Connect",
    description: content.metadata.description,
  });

  const breadcrumbJsonLd = buildConnectBreadcrumbJsonLd({
    locale,
    siteUrl,
    homeLabel: content.metadata.breadcrumbHomeLabel,
    pageLabel: content.metadata.title,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ConnectPage content={content} ctaButtonLabel={content.cta.buttonLabel} />
    </>
  );
}
