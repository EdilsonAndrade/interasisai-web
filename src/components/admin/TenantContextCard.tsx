"use client";

import { Loader2, Shield, Sparkles } from "lucide-react";
import type { TenantPromptDetail } from "@/services/promptManager.types";

type TenantContextCardProps = {
  detail: TenantPromptDetail | null;
  loading: boolean;
  error: string | null;
};

export function TenantContextCard({ detail, loading, error }: TenantContextCardProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-base/60 p-4 text-text-body">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Carregando contexto do tenant...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-card border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!detail) return null;

  // The contract's `is_default_prompt` and the pre-existing `prompt_is_default`
  // may not both be sent by every backend revision — read defensively.
  const isDefault = detail.is_default_prompt ?? detail.prompt_is_default;

  return (
    <div className="w-full max-w-2xl space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-text-strong">{detail.prompt_titulo}</h3>
        {isDefault && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/20 px-2 py-0.5 text-xs font-semibold text-brand-primary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Padrão do Sistema
          </span>
        )}
      </div>

      {detail.guardrails_associados.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase text-text-body/60">
            Guardrails ({detail.guardrails_associados.length})
          </p>
          <div className="flex flex-col gap-1">
            {detail.guardrails_associados.map((guardrail) => (
              <div
                key={guardrail.id}
                className="flex items-center gap-2 rounded-md bg-surface-subtle px-3 py-1.5 text-xs"
              >
                <Shield className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                <span className="font-medium text-text-body">{guardrail.titulo}</span>
                {guardrail.is_global && (
                  <span className="rounded-full bg-brand-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                    Global
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
