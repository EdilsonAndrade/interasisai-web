"use client";

import { useState, useCallback } from "react";
import { getFollowUpTenantConfig, updateFollowUpTenantConfig } from "@/services/followUpApi";
import type { FollowUpTenantConfig } from "@/services/followUpApi.types";

interface UseFollowUpTenantConfigResult {
  config: FollowUpTenantConfig | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  fetchConfig: (tenantId: string) => Promise<void>;
  updateConfig: (tenantId: string, updates: Partial<FollowUpTenantConfig>) => Promise<void>;
}

export function useFollowUpTenantConfig(): UseFollowUpTenantConfigResult {
  const [config, setConfig] = useState<FollowUpTenantConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async (tenantId: string) => {
    setLoading(true);
    setError(null);
    const result = await getFollowUpTenantConfig(tenantId);
    if (result.ok) {
      setConfig(result.data);
    } else {
      setError(result.message);
      setConfig(null);
    }
    setLoading(false);
  }, []);

  const updateConfig = useCallback(
    async (tenantId: string, updates: Partial<FollowUpTenantConfig>) => {
      if (!config) {
        setError("Configuração não carregada");
        return;
      }

      setSaving(true);
      setError(null);

      // PUT exige objeto completo — mescla updates com config atual
      const completePayload: FollowUpTenantConfig = { ...config, ...updates };
      const result = await updateFollowUpTenantConfig(tenantId, completePayload);

      if (result.ok) {
        setConfig(result.data);
      } else {
        setError(result.message);
      }
      setSaving(false);
    },
    [config]
  );

  return { config, loading, error, saving, fetchConfig, updateConfig };
}
