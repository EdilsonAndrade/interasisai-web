// ============================================================================
// GuardrailList — Lista de guardrails com ações editar/excluir
// ============================================================================

"use client";

import { Edit2, Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Guardrail } from "@/services/promptManager.types";
import { AdminDialog } from "@/components/admin/AdminDialog";
import type { ConfirmDeleteTarget } from "./types";

interface GuardrailListProps {
  guardrails: Guardrail[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEdit: (guardrail: Guardrail) => void;
  onDelete: (id: string) => Promise<boolean>;
  onNew: () => void;
}

export function GuardrailList({
  guardrails,
  loading,
  error,
  onRefresh,
  onEdit,
  onDelete,
  onNew,
}: GuardrailListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ConfirmDeleteTarget>(null);
  const [deleting, setDeleting] = useState(false);

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
        <p className="text-sm">Carregando guardrails...</p>
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
        <h2 className="text-lg font-bold text-text-strong">Guardrails</h2>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex min-h-10 items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo Guardrail
        </button>
      </div>

      {/* Empty State */}
      {guardrails.length === 0 && (
        <div className="rounded-card border border-dashed border-border-subtle px-5 py-12 text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-text-weak" aria-hidden="true" />
          <p className="text-sm text-text-weak">Nenhum guardrail cadastrado.</p>
          <p className="mt-1 text-xs text-text-weak">
            Clique em &ldquo;Novo Guardrail&rdquo; para criar regras de segurança.
          </p>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-2">
        {guardrails.map((g) => (
          <div
            key={g.id}
            className="flex items-start justify-between gap-4 rounded-card border border-border-subtle bg-surface-base px-5 py-4 transition-colors hover:border-brand-primary/20"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-text-strong">
                  {g.titulo}
                </h3>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    g.is_global
                      ? "bg-brand-primary/20 text-brand-primary"
                      : "bg-surface-subtle text-text-weak"
                  }`}
                >
                  {g.is_global ? "Global" : "Específico"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-text-weak">
                {g.conteudo.slice(0, 120)}
                {g.conteudo.length > 120 ? "…" : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(g)}
                aria-label={`Editar ${g.titulo}`}
                className="rounded-md p-2 text-text-weak transition-colors hover:bg-surface-subtle hover:text-brand-primary"
              >
                <Edit2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget({ id: g.id, titulo: g.titulo, type: "guardrail" })}
                aria-label={`Excluir ${g.titulo}`}
                className="rounded-md p-2 text-text-weak transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AdminDialog
        open={deleteTarget !== null}
        title="Excluir guardrail?"
        onClose={() => !deleting && setDeleteTarget(null)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-body">
            Tem certeza que deseja excluir o guardrail{" "}
            <strong className="text-text-strong">{deleteTarget?.titulo}</strong>?
          </p>
          <p className="text-sm text-red-400">
            Esta ação não poderá ser desfeita.
          </p>
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
