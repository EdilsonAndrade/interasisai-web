// ============================================================================
// useTenantSearch — Hook: tenant search by term (name or id)
// ============================================================================

"use client";

import { useCallback, useRef, useState } from "react";
import { searchTenants } from "@/services/pythonBackend";
import type { TenantSearchItem } from "@/services/pythonBackend.types";
import { tenantSearchSchema } from "@/lib/tenantSchemas";

type UseTenantSearchReturn = {
  results: TenantSearchItem[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
  search: (term: string) => Promise<void>;
};

export function useTenantSearch(): UseTenantSearchReturn {
  const [results, setResults] = useState<TenantSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const requestIdRef = useRef(0);

  const search = useCallback(async (term: string) => {
    const parsed = tenantSearchSchema.safeParse({ term });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Informe um termo de busca.");
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const result = await searchTenants(parsed.data.term);

    // Discard a response that is no longer the latest search (FR-023).
    if (requestIdRef.current !== requestId) return;

    setLoading(false);
    setSearched(true);

    if (result.ok) {
      setResults(result.tenants);
      return;
    }

    setResults([]);
    setError(result.message);
  }, []);

  return {
    results,
    loading,
    error,
    notFound: searched && !loading && !error && results.length === 0,
    search,
  };
}
