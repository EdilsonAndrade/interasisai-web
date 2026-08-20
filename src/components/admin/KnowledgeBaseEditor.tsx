"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { KnowledgeBaseDeleteDialog } from "@/components/admin/KnowledgeBaseDeleteDialog";

const MAX_LENGTH = 100_000;

type KnowledgeBaseEditorProps = {
  tenantId: string;
};

export function KnowledgeBaseEditor({ tenantId }: KnowledgeBaseEditorProps) {
  const { content, loading, saving, deleting, error, fieldErrors, save, remove } =
    useKnowledgeBase(tenantId);
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Sync the editable draft whenever the loaded content for this tenant changes.
  useEffect(() => {
    setDraft(content ?? "");
    setValidationError(null);
  }, [tenantId, content]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed) {
      setValidationError("O conteúdo da base de conhecimento é obrigatório.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setValidationError(
        `O texto excede o limite máximo de ${MAX_LENGTH.toLocaleString()} caracteres.`,
      );
      return;
    }
    setValidationError(null);

    const ok = await save(trimmed);
    if (ok) {
      toast.success(
        "Base de conhecimento salva com sucesso. A atualização do comportamento da IA pode levar alguns minutos.",
      );
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDeleteConfirm = async () => {
    const ok = await remove();
    if (ok) {
      setDeleteDialogOpen(false);
      toast.success("Base de conhecimento excluída com sucesso");
    }
    // On failure the dialog stays open and `error` (toasted above) explains why.
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-base/60 p-4 text-text-body">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Carregando base de conhecimento...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="space-y-2">
        <label htmlFor="knowledge-base-content" className="block text-sm font-medium text-text-body">
          Base de Conhecimento
        </label>
        {content === null && !draft && (
          <p className="text-sm text-text-body/70">
            Nenhuma base de conhecimento cadastrada para este tenant.
          </p>
        )}
        <textarea
          id="knowledge-base-content"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setValidationError(null);
          }}
          placeholder="Cole aqui o texto institucional do cliente, regras de negócio, horários de funcionamento, preços, etc..."
          rows={10}
          maxLength={MAX_LENGTH}
          disabled={saving}
          className="w-full resize-y rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-right text-xs text-text-body/60">
          {draft.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} caracteres
        </p>
        {(validationError || fieldErrors?.content) && (
          <p role="alert" className="text-sm text-red-300">
            {validationError ?? fieldErrors?.content}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-card bg-brand-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar Base de Conhecimento"
          )}
        </button>

        {content !== null && (
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-card border border-red-400/50 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Excluir
          </button>
        )}
      </div>

      <KnowledgeBaseDeleteDialog
        open={deleteDialogOpen}
        tenantId={tenantId}
        isLoading={deleting}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </form>
  );
}
