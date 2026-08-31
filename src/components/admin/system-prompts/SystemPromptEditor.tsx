// ============================================================================
// SystemPromptEditor — Edição e reversão do conteúdo vigente de um prompt
// ============================================================================

"use client";

import { History, Loader2, Save } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import type { SystemPromptEditorProps } from "./types";

export function SystemPromptEditor({
  prompt,
  saving,
  rollingBack,
  onSave,
  onRollback,
}: SystemPromptEditorProps) {
  const [draft, setDraft] = useState(prompt.current_version);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmRollback, setConfirmRollback] = useState(false);
  const textareaId = useId();

  useEffect(() => {
    setDraft(prompt.current_version);
    setValidationError(null);
  }, [prompt.prompt_key, prompt.current_version]);

  const busy = saving || rollingBack;

  const handleSave = async () => {
    if (!draft.trim()) {
      setValidationError("O conteúdo é obrigatório.");
      return;
    }
    setValidationError(null);
    await onSave(draft);
  };

  const handleConfirmRollback = async () => {
    const ok = await onRollback();
    if (ok) setConfirmRollback(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-strong">{prompt.titulo}</h2>
        <button
          type="button"
          onClick={() => setConfirmRollback(true)}
          disabled={busy}
          className="inline-flex min-h-10 items-center gap-2 rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle disabled:opacity-50"
        >
          {rollingBack ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <History className="h-4 w-4" aria-hidden="true" />
          )}
          Reverter para versão anterior
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-semibold text-text-body">
          Conteúdo vigente
        </label>
        <textarea
          id={textareaId}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={busy}
          rows={16}
          className="w-full resize-y rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 font-mono text-sm text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-50"
        />
        {validationError && (
          <p role="alert" className="text-sm text-red-400">
            {validationError}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="inline-flex min-h-10 items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Salvar
        </button>
      </div>

      <AdminDialog
        open={confirmRollback}
        title="Reverter para versão anterior?"
        onClose={() => setConfirmRollback(false)}
        closeDisabled={rollingBack}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-body">
            O conteúdo vigente de <strong className="text-text-strong">{prompt.titulo}</strong>{" "}
            será substituído pela versão anterior. Essa ação pode ser desfeita revertendo
            novamente.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmRollback(false)}
              disabled={rollingBack}
              className="inline-flex min-h-10 items-center rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmRollback}
              disabled={rollingBack}
              className="inline-flex min-h-10 items-center gap-2 rounded-card bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {rollingBack && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Reverter
            </button>
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}
