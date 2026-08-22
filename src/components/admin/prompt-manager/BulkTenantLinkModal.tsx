// ============================================================================
// BulkTenantLinkModal — aplica um prompt a N tenants em uma confirmação, com
// preview de quem muda e garantia all-or-nothing (US3).
// ============================================================================

"use client";

import { CheckCircle2, Loader2, Search, X } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { BlockerList } from "@/components/admin/BlockerList";
import { useBulkTenantLink } from "@/hooks/useBulkTenantLink";
import type { Prompt } from "@/services/promptManager.types";

type BulkTenantLinkModalProps = {
  open: boolean;
  prompt: Prompt | null;
  onClose: () => void;
};

export function BulkTenantLinkModal({ open, prompt, onClose }: BulkTenantLinkModalProps) {
  const bulk = useBulkTenantLink();
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!open || !prompt) return;
    bulk.reset();
    setTerm("");
    bulk.loadAlreadyLinked(prompt.id);
    // Recarrega apenas quando o modal abre para um prompt diferente — as
    // funções do hook são estáveis (useCallback), incluí-las causaria loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prompt?.id]);

  if (!open || !prompt) return null;

  const handleClose = () => {
    bulk.reset();
    onClose();
  };

  const selectedIds = new Set(bulk.selected.map((t) => t.id));

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    bulk.search(term);
  };

  const success = bulk.linkedCount !== null;

  return (
    <AdminDialog
      open={open}
      title={`Aplicar "${prompt.titulo}" a tenants`}
      onClose={handleClose}
      closeDisabled={bulk.submitting}
    >
      {success ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" aria-hidden="true" />
          <p className="text-sm text-text-strong">
            {bulk.linkedCount} tenant{bulk.linkedCount === 1 ? "" : "s"} vinculado
            {bulk.linkedCount === 1 ? "" : "s"} a este prompt.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 inline-flex min-h-10 items-center rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse"
          >
            Fechar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-300">
            Esta ação <strong>substitui</strong> o vínculo atual do nó operacional em cada tenant
            selecionado e é <strong>tudo-ou-nada</strong>: se algum tenant for inválido, nada é
            aplicado. Vínculos de outros nós não são afetados.
          </p>

          <div className="space-y-2">
            <label htmlFor="bulk-link-search" className="text-sm font-medium text-text-body">
              Buscar tenants
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-weak"
                aria-hidden="true"
              />
              <input
                id="bulk-link-search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                disabled={bulk.submitting}
                placeholder="Nome ou ID do tenant..."
                className="w-full rounded-card border border-border-subtle bg-surface-subtle py-2 pl-9 pr-4 text-sm text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
              />
            </div>
            {bulk.searchError && (
              <p role="alert" className="text-sm text-red-300">
                {bulk.searchError}
              </p>
            )}
            {bulk.searching && (
              <p className="flex items-center gap-2 text-sm text-text-weak">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Buscando...
              </p>
            )}
            {!bulk.searching && bulk.searchResults.length > 0 && (
              <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-card border border-border-subtle p-1">
                {bulk.searchResults.map((tenant) => {
                  const isSelected = selectedIds.has(tenant.id);
                  return (
                    <li key={tenant.id}>
                      <button
                        type="button"
                        disabled={bulk.submitting}
                        onClick={() => bulk.toggleTenant({ id: tenant.id, name: tenant.name })}
                        aria-pressed={isSelected}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors disabled:opacity-60 ${
                          isSelected
                            ? "bg-brand-primary/20 text-brand-primary"
                            : "text-text-body hover:bg-surface-subtle"
                        }`}
                      >
                        <span className="truncate">{tenant.name}</span>
                        <span className="shrink-0 text-xs">{isSelected ? "Selecionado" : "Adicionar"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {bulk.selected.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-body">
                Selecionados ({bulk.selected.length})
              </p>
              <ul className="flex flex-wrap gap-2" aria-label="Tenants selecionados">
                {bulk.selected.map((tenant) => (
                  <li
                    key={tenant.id}
                    className="inline-flex max-w-full items-center gap-2 rounded-card border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-text-strong"
                  >
                    <span className="truncate">{tenant.name}</span>
                    <button
                      type="button"
                      onClick={() => bulk.removeTenant(tenant.id)}
                      disabled={bulk.submitting}
                      aria-label={`Remover ${tenant.name}`}
                      className="shrink-0 rounded-full p-0.5 text-text-muted hover:bg-surface-subtle hover:text-text-strong disabled:opacity-60"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bulk.selected.length > 0 && !bulk.loadingAlreadyLinked && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-text-body/60">
                  Já usam este prompt ({bulk.diff.unchanged.length})
                </p>
                <ul className="text-sm text-text-weak">
                  {bulk.diff.unchanged.map((t) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-text-body/60">
                  Serão alterados ({bulk.diff.changing.length})
                </p>
                <ul className="text-sm text-text-weak">
                  {bulk.diff.changing.map((t) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {bulk.submitError && (
            <div role="alert" className="space-y-2 rounded-card border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{bulk.submitError}</p>
              <BlockerList blockers={bulk.blockers} />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={bulk.submitting}
              className="inline-flex min-h-10 items-center rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={bulk.submitting || bulk.selected.length === 0}
              onClick={() => bulk.confirm(prompt.id)}
              className="inline-flex min-h-10 items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse disabled:opacity-50"
            >
              {bulk.submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {bulk.submitting ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </div>
      )}
    </AdminDialog>
  );
}
