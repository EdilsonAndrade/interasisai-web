"use client";

import { AlertCircle, CalendarDays, CalendarOff, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { TenantGridItem } from "@/services/pythonBackend.types";

type TenantGridProps = {
  items: TenantGridItem[];
  total: number;
  offset: number;
  limit: number;
  loading: boolean;
  error: string | null;
  hasPrevious: boolean;
  hasNext: boolean;
  onSelect: (tenantId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function TenantGrid({
  items,
  total,
  offset,
  limit,
  loading,
  error,
  hasPrevious,
  hasNext,
  onSelect,
  onPrevious,
  onNext,
}: TenantGridProps) {
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + limit, total);

  return (
    <section aria-labelledby="tenant-grid-heading" className="space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-5 backdrop-blur-xl sm:p-7">
      <h2 id="tenant-grid-heading" className="text-lg font-bold text-text-strong">Todos os tenants</h2>

      {loading && (
        <div className="flex items-center gap-3 py-6 text-text-body">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando tenants...</span>
        </div>
      )}

      {!loading && error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {!loading && !error && total === 0 && (
        <p className="text-sm text-text-body">Nenhum tenant cadastrado.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs font-semibold uppercase text-text-body/60">
                <th scope="col" className="p-0 pb-2">ID</th>
                <th scope="col" className="p-0 pb-2">Nome</th>
                <th scope="col" className="p-0 pb-2">Agendamento</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border-subtle last:border-0">
                  <td colSpan={3} className="p-0">
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className="flex w-full items-center gap-4 px-2 py-3 text-left transition-colors hover:bg-surface-subtle"
                    >
                      <span className="w-1/3 shrink-0 break-all text-text-body">{item.id}</span>
                      <span className="min-w-0 flex-1 break-words font-semibold text-text-strong">{item.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-text-body" title={item.scheduling_enabled ? "Agendamento habilitado" : "Agendamento desabilitado"}>
                        {item.scheduling_enabled ? (
                          <CalendarDays className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                        ) : (
                          <CalendarOff className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        )}
                        <span className="sr-only">{item.scheduling_enabled ? "Agendamento habilitado" : "Agendamento desabilitado"}</span>
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-text-body/60">
              {rangeStart}–{rangeEnd} de {total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasPrevious}
                onClick={onPrevious}
                className="inline-flex items-center gap-1.5 rounded-card border border-border-subtle px-3 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Anterior
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={onNext}
                className="inline-flex items-center gap-1.5 rounded-card border border-border-subtle px-3 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-40"
              >
                Próxima <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
