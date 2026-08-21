"use client";

import { useId } from "react";

type GuardrailScopeBadgeProps = {
  isGlobal: boolean;
};

/**
 * Single source of truth for the "guardrail is global" indicator, replacing
 * the divergent "(G)" / "Global" / "Específico" renderings previously
 * duplicated across PromptList, GuardrailList, PromptFormModal and
 * TenantLinkSection. Renders nothing for non-global guardrails.
 */
export function GuardrailScopeBadge({ isGlobal }: GuardrailScopeBadgeProps) {
  const tooltipId = useId();

  if (!isGlobal) return null;

  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="inline-flex items-center rounded-full bg-brand-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
      >
        Global
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-56 -translate-x-1/2 rounded-md border border-border-subtle bg-surface-base px-2 py-1 text-[11px] font-normal text-text-strong opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        Este guardrail se aplica a todos os tenants
      </span>
    </span>
  );
}
