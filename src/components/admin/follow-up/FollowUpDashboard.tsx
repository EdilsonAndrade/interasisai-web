"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFollowUpDashboardKPIs } from "@/hooks/useFollowUpDashboardKPIs";
import { KPICard } from "./KPICard";
import { formatDate, formatOutcome, formatStatus, getStatusColor, getOutcomeColor } from "@/lib/followUpFormatters";
import type { SessionOutcome } from "@/services/followUpApi.types";

export function FollowUpDashboard() {
  const [tenantFilter, setTenantFilter] = useState("");
  const { kpis, loading, error, fetchKPIs } = useFollowUpDashboardKPIs();

  useEffect(() => {
    fetchKPIs(tenantFilter.trim() || undefined);
  }, [tenantFilter, fetchKPIs]);

  return (
    <div>
      <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 mb-4 backdrop-blur-xl">
        <label htmlFor="dashboard-tenant-filter" className="block text-sm font-medium text-text-body mb-1">
          Filtrar por Tenant
        </label>
        <input
          id="dashboard-tenant-filter"
          type="text"
          value={tenantFilter}
          onChange={e => setTenantFilter(e.target.value)}
          placeholder="Deixe em branco para ver todos os tenants"
          className="w-full max-w-sm rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong outline-none focus:border-brand-primary"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading && !kpis && (
        <div className="flex items-center justify-center gap-2 p-8 text-text-body">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando dashboard...</span>
        </div>
      )}

      {kpis && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard title="Follow-ups Pendentes" value={kpis.totalPendentes} variant="yellow" />
            <KPICard
              title="Ofertas Expiradas"
              value={kpis.expiredOfferTenants.length}
              variant={kpis.expiredOfferTenants.length > 0 ? "red" : "green"}
              subtitle="tenants com oferta_vigente vencida"
            />
            <KPICard title="Sem Resposta" value={kpis.breakdownByOutcome.sem_resposta} variant="purple" />
            <KPICard title="Fechados" value={kpis.breakdownByOutcome.fechado} variant="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-text-strong mb-3">Breakdown por Outcome</h2>
              <ul className="space-y-2">
                {(Object.entries(kpis.breakdownByOutcome) as [SessionOutcome, number][]).map(([outcome, count]) => (
                  <li key={outcome} className="flex justify-between items-center text-sm">
                    <span className={`px-2 py-0.5 rounded-pill text-xs font-medium ${getOutcomeColor(outcome)}`}>
                      {formatOutcome(outcome)}
                    </span>
                    <span className="font-semibold text-text-strong">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-text-strong mb-3">Tenants com Oferta Expirada</h2>
              {kpis.expiredOfferTenants.length === 0 ? (
                <p className="text-sm text-text-body">Nenhum tenant com oferta expirada</p>
              ) : (
                <ul className="space-y-2">
                  {kpis.expiredOfferTenants.map(tenant => (
                    <li key={tenant.id} className="text-sm text-red-300 bg-red-500/10 rounded-card px-2 py-1">
                      {tenant.name} ({tenant.id}) — venceu em{" "}
                      {tenant.oferta_vigente_validade ? formatDate(tenant.oferta_vigente_validade) : "-"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 backdrop-blur-xl lg:col-span-2">
              <h2 className="text-sm font-semibold text-text-strong mb-3">Últimas Sessões Geradas</h2>
              {kpis.recentSessions.length === 0 ? (
                <p className="text-sm text-text-body">Nenhuma sessão encontrada</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {kpis.recentSessions.map(session => (
                    <li key={session.id} className="py-2 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium text-text-strong">{session.tenant_id}</span>
                        <span className="text-text-body ml-2">{session.customer_name || session.base_thread_id}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded-pill text-xs font-medium ${getStatusColor(session.status)}`}>
                          {formatStatus(session.status)}
                        </span>
                        <span className="text-xs text-text-body/60">{formatDate(session.created_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
