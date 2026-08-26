"use client";

import { AlertTriangle, Gauge } from "lucide-react";
import type { TenantUsage } from "@/services/pythonBackend.types";

type TenantUsageIndicatorProps = {
  usage: TenantUsage | null;
  loading: boolean;
  error: string | null;
};

function colorClassesFor(percentage: number): { text: string; bar: string } {
  if (percentage >= 80) return { text: "text-red-300", bar: "bg-red-400" };
  if (percentage >= 50) return { text: "text-amber-300", bar: "bg-amber-400" };
  return { text: "text-emerald-300", bar: "bg-emerald-400" };
}

export function TenantUsageIndicator({ usage, loading, error }: TenantUsageIndicatorProps) {
  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Carregando consumo do mês"
        className="h-16 animate-pulse rounded-card border border-border-subtle bg-surface-subtle"
      />
    );
  }

  if (error || !usage) {
    return (
      <div className="flex items-center gap-2 rounded-card border border-border-subtle bg-surface-subtle p-4 text-sm text-text-weak">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span title={error ?? undefined}>Consumo do mês indisponível no momento.</span>
      </div>
    );
  }

  if (usage.monthly_message_limit === null || usage.percentage_used === null) {
    return (
      <div className="flex items-center gap-2 rounded-card border border-border-subtle bg-surface-subtle p-4 text-sm text-text-body">
        <Gauge className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Sem limite configurado ({usage.current_month_calls} chamadas de LLM neste mês)
        </span>
      </div>
    );
  }

  const percentage = Math.min(100, Math.max(0, usage.percentage_used));
  const { text, bar } = colorClassesFor(percentage);

  return (
    <div className="space-y-2 rounded-card border border-border-subtle bg-surface-subtle p-4">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className={text}>
          {usage.current_month_calls} / {usage.monthly_message_limit} mensagens (
          {percentage.toFixed(0)}%)
        </span>
        {usage.blocked && <span className={`text-xs uppercase ${text}`}>Bloqueado</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Consumo do mês"
        className="h-2 w-full overflow-hidden rounded-full bg-surface-base"
      >
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
