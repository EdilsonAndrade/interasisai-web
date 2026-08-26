'use client'

import { useState, useCallback } from 'react'
import { FollowUpQueueEntry, FollowUpStatus } from '../types'
import { apiClient } from '../services/api'

interface UseFollowUpQueueResult {
  data: FollowUpQueueEntry[]
  loading: boolean
  error: string | null
  fetchQueue: (tenantId: string, status?: FollowUpStatus) => Promise<void>
  refetch: () => Promise<void>
}

export const useFollowUpQueue = (): UseFollowUpQueueResult => {
  const [data, setData] = useState<FollowUpQueueEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTenantId, setCurrentTenantId] = useState<string>('')
  const [currentStatus, setCurrentStatus] = useState<FollowUpStatus | undefined>()

  const fetchQueue = useCallback(async (tenantId: string, status?: FollowUpStatus) => {
    setLoading(true)
    setError(null)
    setCurrentTenantId(tenantId)
    setCurrentStatus(status)

    try {
      const response = await apiClient.getFollowUpQueue(tenantId, status)
      setData(response.entries)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar fila'
      setError(message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    if (currentTenantId) {
      return fetchQueue(currentTenantId, currentStatus)
    }
    return Promise.resolve()
  }, [fetchQueue, currentTenantId, currentStatus])

  return { data, loading, error, fetchQueue, refetch }
}
