'use client'

import { useState, useCallback } from 'react'
import { TenantConfig, OfferInfo } from '../types'
import { apiClient } from '../services/api'

interface UseTenantConfigResult {
  config: TenantConfig | null
  loading: boolean
  error: string | null
  saving: boolean
  fetchConfig: (tenantId: string) => Promise<void>
  updateConfig: (tenantId: string, oferta?: OfferInfo | null, retentionDays?: number) => Promise<void>
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
      setConfig(response.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar configuração'
      setError(message)
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConfig = useCallback(
    async (tenantId: string, oferta?: OfferInfo | null, retentionDays?: number) => {
      setSaving(true)
      setError(null)
      try {
        const response = await apiClient.updateTenantConfig(tenantId, {
          ofertaVigente: oferta,
          retentionDays,
        })
        setConfig(response.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar configuração'
        setError(message)
      } finally {
        setSaving(false)
      }
    },
    []
  )

  return {
    config,
    loading,
    error,
    saving,
    fetchConfig,
    updateConfig,
  }
}
