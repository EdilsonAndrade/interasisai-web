// ============================================================================
// useTenantUsage — Hook: busca o consumo mensal de um tenant
// (GET /tenants/{id}/usage) para o indicador visual da tela de detalhes (EDI-63).
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTenantUsage } from "@/services/pythonBackend";
import type { TenantUsage } from "@/services/pythonBackend.types";

type UseTenantUsageReturn = {
  usage: TenantUsage | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTenantUsage(tenantId: string | null): UseTenantUsageReturn {
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchUsage = useCallback(async () => {
    if (!tenantId) {
      setUsage(null);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const result = await getTenantUsage(tenantId);
    if (requestIdRef.current !== requestId) return; // stale — tenant changed

    setLoading(false);
    if (result.ok) {
      setUsage(result.data);
      return;
    }
    setUsage(null);
    setError(result.message);
  }, [tenantId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, loading, error, refetch: fetchUsage };
}
