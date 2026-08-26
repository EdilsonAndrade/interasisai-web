"use client";

import { useState } from "react";
import type { FollowUpStatus, SessionOutcome } from "@/services/followUpApi.types";

interface FollowUpFilterBarProps {
  onFilterChange: (status?: FollowUpStatus, outcome?: SessionOutcome) => void;
  currentStatus?: FollowUpStatus;
  currentOutcome?: SessionOutcome;
}

const statuses: FollowUpStatus[] = ["pendente", "aprovado", "descartado", "enviado", "opt_out"];
const outcomes: SessionOutcome[] = ["fechado", "pensando", "sem_resposta", "recusado", "em_andamento"];

const selectClass =
  "w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong outline-none focus:border-brand-primary";

export function FollowUpFilterBar({ onFilterChange, currentStatus, currentOutcome }: FollowUpFilterBarProps) {
  const [status, setStatus] = useState<FollowUpStatus | "">(currentStatus || "");
  const [outcome, setOutcome] = useState<SessionOutcome | "">(currentOutcome || "");

  const handleApply = () => {
    onFilterChange(status || undefined, outcome || undefined);
  };

  const handleReset = () => {
    setStatus("");
    setOutcome("");
    onFilterChange(undefined, undefined);
  };

  return (
    <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 mb-4 backdrop-blur-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium text-text-body mb-1">
            Status
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={e => setStatus(e.target.value as FollowUpStatus | "")}
            className={selectClass}
          >
            <option value="">Todos</option>
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-outcome" className="block text-sm font-medium text-text-body mb-1">
            Outcome
          </label>
          <select
            id="filter-outcome"
            value={outcome}
            onChange={e => setOutcome(e.target.value as SessionOutcome | "")}
            className={selectClass}
          >
            <option value="">Todos</option>
            {outcomes.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover transition-colors"
          >
            Filtrar
          </button>
          <button
            onClick={handleReset}
            className="rounded-card border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-body hover:bg-surface-subtle transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
