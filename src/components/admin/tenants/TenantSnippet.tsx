"use client";

import { Check, Copy } from "lucide-react";
import { useTenantSnippet } from "@/hooks/useTenantSnippet";
import type { Tenant } from "@/services";

type TenantSnippetProps = {
  tenant: Pick<Tenant, "id">;
};

export function TenantSnippet({ tenant }: TenantSnippetProps) {
  const { snippet, copied, copySnippet } = useTenantSnippet(tenant);

  return (
    <section className="space-y-2 border-t border-border-subtle pt-6">
      <h3 className="text-sm font-semibold uppercase text-text-muted">
        Snippet de instalação
      </h3>
      <p className="text-sm text-text-body">
        Envie este trecho ao cliente. Ele só precisa colar em seu site, sem editar nada.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded-card border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-text-strong">
          {snippet}
        </code>
        <button
          type="button"
          onClick={copySnippet}
          className="inline-flex shrink-0 items-center gap-2 rounded-card border border-border-subtle px-3 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </section>
  );
}
