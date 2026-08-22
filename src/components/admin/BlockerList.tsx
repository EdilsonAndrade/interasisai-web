"use client";

import type { Blocker } from "@/lib/apiError";

type BlockerListProps = {
  blockers: Blocker[];
  onResolve?: (blocker: Blocker) => void;
  resolveLabel?: string;
};

/**
 * Lista reutilizável de bloqueadores (Blocker[]) — mesmo contrato de dados
 * usado por PROMPT_IN_USE_BY_TENANTS, GUARDRAIL_IN_USE_BY_TENANTS,
 * TENANT_NOT_FOUND e o preview de tenants vinculados a um prompt (FR-038).
 */
export function BlockerList({ blockers, onResolve, resolveLabel = "Resolver" }: BlockerListProps) {
  if (blockers.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {blockers.map((blocker) => (
        <li
          key={`${blocker.type}-${blocker.id}`}
          className="flex items-center justify-between gap-3 rounded-card border border-border-subtle bg-surface-subtle px-3 py-2 text-sm"
        >
          <span className="min-w-0 truncate text-text-body">
            {blocker.name ?? blocker.id}
            {typeof blocker.tenant_count === "number" && (
              <span className="ml-1.5 text-xs text-text-weak">
                ({blocker.tenant_count} tenant{blocker.tenant_count === 1 ? "" : "s"})
              </span>
            )}
          </span>
          {onResolve && (
            <button
              type="button"
              onClick={() => onResolve(blocker)}
              className="shrink-0 text-xs font-semibold text-brand-primary hover:underline"
            >
              {resolveLabel}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
