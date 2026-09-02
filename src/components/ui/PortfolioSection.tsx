import { BarChart3, Bot, Factory, PartyPopper, Sparkles, Truck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import PortfolioCard from "@/components/ui/PortfolioCard";

export default async function PortfolioSection() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  const projects = [
    {
      title: t("portfolio.projects.chatAssistant.title"),
      category: t("portfolio.projects.chatAssistant.category"),
      description: t("portfolio.projects.chatAssistant.description"),
      impactText: t("portfolio.projects.chatAssistant.impactText"),
      highlights: t.raw("portfolio.projects.chatAssistant.highlights") as string[],
      tags: ["RAG", "LLM Ingestion", "WhatsApp API", "Web Widget", "NestJS"],
      status: t("portfolio.status.omnichannel"),
      Icon: Bot,
      actionText: t("portfolio.actions.testAssistant"),
      isInteractiveChat: true,
      learnMoreLabel: t("portfolio.actions.learnMore"),
      learnMoreHref: `/${locale}/interasisai-connect`,
      featuresLabel: t("portfolio.actions.featuresLabel"),
      ownershipLabel: t("portfolio.ownershipLabel"),
      ctaBannerLabel: t("portfolio.actions.ctaBanner"),
    },
    {
      title: t("portfolio.projects.simplificandoai.title"),
      category: t("portfolio.projects.simplificandoai.category"),
      description: t("portfolio.projects.simplificandoai.description"),
      highlights: [
        t("portfolio.projects.simplificandoai.highlights.0"),
        t("portfolio.projects.simplificandoai.highlights.1"),
      ],
      tags: ["Next.js", "Vision AI", "Meta API", "TailwindCSS", "Node.js"],
      status: t("portfolio.status.live"),
      Icon: Sparkles,
      actionText: t("portfolio.actions.visitSite"),
      actionHref: "https://simplificandoai.com.br",
      isInteractiveChat: false,
      featuresLabel: t("portfolio.actions.featuresLabel"),
      ownershipLabel: t("portfolio.ownershipLabel"),
    },
    {
      title: t("portfolio.projects.feijoadaDelivery.title"),
      category: t("portfolio.projects.feijoadaDelivery.category"),
      description: t("portfolio.projects.feijoadaDelivery.description"),
      highlights: [
        t("portfolio.projects.feijoadaDelivery.highlights.0"),
        t("portfolio.projects.feijoadaDelivery.highlights.1"),
        t("portfolio.projects.feijoadaDelivery.highlights.2"),
      ],
      tags: ["React", "React Native", "Redux", "Node.js", "WebSockets"],
      status: t("portfolio.status.delivered"),
      Icon: Truck,
      actionText: "",
      featuresLabel: t("portfolio.actions.featuresLabel"),
    },
    {
      title: t("portfolio.projects.dataDashboard.title"),
      category: t("portfolio.projects.dataDashboard.category"),
      description: t("portfolio.projects.dataDashboard.description"),
      highlights: [
        t("portfolio.projects.dataDashboard.highlights.0"),
        t("portfolio.projects.dataDashboard.highlights.1"),
        t("portfolio.projects.dataDashboard.highlights.2"),
      ],
      tags: ["Next.js", "GraphQL", "Node.js", "NestJS", "Python", "MongoDB"],
      status: t("portfolio.status.delivered"),
      Icon: BarChart3,
      actionText: "",
      featuresLabel: t("portfolio.actions.featuresLabel"),
    },
    {
      title: t("portfolio.projects.metalsCatalog.title"),
      category: t("portfolio.projects.metalsCatalog.category"),
      description: t("portfolio.projects.metalsCatalog.description"),
      highlights: [
        t("portfolio.projects.metalsCatalog.highlights.0"),
        t("portfolio.projects.metalsCatalog.highlights.1"),
        t("portfolio.projects.metalsCatalog.highlights.2"),
      ],
      tags: ["Next.js", "Node.js", "MySQL", "AWS Lambda", "CloudFront"],
      status: t("portfolio.status.delivered"),
      Icon: Factory,
      actionText: "",
      featuresLabel: t("portfolio.actions.featuresLabel"),
    },
    {
      title: t("portfolio.projects.eventsPlatform.title"),
      category: t("portfolio.projects.eventsPlatform.category"),
      description: t("portfolio.projects.eventsPlatform.description"),
      highlights: [
        t("portfolio.projects.eventsPlatform.highlights.0"),
        t("portfolio.projects.eventsPlatform.highlights.1"),
        t("portfolio.projects.eventsPlatform.highlights.2"),
      ],
      tags: ["React", "Next.js", "Apollo GraphQL", "Node.js", "Styled-components"],
      status: t("portfolio.status.delivered"),
      Icon: PartyPopper,
      actionText: "",
      featuresLabel: t("portfolio.actions.featuresLabel"),
    },
  ];

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="scroll-mt-24 px-6 py-16 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-3">
          <div className="inline-flex items-center gap-2 rounded-pill border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary"></span>
            <span>{t("portfolio.badge")}</span>
          </div>

          <h2 className="text-3xl font-extrabold text-text-strong sm:text-4xl">
            {t("portfolio.heading")}
          </h2>

          <p className="max-w-3xl text-base text-text-body sm:text-lg">
            {t("portfolio.subtitle")}
          </p>
        </div>

        <div
          data-testid="portfolio-grid"
          className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {projects.map((project) => (
            <PortfolioCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
