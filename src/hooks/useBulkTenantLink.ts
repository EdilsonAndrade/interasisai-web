// ============================================================================
// useBulkTenantLink — Hook: seleção de tenants, diff contra os já vinculados
// e gravação em massa (US3, FR-025..FR-030, R-005).
// ============================================================================

"use client";

import { useCallback, useMemo, useState } from "react";
import { searchTenants } from "@/services/pythonBackend";
import { linkTenantsBulk } from "@/services/promptManager";
import { usePromptTenants } from "@/hooks/usePromptTenants";
import { bulkTenantLinkSchema } from "@/lib/promptManagerSchemas";
import type { Blocker } from "@/lib/apiError";
import type { PromptTenant } from "@/services/promptManager.types";
import type { TenantSearchItem } from "@/services/pythonBackend.types";

export type BulkLinkDiff = {
  unchanged: PromptTenant[]; // selecionados que já usam o prompt
  changing: PromptTenant[]; // selecionados que terão o vínculo substituído
};

type UseBulkTenantLinkReturn = {
  alreadyLinked: PromptTenant[];
  loadingAlreadyLinked: boolean;
  loadAlreadyLinked: (promptId: string) => Promise<void>;
  searchResults: TenantSearchItem[];
  searching: boolean;
  searchError: string | null;
  search: (term: string) => Promise<void>;
  selected: PromptTenant[];
  toggleTenant: (tenant: PromptTenant) => void;
  removeTenant: (tenantId: string) => void;
  diff: BulkLinkDiff;
  submitting: boolean;
  submitError: string | null;
  blockers: Blocker[];
  linkedCount: number | null;
  confirm: (promptId: string) => Promise<boolean>;
  reset: () => void;
};

export function useBulkTenantLink(): UseBulkTenantLinkReturn {
  const promptTenants = usePromptTenants();

  const [searchResults, setSearchResults] = useState<TenantSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<PromptTenant[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [linkedCount, setLinkedCount] = useState<number | null>(null);

  const search = useCallback(async (term: string) => {
    setSearching(true);
    setSearchError(null);
    const result = await searchTenants(term);
    setSearching(false);
    if (!result.ok) {
      setSearchResults([]);
      setSearchError(result.message);
      return;
    }
    setSearchResults(result.tenants);
  }, []);

  const toggleTenant = useCallback((tenant: PromptTenant) => {
    setSelected((prev) =>
      prev.some((t) => t.id === tenant.id)
        ? prev.filter((t) => t.id !== tenant.id)
        : [...prev, tenant],
    );
  }, []);

  const removeTenant = useCallback((tenantId: string) => {
    setSelected((prev) => prev.filter((t) => t.id !== tenantId));
  }, []);

  const diff = useMemo<BulkLinkDiff>(() => {
    const linkedIds = new Set(promptTenants.tenants.map((t) => t.id));
    return {
      unchanged: selected.filter((t) => linkedIds.has(t.id)),
      changing: selected.filter((t) => !linkedIds.has(t.id)),
    };
  }, [selected, promptTenants.tenants]);

  const confirm = useCallback(
    async (promptId: string): Promise<boolean> => {
      const parsed = bulkTenantLinkSchema.safeParse({
        prompt_id: promptId,
        tenant_ids: selected.map((t) => t.id),
      });
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0]?.message ?? "Selecione ao menos um tenant.");
        return false;
      }

      setSubmitting(true);
      setSubmitError(null);
      setBlockers([]);
      // R-005: em caso de TENANT_NOT_FOUND, o backend não aplica nada — o
      // hook só repassa `message`/`blockers`, sem estado local otimista.
      const result = await linkTenantsBulk(parsed.data);
      setSubmitting(false);

      if (!result.ok) {
        setSubmitError(result.message);
        setBlockers(result.blockers);
        return false;
      }

      setLinkedCount(result.data.linked_count);
      return true;
    },
    [selected],
  );

  const reset = useCallback(() => {
    setSelected([]);
    setSearchResults([]);
    setSearchError(null);
    setSubmitError(null);
    setBlockers([]);
    setLinkedCount(null);
  }, []);

  return {
    alreadyLinked: promptTenants.tenants,
    loadingAlreadyLinked: promptTenants.loading,
    loadAlreadyLinked: promptTenants.fetchTenants,
    searchResults,
    searching,
    searchError,
    search,
    selected,
    toggleTenant,
    removeTenant,
    diff,
    submitting,
    submitError,
    blockers,
    linkedCount,
    confirm,
    reset,
  };
}
