// ============================================================================
// TenantPromptBindingCard — vínculo de prompt do tenant (nó operacional) com
// alerta de configuração quebrada e correção in-place (US2).
// ============================================================================

"use client";

import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import type { TenantPromptBindingState } from "@/hooks/useTenantPromptBinding";
import type { Prompt, TenantPromptDetail } from "@/services/promptManager.types";

type TenantPromptBindingCardProps = {
  state: TenantPromptBindingState;
  detail: TenantPromptDetail | null;
  error: string | null;
  linking: boolean;
  operationalPrompts: Prompt[];
  onLinkPrompt: (promptId: string) => Promise<boolean>;
};

function GuardrailsSection({
  guardrails,
}: {
  guardrails: TenantPromptDetail["guardrails_associados"];
}) {
  if (guardrails.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase text-text-body/60">
        Guardrails ({guardrails.length})
      </p>
      <div className="flex flex-col gap-1">
        {guardrails.map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-2 rounded-md bg-surface-subtle px-3 py-1.5 text-xs"
          >
            <Shield className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
            <span className="font-medium text-text-body">{g.titulo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TenantPromptBindingCard({
  state,
  detail,
  error,
  linking,
  operationalPrompts,
  onLinkPrompt,
}: TenantPromptBindingCardProps) {
  const [selectedPromptId, setSelectedPromptId] = useState("");

  if (state === "loading" || state === "idle") {
    return (
      <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-base/60 p-4 text-text-body">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Carregando vínculo de prompt...</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        role="alert"
        className="rounded-card border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
      >
        {error}
      </div>
    );
  }

  if (!detail) return null;

  if (state === "linked") {
    return (
      <div className="space-y-3 rounded-card border border-brand-primary/20 bg-surface-base/60 p-4">
        <p className="text-sm font-semibold text-text-strong">{detail.prompt_titulo}</p>
        <GuardrailsSection guardrails={detail.guardrails_associados} />
      </div>
    );
  }

  // state === "missing": NUNCA renderiza prompt_titulo/prompt_conteudo aqui —
  // vêm do prompt padrão, não da configuração vigente do tenant (FR-015).
  return (
    <div className="space-y-4 rounded-card border border-red-500/40 bg-red-500/10 p-4">
      <div role="alert" className="flex items-start gap-2 text-sm text-red-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Este tenant não tem prompt vinculado. O atendimento deste cliente não está configurado.
        </span>
      </div>
      <div className="space-y-2">
        <label htmlFor="tenant-binding-prompt" className="text-sm font-medium text-text-body">
          Vincular prompt
        </label>
        <select
          id="tenant-binding-prompt"
          value={selectedPromptId}
          disabled={linking}
          onChange={(event) => setSelectedPromptId(event.target.value)}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        >
          <option value="">Selecione um prompt...</option>
          {operationalPrompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
              {p.is_default ? " (Padrão)" : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={linking || !selectedPromptId}
          onClick={async () => {
            const ok = await onLinkPrompt(selectedPromptId);
            if (ok) setSelectedPromptId("");
          }}
          className="inline-flex items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse disabled:opacity-60"
        >
          {linking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {linking ? "Vinculando..." : "Vincular prompt"}
        </button>
      </div>
      <GuardrailsSection guardrails={detail.guardrails_associados} />
    </div>
  );
}
