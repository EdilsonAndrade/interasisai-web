import PortfolioOpenChatButton from "@/components/ui/PortfolioOpenChatButton";

import ConnectVerticalComparison from "./ConnectVerticalComparison";
import type { ConnectPageContent } from "./types";

type ConnectPageProps = {
  content: ConnectPageContent;
  ctaButtonLabel: string;
};

export default function ConnectPage({ content, ctaButtonLabel }: ConnectPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
      <header className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
          {content.eyebrow}
        </span>
        <h1 className="text-3xl font-extrabold text-text-strong sm:text-4xl">{content.title}</h1>
        <p className="max-w-3xl text-base text-text-body sm:text-lg">{content.lead}</p>
      </header>

      <section className="mt-10">
        <ConnectVerticalComparison
          verticals={content.verticals}
          labels={content.comparisonLabels}
          badges={content.comparisonBadges}
        />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-text-strong sm:text-3xl">
          {content.architecture.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-text-body">
          {content.architecture.description}
        </p>
        <p className="mt-4 rounded-card border border-border-subtle/60 bg-surface-page/50 p-4 text-base leading-relaxed text-text-body">
          {content.architecture.analogy}
        </p>
        <p className="mt-4 text-base font-semibold leading-relaxed text-brand-primary">
          {content.architecture.highlight}
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-text-strong sm:text-3xl">
          {content.comparisonTable.title}
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle/60">
                <th scope="col" className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-text-strong/60">
                  <span className="sr-only">{content.comparisonTable.title}</span>
                </th>
                <th scope="col" className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-text-strong/60">
                  {content.comparisonLabels.common}
                </th>
                <th scope="col" className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-primary">
                  {content.comparisonLabels.connect}
                </th>
              </tr>
            </thead>
            <tbody>
              {content.comparisonTable.rows.map((row) => (
                <tr key={row.label} className="border-b border-border-subtle/40">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-left align-top font-semibold text-text-strong"
                  >
                    {row.label}
                  </th>
                  <td className="py-3 pr-4 align-top text-text-body">{row.common}</td>
                  <td className="py-3 align-top text-brand-primary">{row.connect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-text-strong sm:text-3xl">{content.steps.title}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.steps.items.map((step, index) => (
            <div
              key={step.title}
              className="rounded-card border border-border-subtle/60 bg-surface-page/50 p-5"
            >
              <span className="text-2xl font-extrabold text-brand-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-sm font-bold text-text-strong">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-body">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-card border border-brand-primary/30 bg-brand-primary/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-text-strong sm:text-3xl">{content.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-text-body">{content.cta.description}</p>
        <div className="mt-6 flex justify-center">
          <PortfolioOpenChatButton label={ctaButtonLabel} />
        </div>
      </section>
    </div>
  );
}
