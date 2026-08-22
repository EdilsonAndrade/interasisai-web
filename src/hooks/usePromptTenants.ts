// ============================================================================
// usePromptTenants — Hook: tenants já vinculados a um prompt (US3).
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { fetchPromptTenants } from "@/services/promptManager";
import type { PromptTenant } from "@/services/promptManager.types";

type UsePromptTenantsReturn = {
  tenants: PromptTenant[];
  loading: boolean;
  error: string | null;
  fetchTenants: (promptId: string) => Promise<void>;
};

export function usePromptTenants(): UsePromptTenantsReturn {
  const [tenants, setTenants] = useState<PromptTenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async (promptId: string) => {
    setLoading(true);
    setError(null);
    const result = await fetchPromptTenants(promptId);
    setLoading(false);
    if (!result.ok) {
      setTenants([]);
      setError(result.message);
      return;
    }
    setTenants(result.data.tenants);
  }, []);

  return { tenants, loading, error, fetchTenants };
}
