import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoWidgetLoader from "@/components/chat/DemoWidgetLoader";
import { getDemoTenant } from "@/lib/demoTenants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const demo = getDemoTenant(slug);

  return {
    title: demo ? `Demo · ${demo.nicho} | Interasis AI` : "Demo não encontrada",
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = getDemoTenant(slug);

  if (!demo) {
    notFound();
  }

  const { Icon, nicho, headline, subheadline, tenantId } = demo;

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
          Demo · {nicho}
        </span>
        <h1 className="font-space-grotesk text-3xl font-extrabold sm:text-4xl">{headline}</h1>
        <p className="max-w-xl text-text-body">{subheadline}</p>
        <p className="text-sm text-text-body/70">
          Clique no ícone de chat no canto inferior direito para conversar com o assistente.
        </p>
      </div>

      <DemoWidgetLoader tenantId={tenantId} />
    </div>
  );
}
