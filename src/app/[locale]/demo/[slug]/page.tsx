import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import DemoWidgetLoader from "@/components/chat/DemoWidgetLoader";
import RefreshChatHintButton from "@/components/chat/RefreshChatHintButton";
import { getDemoTenant } from "@/lib/demoTenants";

type PageParams = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const demo = getDemoTenant(slug);
  const t = await getTranslations({ locale, namespace: "demo" });

  return {
    title: demo ? t("metadataTitle", { nicho: t(`tenants.${slug}.nicho`) }) : t("metadataNotFoundTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  const demo = getDemoTenant(slug);

  if (!demo) {
    notFound();
  }

  const { Icon, tenantId } = demo;
  const t = await getTranslations({ locale, namespace: "demo" });

  return (
    <div
      data-testid="demo-page"
      className="min-h-[70vh] bg-surface-page px-6 py-24 text-text-strong sm:px-8 lg:px-12"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="inline-flex rounded-pill bg-brand-primary/15 p-4 text-brand-primary">
          <Icon aria-hidden="true" className="h-8 w-8" />
        </div>
        <span className="rounded-pill border border-border-subtle/70 bg-surface-base/60 px-3.5 py-1.5 text-xs font-semibold">
          {t("eyebrowPrefix")} · {t(`tenants.${slug}.nicho`)}
        </span>
        <h1 className="font-space-grotesk text-3xl font-extrabold sm:text-4xl">
          {t(`tenants.${slug}.headline`)}
        </h1>
        <p className="max-w-xl text-text-body">{t(`tenants.${slug}.subheadline`)}</p>
        <p className="text-sm text-text-body/70">{t("instruction")}</p>
        <RefreshChatHintButton label={t("refreshHint")} />
      </div>

      <DemoWidgetLoader tenantId={tenantId} />
    </div>
  );
}
