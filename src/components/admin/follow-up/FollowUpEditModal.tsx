"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import type { FollowUpQueueEntry } from "@/services/followUpApi.types";
import { validateOfferText } from "@/lib/followUpOfferValidator";
import { EditDraftSchema } from "@/lib/followUpSchemas";

interface FollowUpEditModalProps {
  entry: FollowUpQueueEntry | null;
  tenantOferta?: string | null;
  onApprove: (newDraft: string) => Promise<void>;
  onDiscard: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function FollowUpEditModal({ entry, tenantOferta, onApprove, onDiscard, onClose, isLoading = false }: FollowUpEditModalProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (entry) {
      setDraft(entry.draft_message || "");
      setError(null);
    }
  }, [entry]);

  if (!entry) return null;

  const handleApprove = async () => {
    setError(null);

    const validation = EditDraftSchema.safeParse({ draftMessage: draft });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Erro de validação");
      return;
    }

    const offerValidation = validateOfferText(draft, tenantOferta);
    if (!offerValidation.isValid) {
      setError(offerValidation.message || "Desconto não autorizado");
      return;
    }

    try {
      await onApprove(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao aprovar");
    }
  };

  const handleDiscard = async () => {
    try {
      await onDiscard();
      setShowDiscardConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao descartar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-base rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-subtle">
        <div className="p-6 border-b border-border-subtle sticky top-0 bg-surface-base">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-strong">Revisar Rascunho</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-text-body hover:text-text-strong disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-text-body mb-2">Resumo da Sessão</p>
            <p className="text-sm text-text-body/90 bg-surface-subtle p-3 rounded-card">{entry.summary}</p>
          </div>

          <div>
            <label htmlFor="draft-textarea" className="block text-sm font-medium text-text-body mb-2">
              Rascunho da Mensagem
            </label>
            <textarea
              id="draft-textarea"
              value={draft}
              onChange={e => {
                setDraft(e.target.value);
                setError(null);
              }}
              className="w-full h-40 px-3 py-2 rounded-card border border-border-subtle bg-surface-subtle text-sm text-text-strong outline-none focus:border-brand-primary"
              placeholder="Edite a mensagem aqui..."
            />
            <p className="text-xs text-text-body/60 mt-1">{draft.length}/1000 caracteres</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-card p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {tenantOferta && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-card p-3">
              <p className="text-xs font-medium text-blue-300 mb-1">Oferta Vigente</p>
              <p className="text-sm text-blue-200">{tenantOferta}</p>
              <p className="text-xs text-blue-300/80 mt-1">Certifique-se de não mencionar promoções não autorizadas</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-base flex gap-3 justify-end sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-card border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => setShowDiscardConfirm(true)}
            disabled={isLoading}
            className="rounded-card border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-50"
          >
            Descartar
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoading ? "Processando..." : "Aprovar"}
          </button>
        </div>
      </div>

      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-surface-base rounded-card p-6 max-w-sm mx-4 border border-border-subtle">
            <h3 className="text-lg font-bold text-text-strong mb-2">Descartar Rascunho?</h3>
            <p className="text-text-body mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                disabled={isLoading}
                className="rounded-card border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDiscard}
                disabled={isLoading}
                className="rounded-card bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Descartar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
