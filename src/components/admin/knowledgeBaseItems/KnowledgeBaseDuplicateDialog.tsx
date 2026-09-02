"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import type {
  KnowledgeBaseDuplicateResolution,
  KnowledgeBaseUploadConflict,
} from "@/services/pythonBackend.types";

type DuplicateAction = KnowledgeBaseDuplicateResolution["action"];

type KnowledgeBaseDuplicateDialogProps = {
  open: boolean;
  conflicts: KnowledgeBaseUploadConflict[];
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (resolutions: KnowledgeBaseDuplicateResolution[]) => void;
};

/**
 * Opens when the backend responds 409 to an "adicionar" upload because one or
 * more filenames already exist (FR-005/FR-006). The admin must explicitly
 * choose, per file, to replace the existing item or keep both — the API
 * never overwrites/duplicates silently.
 */
export function KnowledgeBaseDuplicateDialog({
  open,
  conflicts,
  isLoading,
  onCancel,
  onSubmit,
}: KnowledgeBaseDuplicateDialogProps) {
  const [choices, setChoices] = useState<Record<string, DuplicateAction>>({});

  const handleSubmit = () => {
    const resolutions: KnowledgeBaseDuplicateResolution[] = conflicts.map((conflict) => ({
      filename: conflict.filename,
      action: choices[conflict.filename] ?? "keep_both",
      existing_item_id: conflict.existing_item_id,
    }));
    onSubmit(resolutions);
  };

  return (
    <AdminDialog
      open={open}
      title="Arquivos já existentes na base de conhecimento"
      onClose={onCancel}
      closeDisabled={isLoading}
    >
      <div className="space-y-5">
        <p className="text-sm text-text-body">
          Os arquivos abaixo já existem nesta ingestão. Escolha, para cada um, se deseja
          substituir o item existente ou manter ambos.
        </p>
        <ul className="space-y-3">
          {conflicts.map((conflict) => {
            const groupName = `duplicate-${conflict.filename}`;
            const current = choices[conflict.filename] ?? "keep_both";
            return (
              <li
                key={conflict.filename}
                className="space-y-2 rounded-card border border-border-subtle p-3"
              >
                <p className="break-words font-semibold text-text-strong">{conflict.filename}</p>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={groupName}
                      checked={current === "replace"}
                      disabled={isLoading}
                      onChange={() =>
                        setChoices((prev) => ({ ...prev, [conflict.filename]: "replace" }))
                      }
                    />
                    Substituir
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={groupName}
                      checked={current === "keep_both"}
                      disabled={isLoading}
                      onChange={() =>
                        setChoices((prev) => ({ ...prev, [conflict.filename]: "keep_both" }))
                      }
                    />
                    Manter ambos
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
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
            disabled={isLoading}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoading ? "Enviando..." : "Confirmar"}
          </button>
        </footer>
      </div>
    </AdminDialog>
  );
}
