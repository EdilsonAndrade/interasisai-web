// ============================================================================
// useTenantPromptBinding — Hook: estado de vínculo de prompt do tenant (nó
// operacional) e correção in-place (US2, FR-012/FR-014/FR-017/FR-018).
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { fetchTenantPromptDetail, linkTenantToPrompt } from "@/services/promptManager";
import { isPromptBindingMissing } from "@/lib/promptBinding";
import type { TenantPromptDetail } from "@/services/promptManager.types";

export type TenantPromptBindingState = "idle" | "loading" | "linked" | "missing" | "error";

interface UseTenantPromptBindingReturn {
  state: TenantPromptBindingState;
  detail: TenantPromptDetail | null;
  error: string | null;
  linking: boolean;
  fetchBinding: (tenantId: string) => Promise<void>;
  linkPrompt: (tenantId: string, promptId: string) => Promise<boolean>;
  clear: () => void;
}

export function useTenantPromptBinding(): UseTenantPromptBindingReturn {
  const [state, setState] = useState<TenantPromptBindingState>("idle");
  const [detail, setDetail] = useState<TenantPromptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const fetchBinding = useCallback(async (tenantId: string) => {
    setState("loading");
    setError(null);
    const result = await fetchTenantPromptDetail(tenantId, "operational");
    if (!result.ok) {
      setDetail(null);
      setError(result.message);
      setState("error");
      return;
    }
    setDetail(result.data);
    setState(isPromptBindingMissing(result.data) ? "missing" : "linked");
  }, []);

  const linkPrompt = useCallback(
    async (tenantId: string, promptId: string): Promise<boolean> => {
      setLinking(true);
      const result = await linkTenantToPrompt({ tenant_id: tenantId, prompt_id: promptId });
      setLinking(false);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      // O estado pós-sucesso vem de nova leitura do servidor, nunca de
      // suposição local (FR-018).
      await fetchBinding(tenantId);
      return true;
    },
    [fetchBinding],
  );

  const clear = useCallback(() => {
    setState("idle");
    setDetail(null);
    setError(null);
  }, []);

  return { state, detail, error, linking, fetchBinding, linkPrompt, clear };
}
