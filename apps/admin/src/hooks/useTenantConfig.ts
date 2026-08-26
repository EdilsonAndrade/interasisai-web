'use client'

import { useState, useCallback } from 'react'
import { TenantConfig } from '../types'
import { apiClient } from '../services/api'

interface UseTenantConfigResult {
  config: TenantConfig | null
  loading: boolean
  error: string | null
  saving: boolean
  fetchConfig: (tenantId: string) => Promise<void>
  updateConfig: (tenantId: string, updates: Partial<TenantConfig>) => Promise<void>
}

export const useTenantConfig = (): UseTenantConfigResult => {
  const [config, setConfig] = useState<TenantConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchConfig = useCallback(async (tenantId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getTenantConfig(tenantId)
      setConfig(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar configuração'
      setError(message)
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConfig = useCallback(async (tenantId: string, updates: Partial<TenantConfig>) => {
    if (!config) {
      setError('Configuração não carregada')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // PUT requires complete object — merge updates with current config
      const completePayload: TenantConfig = {
        ...config,
        ...updates,
      }

      const response = await apiClient.updateTenantConfig(tenantId, completePayload)
      setConfig(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar configuração'
      setError(message)
    } finally {
      setSaving(false)
    }
  }, [config])

  return {
    config,
    loading,
    error,
    saving,
    fetchConfig,
    updateConfig,
  }
}
