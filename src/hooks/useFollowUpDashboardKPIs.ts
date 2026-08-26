"use client";

import { useState, useCallback } from "react";
import { getFollowUpQueueGlobal, listFollowUpTenants } from "@/services/followUpApi";
import type { FollowUpQueueEntry, SessionOutcome, FollowUpTenantConfig } from "@/services/followUpApi.types";

const RECENT_SESSIONS_LIMIT = 5;

export interface FollowUpDashboardKPIs {
  totalPendentes: number;
  breakdownByOutcome: Record<SessionOutcome, number>;
  expiredOfferTenants: FollowUpTenantConfig[];
  recentSessions: FollowUpQueueEntry[];
}

interface UseFollowUpDashboardKPIsResult {
  kpis: FollowUpDashboardKPIs | null;
  loading: boolean;
  error: string | null;
  fetchKPIs: (tenantId?: string) => Promise<void>;
}

const emptyBreakdown: Record<SessionOutcome, number> = {
  fechado: 0,
  pensando: 0,
  sem_resposta: 0,
  recusado: 0,
  em_andamento: 0,
};

export function useFollowUpDashboardKPIs(): UseFollowUpDashboardKPIsResult {
  const [kpis, setKpis] = useState<FollowUpDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async (tenantId?: string) => {
    setLoading(true);
    setError(null);

    const [queueResult, tenantsResult] = await Promise.all([
      getFollowUpQueueGlobal(tenantId),
      listFollowUpTenants(),
    ]);

    if (!queueResult.ok) {
      setError(queueResult.message);
      setKpis(null);
      setLoading(false);
      return;
    }
    if (!tenantsResult.ok) {
      setError(tenantsResult.message);
      setKpis(null);
      setLoading(false);
      return;
    }

    const entries = queueResult.data.entries;
    const totalPendentes = entries.filter(entry => entry.status === "pendente").length;

    const breakdownByOutcome = { ...emptyBreakdown };
    for (const entry of entries) {
      breakdownByOutcome[entry.outcome] = (breakdownByOutcome[entry.outcome] || 0) + 1;
    }

    const now = new Date();
    const tenants = tenantId ? tenantsResult.data.filter(t => t.id === tenantId) : tenantsResult.data;
    const expiredOfferTenants = tenants.filter(
      t => t.oferta_vigente_validade && new Date(t.oferta_vigente_validade) < now
    );

    const recentSessions = [...entries]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, RECENT_SESSIONS_LIMIT);

    setKpis({ totalPendentes, breakdownByOutcome, expiredOfferTenants, recentSessions });
    setLoading(false);
  }, []);

  return { kpis, loading, error, fetchKPIs };
}
