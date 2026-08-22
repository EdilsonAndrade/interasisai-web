// ============================================================================
// useTenantGrid — Hook: lista paginada de todos os tenants (id + nome) para o
// grid inicial da tela de tenants (EDI-46, GET /tenants/list).
// ============================================================================

"use client";

import { useCallback, useRef, useState } from "react";
import { listTenants } from "@/services/pythonBackend";
import type { TenantGridItem } from "@/services/pythonBackend.types";

const PAGE_SIZE = 20;

interface UseTenantGridReturn {
  items: TenantGridItem[];
  total: number;
  offset: number;
  limit: number;
  loading: boolean;
  error: string | null;
  hasPrevious: boolean;
  hasNext: boolean;
  fetchPage: (offset: number) => Promise<void>;
  goToPrevious: () => void;
  goToNext: () => void;
}

export function useTenantGrid(): UseTenantGridReturn {
  const [items, setItems] = useState<TenantGridItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(async (nextOffset: number) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const result = await listTenants({ limit: PAGE_SIZE, offset: nextOffset });

    // Discard a response that is no longer the latest page request.
    if (requestIdRef.current !== requestId) return;
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    setItems(result.items);
    setTotal(result.total);
    setOffset(nextOffset);
  }, []);

  const hasPrevious = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  const goToPrevious = useCallback(() => {
    if (offset <= 0) return;
    fetchPage(Math.max(0, offset - PAGE_SIZE));
  }, [offset, fetchPage]);

  const goToNext = useCallback(() => {
    if (offset + PAGE_SIZE >= total) return;
    fetchPage(offset + PAGE_SIZE);
  }, [offset, total, fetchPage]);

  return {
    items,
    total,
    offset,
    limit: PAGE_SIZE,
    loading,
    error,
    hasPrevious,
    hasNext,
    fetchPage,
    goToPrevious,
    goToNext,
  };
}
