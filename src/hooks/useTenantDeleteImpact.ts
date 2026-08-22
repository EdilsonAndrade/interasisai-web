// ============================================================================
// useTenantDeleteImpact — Hook: busca o resumo de impacto de excluir um
// tenant (GET /tenants/{id}/delete-impact) antes de qualquer ação destrutiva
// (EDI-46, FR-001, FR-008).
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { fetchTenantDeleteImpact } from "@/services/pythonBackend";
import type { TenantDeleteImpact } from "@/services/pythonBackend.types";

export type TenantDeleteImpactState = "idle" | "loading" | "loaded" | "error";

interface UseTenantDeleteImpactReturn {
  state: TenantDeleteImpactState;
  impact: TenantDeleteImpact | null;
  error: string | null;
  fetchImpact: (tenantId: string) => Promise<void>;
  clear: () => void;
}

export function useTenantDeleteImpact(): UseTenantDeleteImpactReturn {
  const [state, setState] = useState<TenantDeleteImpactState>("idle");
  const [impact, setImpact] = useState<TenantDeleteImpact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = useCallback(async (tenantId: string) => {
    setState("loading");
    setError(null);
    const result = await fetchTenantDeleteImpact(tenantId);
    if (!result.ok) {
      setImpact(null);
      setError(result.message);
      setState("error");
      return;
    }
    setImpact(result.data);
    setState("loaded");
  }, []);

  const clear = useCallback(() => {
    setState("idle");
    setImpact(null);
    setError(null);
  }, []);

  return { state, impact, error, fetchImpact, clear };
}
