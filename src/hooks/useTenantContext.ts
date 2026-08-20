// ============================================================================
// useTenantContext — Hook: read-only prompt/guardrail context for a tenant
// ============================================================================

"use client";

import { useCallback, useRef, useState } from "react";
import { fetchTenantPromptDetail } from "@/services/promptManager";
import type { TenantPromptDetail } from "@/services/promptManager.types";

type UseTenantContextReturn = {
  detail: TenantPromptDetail | null;
  loading: boolean;
  error: string | null;
  selectTenant: (tenantId: string) => Promise<void>;
  clear: () => void;
};

export function useTenantContext(): UseTenantContextReturn {
  const [detail, setDetail] = useState<TenantPromptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const selectTenant = useCallback(async (tenantId: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setDetail(null);

    const result = await fetchTenantPromptDetail(tenantId);

    // Discard a response for a tenant that is no longer selected (FR-023).
    if (requestIdRef.current !== requestId) return;

    setLoading(false);

    if (result.ok) {
      setDetail(result.data);
      return;
    }

    setError(result.message);
  }, []);

  const clear = useCallback(() => {
    requestIdRef.current += 1; // invalidate any in-flight request
    setDetail(null);
    setError(null);
    setLoading(false);
  }, []);

  return { detail, loading, error, selectTenant, clear };
}
