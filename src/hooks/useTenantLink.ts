// ============================================================================
// useTenantLink — Hook: tenant-prompt link management
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fetchTenantPromptDetail, linkTenantToPrompt } from "@/services/promptManager";
import type { NodeType, TenantLinkInput, TenantPromptDetail } from "@/services/promptManager.types";

interface UseTenantLinkReturn {
  submitting: boolean;
  fetchingDetail: boolean;
  detailError: string | null;
  tenantNotFound: boolean;
  tenantDetail: TenantPromptDetail | null;
  linkTenant: (input: TenantLinkInput, nodeType: NodeType) => Promise<boolean>;
  fetchDetail: (tenantId: string, nodeType: NodeType) => Promise<void>;
  clearDetail: () => void;
}

export function useTenantLink(): UseTenantLinkReturn {
  const [submitting, setSubmitting] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [tenantNotFound, setTenantNotFound] = useState(false);
  const [tenantDetail, setTenantDetail] = useState<TenantPromptDetail | null>(null);

  const fetchDetail = useCallback(async (tenantId: string, nodeType: NodeType) => {
    setFetchingDetail(true);
    setTenantDetail(null);
    setDetailError(null);
    setTenantNotFound(false);

    const result = await fetchTenantPromptDetail(tenantId, nodeType);
    setFetchingDetail(false);

    if (result.ok) {
      setTenantDetail(result.data);
      return;
    }

    // 404 here means "este tenant ainda não tem prompt vinculado" — um estado
    // esperado, não um erro que deva impedir o restante do formulário de
    // funcionar (o usuário pode seguir e criar o primeiro vínculo).
    if (result.status === 404) {
      setTenantNotFound(true);
      return;
    }

    setDetailError(result.message);
    toast.error(result.message);
  }, []);

  const linkTenant = useCallback(
    async (input: TenantLinkInput, nodeType: NodeType): Promise<boolean> => {
      setSubmitting(true);
      const result = await linkTenantToPrompt(input);
      setSubmitting(false);

      if (result.ok) {
        toast.success("Vínculo criado com sucesso");
        // Atualiza o card "Vínculo Atual" com o resultado recém-criado, sem
        // exigir que o usuário busque o tenant novamente.
        await fetchDetail(input.tenant_id, nodeType);
        return true;
      }
      toast.error(result.message);
      return false;
    },
    [fetchDetail],
  );

  const clearDetail = useCallback(() => {
    setTenantDetail(null);
    setDetailError(null);
    setTenantNotFound(false);
  }, []);

  return {
    submitting,
    fetchingDetail,
    detailError,
    tenantNotFound,
    tenantDetail,
    linkTenant,
    fetchDetail,
    clearDetail,
  };
}
