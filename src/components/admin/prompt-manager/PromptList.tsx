// ============================================================================
// PromptList — Lista de prompts com ações editar/excluir
// ============================================================================

"use client";

import { Edit2, FileText, Link2, Loader2, Plus, Search, Star } from "lucide-react";
import { useState } from "react";
import type { Guardrail, Prompt } from "@/services/promptManager.types";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { GuardrailScopeBadge } from "@/components/admin/GuardrailScopeBadge";
import type { ConfirmDeleteTarget } from "./types";
import type { NodeType } from "@/services/promptManager.types";

const NODE_LABELS: Record<NodeType, string> = {
  operational: "Operacional",
  institutional: "Institucional",
  chitchat: "Chitchat",
};

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalize(value: string): string {
  return value.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase();
}

interface PromptListProps {
  prompts: Prompt[];
  availableGuardrails: Guardrail[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => Promise<boolean>;
  onNew: () => void;
  onBulkLink: (prompt: Prompt) => void;
}

export function PromptList({
  prompts,
  availableGuardrails,
  loading,
  error,
  onRefresh,
  onEdit,
  onDelete,
  onNew,
  onBulkLink,
}: PromptListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ConfirmDeleteTarget>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const guardrailsById = new Map(availableGuardrails.map((g) => [g.id, g]));

  const normalizedQuery = normalize(query.trim());
  const filteredPrompts = normalizedQuery
    ? prompts.filter((p) => normalize(p.titulo).includes(normalizedQuery))
    : prompts;

  // Prompts sharing both title and node_type are indistinguishable by the node
  // badge alone — count title+node collisions so those get an extra id-based
  // tie-breaker in the render below.
  const titleNodeCounts = new Map<string, number>();
  for (const p of filteredPrompts) {
    const key = `${normalize(p.titulo)}|${p.node_type}`;
    titleNodeCounts.set(key, (titleNodeCounts.get(key) ?? 0) + 1);
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await onDelete(deleteTarget.id);
    setDeleting(false);
    if (ok) {
      setDeleteTarget(null);
    }
  };

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
          className="mt-2 text-sm font-semibold text-brand-primary hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-strong">Prompts Base</h2>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex min-h-10 items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo Prompt
        </button>
      </div>

      {/* Search */}
      {prompts.length > 0 && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-weak"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título..."
            aria-label="Buscar prompt por título"
            className="w-full rounded-card border border-border-subtle bg-surface-subtle py-2 pl-9 pr-4 text-sm text-text-body outline-none transition-colors focus:border-brand-primary"
          />
        </div>
      )}

      {/* Empty State — no prompts at all */}
      {prompts.length === 0 && (
        <div className="rounded-card border border-dashed border-border-subtle px-5 py-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-text-weak" aria-hidden="true" />
          <p className="text-sm text-text-weak">Nenhum prompt cadastrado.</p>
          <p className="mt-1 text-xs text-text-weak">
            Clique em &ldquo;Novo Prompt&rdquo; para criar um modelo de prompt.
          </p>
        </div>
      )}

      {/* Empty State — search yields no matches */}
      {prompts.length > 0 && filteredPrompts.length === 0 && (
        <div className="rounded-card border border-dashed border-border-subtle px-5 py-12 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-text-weak" aria-hidden="true" />
          <p className="text-sm text-text-weak">
            Nenhum prompt encontrado para &ldquo;{query.trim()}&rdquo;.
          </p>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-2">
        {filteredPrompts.map((p) => {
          const resolvedFromIds = (p.guardrail_ids ?? [])
            .map((id) => guardrailsById.get(id))
            .filter((g): g is Guardrail => Boolean(g));
          const displayGuardrails = p.guardrails && p.guardrails.length > 0
            ? p.guardrails
            : resolvedFromIds;
          const titleNodeKey = `${normalize(p.titulo)}|${p.node_type}`;
          const needsTieBreaker = (titleNodeCounts.get(titleNodeKey) ?? 0) > 1;

          return (
          <div
            key={p.id}
            className="flex items-start justify-between gap-4 rounded-card border border-border-subtle bg-surface-base px-5 py-4 transition-colors hover:border-brand-primary/20"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-text-strong">
                  {p.titulo}
                </h3>
                <span className="inline-flex shrink-0 items-center rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-semibold text-text-weak">
                  {NODE_LABELS[p.node_type]}
                </span>
                {needsTieBreaker && (
                  <span
                    className="inline-flex shrink-0 items-center rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[10px] text-text-weak"
                    title="Identificador para diferenciar prompts com título e nó idênticos"
                  >
                    #{p.id.slice(-6)}
                  </span>
                )}
                {p.is_default && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-primary/20 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                    <Star className="h-3 w-3" aria-hidden="true" />
                    Padrão
                  </span>
                )}
              </div>

              {/* Guardrail Chips */}
              {displayGuardrails.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {displayGuardrails.map((g) => (
                    <span
                      key={g.id}
                      className="inline-flex items-center rounded-md bg-surface-subtle px-2 py-0.5 text-xs text-text-weak"
                    >
                      <ShieldChip className="mr-1 h-3 w-3 text-brand-primary" aria-hidden="true" />
                      {g.titulo}
                      {g.is_global && (
                        <span className="ml-1">
                          <GuardrailScopeBadge isGlobal={g.is_global} />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {displayGuardrails.length === 0 && (
                <p className="mt-1 text-xs text-text-weak">Nenhum guardrail vinculado.</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onBulkLink(p)}
                aria-label={`Aplicar ${p.titulo} a tenants`}
                title="Aplicar a estes tenants"
                className="rounded-md p-2 text-text-weak transition-colors hover:bg-surface-subtle hover:text-brand-primary"
              >
                <Link2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onEdit(p)}
                aria-label={`Editar ${p.titulo}`}
                className="rounded-md p-2 text-text-weak transition-colors hover:bg-surface-subtle hover:text-brand-primary"
              >
                <Edit2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <DeleteAction
                onClick={() => setDeleteTarget({ id: p.id, titulo: p.titulo, type: "prompt" })}
                ariaLabel={`Excluir ${p.titulo}`}
              />
            </div>
          </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AdminDialog
        open={deleteTarget !== null}
        title="Excluir prompt?"
        onClose={() => setDeleteTarget(null)}
        closeDisabled={deleting}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-body">
            Tem certeza que deseja excluir o prompt{" "}
            <strong className="text-text-strong">{deleteTarget?.titulo}</strong>?
          </p>
          <p className="text-sm text-red-400">Esta ação não poderá ser desfeita.</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="inline-flex min-h-10 items-center rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex min-h-10 items-center gap-2 rounded-card bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Excluir
            </button>
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}

// Small shield icon for guardrail chips (inline component to avoid extra import)
function ShieldChip({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.06 1.06 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
