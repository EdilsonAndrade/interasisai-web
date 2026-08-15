import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Brain, Code, Cog } from "lucide-react";
import { getTranslations } from "next-intl/server";

import FadeIn from "@/components/ui/animations/FadeIn";
import HeroChatCta from "@/components/ui/HeroChatCta";
import HeroCover from "@/components/ui/HeroCover";
import PortfolioSection from "@/components/ui/PortfolioSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      images: [
        {
          url: "/images/interasisai_coverpage.png",
          width: 1200,
          height: 630,
          alt: "Interasis AI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metadata.title"),
      description: t("metadata.description"),
      images: ["/images/interasisai_coverpage.png"],
    },
  };
}

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

type FeatureCardProps = Feature;

function FeatureCard({ title, description, Icon }: FeatureCardProps) {
  return (
    <article
      data-testid="feature-card"
      className="rounded-card border border-border-subtle/70 bg-surface-base/65 p-6 shadow-floating backdrop-blur-md"
    >
      <div className="mb-4 inline-flex rounded-pill bg-brand-primary/15 p-2 text-brand-primary">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-bold text-text-strong">{title}</h3>
      <p className="mt-3 text-text-body">{description}</p>
    </article>
  );
}

export default async function Home() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const features: Feature[] = [
    {
      title: t("services.items.engineering.title"),
      description: t("services.items.engineering.description"),
      Icon: Code,
    },
    {
      title: t("services.items.ai.title"),
      description: t("services.items.ai.description"),
      Icon: Brain,
    },
    {
      title: t("services.items.automation.title"),
      description: t("services.items.automation.description"),
      Icon: Cog,
    },
  ];

  return (
    <div data-testid="landing-page" className="bg-surface-page text-text-strong">
      <FadeIn>
        <section
          id="top"
          data-testid="hero-section"
          className="min-h-[80vh] bg-gradient-hero px-6 pt-10 pb-20 sm:px-8 lg:px-12"
        >
          <div
            data-testid="hero-grid"
            className="mx-auto flex max-w-6xl flex-col gap-10"
          >
            <HeroCover />
            <div className="flex flex-col justify-center gap-8">
             

              <h1 className="max-w-4xl font-space-grotesk text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                <span className="text-brand-primary">{t("hero.heading1")}</span> {t("hero.heading2")}
              </h1>
              <p className="max-w-3xl text-lg text-text-body">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  data-testid="cta-primary"
                  href="#servicos"
                  className="inline-flex items-center justify-center rounded-button bg-brand-primary px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-brand-primary-hover"
                >
                  {tc("cta.exploreSolutions")}
                </a>
                <HeroChatCta />
                <a
                  data-testid="cta-secondary"
                  href="#portfolio"
                  className="inline-flex items-center justify-center rounded-button border border-border-subtle bg-surface-base/55 px-6 py-3 text-base font-semibold text-text-strong backdrop-blur-md transition hover:bg-surface-subtle/70"
                >
                  {tc("cta.viewPortfolio")}
                </a>

              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section id="servicos" data-testid="services-section" className="scroll-mt-24 px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-extrabold text-text-strong">{t("services.heading")}</h2>
            <p className="mt-3 max-w-3xl text-text-body">
              {t("services.subtitle")}
            </p>
            <div data-testid="services-grid" className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <PortfolioSection />
      </FadeIn>
    </div>
  );
}
