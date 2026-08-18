import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import InstitutionalPage from "@/components/layout/InstitutionalPage";

const UPDATED_AT_DATE = "07/08/2026";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `/${locale}/termos`,
      languages: {
        "pt-BR": "/pt-BR/termos",
        en: "/en/termos",
        es: "/es/termos",
        "x-default": "/en/termos",
      },
    },
  };
}

export default async function TermosPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  const common = await getTranslations({ locale, namespace: "common" });
  const sections = t.raw("sections") as Record<string, { heading: string; content: string }>;

  return (
    <InstitutionalPage
      kicker={common("footer.institutional")}
      title={t("title")}
      summary={t("summary")}
      updatedAtLabel={t("updatedAt")}
      updatedAtDate={UPDATED_AT_DATE}
      sections={Object.values(sections)}
    />
  );
}
