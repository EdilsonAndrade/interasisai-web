import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import TechBadge from "@/components/ui/TechBadge";
import PortfolioOpenChatButton from "@/components/ui/PortfolioOpenChatButton";

export type PortfolioCardProps = {
  title: string;
  category: string;
  description: string;
  highlights: string[];
  tags: string[];
  status: string;
  Icon: LucideIcon;
  actionText: string;
  actionHref?: string;
  isInteractiveChat?: boolean;
  featuresLabel?: string;
  extraBadge?: ReactNode;
};

export default function PortfolioCard({
  title,
  category,
  description,
  highlights,
  tags,
  status,
  Icon,
  actionText,
  actionHref,
  isInteractiveChat,
  featuresLabel = "Diferenciais & Recursos",
}: PortfolioCardProps) {
  return (
    <article
      data-testid="portfolio-card"
      className="group relative flex flex-col justify-between rounded-card border border-border-subtle/70 bg-surface-base/65 p-6 sm:p-8 shadow-floating backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        {/* Header: Icon & Status */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex rounded-pill bg-brand-primary/15 p-3 text-brand-primary transition-transform group-hover:scale-105">
            <Icon aria-hidden="true" className="h-6 w-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-pill border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>{status}</span>
          </div>
        </div>

        {/* Content Details */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            {category}
          </span>
          <h3 className="mt-1 text-2xl font-bold text-text-strong group-hover:text-brand-primary-soft transition-colors">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-body sm:text-base">
            {description}
          </p>
        </div>

        {/* Highlights List */}
        <div className="space-y-2.5 rounded-lg border border-border-subtle/50 bg-surface-page/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-strong/80">
            {featuresLabel}
          </h4>
          <ul className="space-y-2">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2 text-xs leading-normal text-text-body sm:text-sm"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Badges */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TechBadge key={tag}>{tag}</TechBadge>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-8 pt-4 border-t border-border-subtle/40 flex items-center justify-between">
        {isInteractiveChat ? (
          <PortfolioOpenChatButton
            label={actionText}
            className="w-full sm:w-auto"
          />
        ) : actionHref ? (
          <a
            href={actionHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="portfolio-external-link"
            className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/60 active:scale-[0.98] sm:w-auto"
          >
            <span>{actionText}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
