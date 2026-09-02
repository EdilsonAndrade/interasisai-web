"use client";

import { useEffect, useId, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import type { KnowledgeBaseItemDetail } from "@/services/pythonBackend.types";

type KnowledgeBaseItemDetailModalProps = {
  open: boolean;
  item: KnowledgeBaseItemDetail | null;
  loading: boolean;
  saving: boolean;
  replacingFile: boolean;
  error: string | null;
  onClose: () => void;
  onSaveContent: (content: string) => void;
  onRequestReplaceFile: (file: File) => void;
  onRequestDelete: () => void;
};

export function KnowledgeBaseItemDetailModal({
  open,
  item,
  loading,
  saving,
  replacingFile,
  error,
  onClose,
  onSaveContent,
  onRequestReplaceFile,
  onRequestDelete,
}: KnowledgeBaseItemDetailModalProps) {
  const fileInputId = useId();
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(item?.content ?? "");
    setValidationError(null);
  }, [item]);

  const title = item ? item.filename ?? "Texto colado" : "Item da base de conhecimento";

  return (
    <AdminDialog open={open} title={title} onClose={onClose} closeDisabled={saving || replacingFile}>
      {loading || !item ? (
        <div className="flex items-center gap-3 text-text-body">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando conteúdo...</span>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor={fileInputId} className="block text-sm font-medium text-text-body">
              Conteúdo completo
            </label>
            <textarea
              id={fileInputId}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setValidationError(null);
              }}
              rows={12}
              disabled={saving}
              className="max-h-96 w-full resize-y overflow-y-auto whitespace-pre-wrap rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {validationError && (
              <p role="alert" className="text-sm text-red-300">
                {validationError}
              </p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                const trimmed = draft.trim();
                if (!trimmed) {
                  setValidationError("O conteúdo não pode ficar vazio.");
                  return;
                }
                onSaveContent(trimmed);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? "Salvando..." : "Salvar conteúdo"}
            </button>
          </div>

          {item.source_type === "file" && (
            <div className="space-y-2 border-t border-border-subtle pt-4">
              <label htmlFor={`${fileInputId}-replace`} className="block text-sm font-medium text-text-body">
                Substituir arquivo deste item
              </label>
              <input
                id={`${fileInputId}-replace`}
                type="file"
                accept=".pdf,.xls,.xlsx,.csv"
                disabled={replacingFile}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onRequestReplaceFile(file);
                }}
                className="block w-full text-sm text-text-body file:mr-4 file:rounded-card file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-text-inverse hover:file:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              />
              {replacingFile && (
                <p className="flex items-center gap-2 text-sm text-text-body">
                  <UploadCloud className="h-4 w-4 animate-pulse" aria-hidden="true" />
                  Substituindo arquivo...
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={onRequestDelete}
              className="inline-flex items-center justify-center gap-2 rounded-card border border-red-600/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-600/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Excluir este item
            </button>
          </div>
        </div>
      )}
    </AdminDialog>
  );
}
