// ============================================================================
// useMessageLimitConfig — Hook: busca a razão de chamadas de LLM por mensagem
// real (GET /tenants/message-limit-config), base da calculadora de
// dimensionamento de plano e da dica ao lado do campo de limite (EDI-63).
// Usa defaults conservadores em caso de falha, para não travar a UI.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { getMessageLimitConfig } from "@/services/pythonBackend";
import type { TenantMessageLimitConfig } from "@/services/pythonBackend.types";

const DEFAULT_CONFIG: TenantMessageLimitConfig = {
  worst_case_calls_per_message: 3,
  average_calls_per_message: 3,
};

type UseMessageLimitConfigReturn = {
  config: TenantMessageLimitConfig;
  loading: boolean;
  error: string | null;
};

export function useMessageLimitConfig(): UseMessageLimitConfigReturn {
  const [config, setConfig] = useState<TenantMessageLimitConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMessageLimitConfig().then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.ok) {
        setConfig(result.data);
        return;
      }
      setError(result.message);
      setConfig(DEFAULT_CONFIG);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading, error };
}
