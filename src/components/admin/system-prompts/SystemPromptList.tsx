// ============================================================================
// SystemPromptList — Lista os prompts do sistema (conjunto fixo, sem CRUD)
// ============================================================================

"use client";

import { FileText, Loader2 } from "lucide-react";
import type { SystemPromptListProps } from "./types";

export function SystemPromptList({
  prompts,
  selectedPromptKey,
  loading,
  error,
  onRefresh,
  onSelect,
}: SystemPromptListProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-text-weak">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <p className="text-sm">Carregando prompts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-red-500/30 bg-red-500/10 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-red-400">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-2 text-sm font-semibold text-brand-primary hover:underline w-fit"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border-subtle px-5 py-12 text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-text-weak" aria-hidden="true" />
        <p className="text-sm text-text-weak">Nenhum prompt do sistema disponível.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Prompts do sistema">
      {prompts.map((prompt) => {
        const active = prompt.prompt_key === selectedPromptKey;
        return (
          <li key={prompt.id}>
            <button
              type="button"
              onClick={() => onSelect(prompt.prompt_key)}
              aria-current={active ? "true" : undefined}
              className={`flex min-w-[284px] items-center gap-3 break-words rounded-card border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                active
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-border-subtle bg-surface-base text-text-body hover:border-brand-primary/30"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
              {prompt.titulo}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
