// ============================================================================
// useTenantNodePrompts — Hook: prompt + guardrails vinculados a um tenant nos
// três node_type (operational, institutional, chitchat), buscados em
// paralelo (EDI-46, US2). Exibição somente-leitura — a correção in-place do
// vínculo obrigatório continua exclusiva de `useTenantPromptBinding`
// (operacional).
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { fetchTenantPromptDetail } from "@/services/promptManager";
import type { NodeType, TenantPromptDetail } from "@/services/promptManager.types";

export type TenantNodePromptState = "idle" | "loading" | "linked" | "missing" | "error";

export type TenantNodePromptEntry = {
  state: TenantNodePromptState;
  detail: TenantPromptDetail | null;
  error: string | null;
};

const NODE_TYPES: NodeType[] = ["operational", "institutional", "chitchat"];

function idleEntry(): TenantNodePromptEntry {
  return { state: "idle", detail: null, error: null };
}

function initialEntries(): Record<NodeType, TenantNodePromptEntry> {
  return {
    operational: idleEntry(),
    institutional: idleEntry(),
    chitchat: idleEntry(),
  };
}

interface UseTenantNodePromptsReturn {
  entries: Record<NodeType, TenantNodePromptEntry>;
  fetchAll: (tenantId: string) => Promise<void>;
  clear: () => void;
}

export function useTenantNodePrompts(): UseTenantNodePromptsReturn {
  const [entries, setEntries] = useState<Record<NodeType, TenantNodePromptEntry>>(initialEntries());

  const fetchAll = useCallback(async (tenantId: string) => {
    setEntries({
      operational: { state: "loading", detail: null, error: null },
      institutional: { state: "loading", detail: null, error: null },
      chitchat: { state: "loading", detail: null, error: null },
    });

    const results = await Promise.all(
      NODE_TYPES.map((nodeType) => fetchTenantPromptDetail(tenantId, nodeType)),
    );

    const next = {} as Record<NodeType, TenantNodePromptEntry>;
    NODE_TYPES.forEach((nodeType, index) => {
      const result = results[index];
      if (!result.ok) {
        next[nodeType] = { state: "error", detail: null, error: result.message };
        return;
      }
      next[nodeType] = {
        // is_default_prompt indica que a resposta resolveu para o padrão da
        // plataforma (nenhum vínculo próprio) — is_active é sobre a linha de
        // vínculo em si, não sobre existir vínculo (ver TenantLinkSection.tsx).
        state: result.data.is_default_prompt ? "missing" : "linked",
        detail: result.data,
        error: null,
      };
    });
    setEntries(next);
  }, []);

  const clear = useCallback(() => setEntries(initialEntries()), []);

  return { entries, fetchAll, clear };
}
