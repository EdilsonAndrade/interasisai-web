"use client";

import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { GuardrailScopeBadge } from "@/components/admin/GuardrailScopeBadge";
import type { TenantDeleteImpactState } from "@/hooks/useTenantDeleteImpact";
import type {
  TenantDeleteImpact,
  TenantDeleteImpactGuardrailItem,
  TenantDeleteImpactPromptItem,
} from "@/services/pythonBackend.types";
import type { NodeType } from "@/services/promptManager.types";

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  operational: "Operacional",
  institutional: "Institucional",
  chitchat: "Chitchat",
};

function NodeTypeTag({ nodeType }: { nodeType?: NodeType }) {
  if (!nodeType) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase text-text-body/70">
      {NODE_TYPE_LABELS[nodeType]}
    </span>
  );
}

type TenantDeleteDialogProps = {
  open: boolean;
  tenantName: string;
  isLoading: boolean;
  impactState: TenantDeleteImpactState;
  impact: TenantDeleteImpact | null;
  impactError: string | null;
  deleteError: string | null;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  onRetryImpact: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function PromptItemsList({ items }: { items: TenantDeleteImpactPromptItem[] }) {
  return (
    <ul className="list-disc space-y-0.5 pl-5 text-sm text-text-body">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <span>{item.titulo}</span>
          <NodeTypeTag nodeType={item.node_type} />
        </li>
      ))}
    </ul>
  );
}

function GuardrailItemsList({ items }: { items: TenantDeleteImpactGuardrailItem[] }) {
  return (
    <ul className="list-disc space-y-0.5 pl-5 text-sm text-text-body">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <span>{item.titulo}</span>
          <GuardrailScopeBadge isGlobal={item.is_global === true} />
        </li>
      ))}
    </ul>
  );
}

function ImpactGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase text-text-body/60">{title}</p>
      {children}
    </div>
  );
}

export function TenantDeleteDialog({
  open,
  tenantName,
  isLoading,
  impactState,
  impact,
  impactError,
  deleteError,
  confirmText,
  onConfirmTextChange,
  onRetryImpact,
  onCancel,
  onConfirm,
}: TenantDeleteDialogProps) {
  const nameMatches = confirmText.trim() === tenantName;
  const canConfirm = impactState === "loaded" && nameMatches && !isLoading;

  const hasAnyImpact =
    impact !== null &&
    (impact.prompts_to_delete.length > 0 ||
      impact.prompts_to_unlink_only.length > 0 ||
      impact.guardrails_to_delete.length > 0 ||
      impact.guardrails_to_unlink_only.length > 0);

  return (
    <AdminDialog
      open={open}
      title={`Confirmar exclusão de ${tenantName}`}
      onClose={onCancel}
      closeDisabled={isLoading}
    >
      <div className="space-y-5">
        <p className="text-sm text-text-body">Esta ação não poderá ser desfeita.</p>

        {impactState === "loading" && (
          <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-base/60 p-4 text-text-body">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-sm">Carregando resumo de impacto...</span>
          </div>
        )}

        {impactState === "error" && (
          <div className="space-y-3">
            <p role="alert" className="flex items-start gap-2 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {impactError}
            </p>
            <button
              type="button"
              onClick={onRetryImpact}
              className="rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {impactState === "loaded" && impact && (
          <div className="space-y-4 rounded-card border border-border-subtle bg-surface-base/60 p-4">
            {!hasAnyImpact && (
              <p className="text-sm text-text-body">
                Nada será excluído nem desvinculado — este tenant não tem prompts ou guardrails associados.
              </p>
            )}
            {impact.prompts_to_delete.length > 0 && (
              <ImpactGroup title={`${impact.prompts_to_delete.length} prompt(s) serão deletados`}>
                <PromptItemsList items={impact.prompts_to_delete} />
              </ImpactGroup>
            )}
            {impact.prompts_to_unlink_only.length > 0 && (
              <ImpactGroup title={`${impact.prompts_to_unlink_only.length} prompt(s) serão apenas desvinculados`}>
                <PromptItemsList items={impact.prompts_to_unlink_only} />
              </ImpactGroup>
            )}
            {impact.guardrails_to_delete.length > 0 && (
              <ImpactGroup title={`${impact.guardrails_to_delete.length} guardrail(s) serão deletados`}>
                <GuardrailItemsList items={impact.guardrails_to_delete} />
              </ImpactGroup>
            )}
            {impact.guardrails_to_unlink_only.length > 0 && (
              <ImpactGroup title={`${impact.guardrails_to_unlink_only.length} guardrail(s) serão apenas desvinculados`}>
                <GuardrailItemsList items={impact.guardrails_to_unlink_only} />
              </ImpactGroup>
            )}
          </div>
        )}

        {impactState === "loaded" && (
          <div className="space-y-2">
            <label htmlFor="tenant-delete-confirm-name" className="text-sm font-medium text-text-body">
              Digite o nome do tenant para confirmar
            </label>
            <input
              id="tenant-delete-confirm-name"
              type="text"
              value={confirmText}
              disabled={isLoading}
              onChange={(event) => onConfirmTextChange(event.target.value)}
              className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
            />
          </div>
        )}

        {deleteError && (
          <p role="alert" className="text-sm text-red-300">
            {deleteError}
          </p>
        )}

        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-card border border-border-subtle px-4 py-3 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-card bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
            {isLoading ? "Excluindo" : "Confirmar"}
          </button>
        </footer>
      </div>
    </AdminDialog>
  );
}
