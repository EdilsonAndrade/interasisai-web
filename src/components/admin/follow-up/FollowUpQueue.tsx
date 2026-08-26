"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { FollowUpQueueEntry, FollowUpStatus, SessionOutcome } from "@/services/followUpApi.types";
import { useFollowUpQueue } from "@/hooks/useFollowUpQueue";
import { useFollowUpTenantConfig } from "@/hooks/useFollowUpTenantConfig";
import { updateFollowUpQueueEntry } from "@/services/followUpApi";
import { FollowUpCard } from "./FollowUpCard";
import { FollowUpFilterBar } from "./FollowUpFilterBar";
import { FollowUpEditModal } from "./FollowUpEditModal";

// Sessão administrativa é única e compartilhada (cookie assinado) — sem
// identidade de usuário individual ainda, então usamos um marcador fixo.
const APPROVED_BY = "admin";

interface FollowUpQueueProps {
  tenantId: string;
}

export function FollowUpQueue({ tenantId }: FollowUpQueueProps) {
  const { config: tenantConfig, fetchConfig } = useFollowUpTenantConfig();
  const { data, loading, error, fetchQueue, refetch } = useFollowUpQueue();
  const [selectedEntry, setSelectedEntry] = useState<FollowUpQueueEntry | null>(null);
  const [currentStatus, setCurrentStatus] = useState<FollowUpStatus | undefined>();
  const [currentOutcome, setCurrentOutcome] = useState<SessionOutcome | undefined>();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue(tenantId, currentStatus, currentOutcome);
  }, [tenantId, currentStatus, currentOutcome, fetchQueue]);

  useEffect(() => {
    if (tenantId) fetchConfig(tenantId);
  }, [tenantId, fetchConfig]);

  const handleFilterChange = (status?: FollowUpStatus, outcome?: SessionOutcome) => {
    setCurrentStatus(status);
    setCurrentOutcome(outcome);
  };

  const handleEdit = (entry: FollowUpQueueEntry) => setSelectedEntry(entry);

  const handleApprove = async (newDraft: string) => {
    if (!selectedEntry) return;

    setActionLoading(true);
    setActionError(null);

    const result = await updateFollowUpQueueEntry(tenantId, selectedEntry.id, {
      status: "aprovado",
      draft_message: newDraft,
      approved_by: APPROVED_BY,
    });

    if (result.ok) {
      setSelectedEntry(null);
      await refetch();
    } else {
      setActionError(result.message);
    }
    setActionLoading(false);
  };

  const handleDiscard = async (entry?: FollowUpQueueEntry) => {
    const target = entry || selectedEntry;
    if (!target) return;

    setActionLoading(true);
    setActionError(null);

    const result = await updateFollowUpQueueEntry(tenantId, target.id, { status: "descartado" });

    if (result.ok) {
      setSelectedEntry(null);
      await refetch();
    } else {
      setActionError(result.message);
    }
    setActionLoading(false);
  };

  const handleOptOut = async (entry: FollowUpQueueEntry) => {
    setActionLoading(true);
    setActionError(null);

    const result = await updateFollowUpQueueEntry(tenantId, entry.id, { status: "opt_out" });

    if (result.ok) {
      await refetch();
    } else {
      setActionError(result.message);
    }
    setActionLoading(false);
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-text-body">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Carregando fila de follow-up...</span>
      </div>
    );
  }

  return (
    <div>
      <FollowUpFilterBar onFilterChange={handleFilterChange} currentStatus={currentStatus} currentOutcome={currentOutcome} />

      {actionError && (
        <div className="mb-4 p-4 rounded-card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{actionError}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-card bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-300">{error}</p>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-body">Nenhum follow-up encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4 mb-4">
          {data.map(entry => (
            <FollowUpCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDiscard={() => handleDiscard(entry)}
              onOptOut={() => handleOptOut(entry)}
            />
          ))}
        </div>
      )}

      <FollowUpEditModal
        entry={selectedEntry}
        tenantOferta={tenantConfig?.oferta_vigente_texto}
        onApprove={handleApprove}
        onDiscard={() => handleDiscard()}
        onClose={() => setSelectedEntry(null)}
        isLoading={actionLoading}
      />
    </div>
  );
}
