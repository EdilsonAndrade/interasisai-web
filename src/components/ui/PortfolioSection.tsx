import { Bot, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import PortfolioCard from "@/components/ui/PortfolioCard";

export default async function PortfolioSection() {
  const t = await getTranslations("home");

  const projects = [
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
      title: t("portfolio.projects.chatAssistant.title"),
      category: t("portfolio.projects.chatAssistant.category"),
      description: t("portfolio.projects.chatAssistant.description"),
      highlights: [
        t("portfolio.projects.chatAssistant.highlights.0"),
        t("portfolio.projects.chatAssistant.highlights.1"),
        t("portfolio.projects.chatAssistant.highlights.2"),
        t("portfolio.projects.chatAssistant.highlights.3"),
      ],
      tags: ["RAG", "LLM Ingestion", "WhatsApp API", "Web Widget", "NestJS"],
      status: t("portfolio.status.omnichannel"),
      Icon: Bot,
      actionText: t("portfolio.actions.testAssistant"),
      isInteractiveChat: true,
      featuresLabel: t("portfolio.actions.featuresLabel"),
      ownershipLabel: t("portfolio.ownershipLabel"),
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
