"use client";

import type { FollowUpQueueEntry } from "@/services/followUpApi.types";
import { formatDate, formatStatus, formatOutcome, getStatusColor, getOutcomeColor, isDraftEditable } from "@/lib/followUpFormatters";

interface FollowUpCardProps {
  entry: FollowUpQueueEntry;
  onEdit: (entry: FollowUpQueueEntry) => void;
  onDiscard: (entry: FollowUpQueueEntry) => void;
  onOptOut: (entry: FollowUpQueueEntry) => void;
}

export function FollowUpCard({ entry, onEdit, onDiscard, onOptOut }: FollowUpCardProps) {
  const isPendente = entry.status === "pendente";
  const editable = isDraftEditable(entry.outcome);

  return (
    <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-1 rounded-pill text-xs font-medium ${getStatusColor(entry.status)}`}>
              {formatStatus(entry.status)}
            </span>
            <span className={`px-2 py-1 rounded-pill text-xs font-medium ${getOutcomeColor(entry.outcome)}`}>
              {formatOutcome(entry.outcome)}
            </span>
          </div>
          <p className="text-sm font-medium text-text-strong">{entry.customer_name || entry.base_thread_id}</p>
          <p className="text-xs text-text-body/70">{entry.tenant_id} · {entry.base_thread_id}</p>
        </div>
        <p className="text-xs text-text-body/60 shrink-0">{formatDate(entry.created_at)}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-text-body mb-1">Resumo</p>
        <p className="text-sm text-text-body/90 line-clamp-2">{entry.summary}</p>
      </div>

      <div className="bg-surface-subtle rounded-card p-3 mb-4">
        <p className="text-sm font-medium text-text-body mb-1">Rascunho</p>
        <p className="text-sm text-text-body/90 line-clamp-3">
          {entry.draft_message || <span className="italic text-text-body/50">Sem rascunho para este outcome</span>}
        </p>
      </div>

      {isPendente && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onEdit(entry)}
            disabled={!editable}
            title={!editable ? 'Rascunho só é editável quando outcome é "pensando" ou "sem_resposta"' : undefined}
            className="flex-1 rounded-card bg-brand-primary px-3 py-2 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Editar / Aprovar
          </button>
          <button
            onClick={() => onDiscard(entry)}
            className="flex-1 rounded-card border border-border-subtle px-3 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={() => onOptOut(entry)}
            className="flex-1 rounded-card bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
          >
            Opt-out
          </button>
        </div>
      )}
    </div>
  );
}
