import type { LucideIcon } from "lucide-react";
import { ArrowRight, Cloud, Database, Server, Sparkles, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

type FlowStepKey = "client" | "backend" | "ai" | "data" | "cloud";

const FLOW_STEP_KEYS: FlowStepKey[] = ["client", "backend", "ai", "data", "cloud"];

const FLOW_STEP_ICONS: Record<FlowStepKey, LucideIcon> = {
  client: Users,
  backend: Server,
  ai: Sparkles,
  data: Database,
  cloud: Cloud,
};

export default async function HeroCover() {
  const t = await getTranslations("home.hero.flow");

  return (
    <div data-testid="hero-cover" className="w-full">
      <div className="hero-grid relative overflow-hidden rounded-card border border-border-subtle bg-surface-subtle/95 px-6 py-10 shadow-floating backdrop-blur-sm sm:px-10 sm:py-12">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-text-strong/70">
          {t("eyebrow")}
        </p>

        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-0">
          {FLOW_STEP_KEYS.map((key, index) => {
            const Icon = FLOW_STEP_ICONS[key];
            return (
              <div key={key} className="flex flex-col items-stretch lg:flex-1 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3 rounded-card border border-border-subtle/50 bg-surface-base/70 p-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand-primary/15 text-brand-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-text-strong">
                      {t(`steps.${key}.label`)}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-body/80">
                      {t(`steps.${key}.detail`)}
                    </span>
                  </span>
                </div>

                {index < FLOW_STEP_KEYS.length - 1 && (
                  <div className="flex items-center justify-center py-1 lg:px-3 lg:py-0">
                    <ArrowRight
                      className="h-4 w-4 rotate-90 text-border-subtle lg:rotate-0"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
