'use client'

import { useState, useCallback } from 'react'
import { FollowUpQueueEntry, FollowUpStatus, SessionOutcome } from '../types'
import { apiClient } from '../services/api'

interface UseFollowUpQueueResult {
  data: FollowUpQueueEntry[]
  loading: boolean
  error: string | null
  fetchQueue: (tenantId: string, status?: FollowUpStatus, outcome?: SessionOutcome) => Promise<void>
  fetchQueueGlobal: (tenantId?: string, status?: FollowUpStatus, outcome?: SessionOutcome) => Promise<void>
  refetch: () => Promise<void>
}

export const useFollowUpQueue = (): UseFollowUpQueueResult => {
  const [data, setData] = useState<FollowUpQueueEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTenantId, setCurrentTenantId] = useState<string>('')
  const [currentStatus, setCurrentStatus] = useState<FollowUpStatus | undefined>()
  const [currentOutcome, setCurrentOutcome] = useState<SessionOutcome | undefined>()
  const [isGlobal, setIsGlobal] = useState(false)

  const fetchQueue = useCallback(
    async (tenantId: string, status?: FollowUpStatus, outcome?: SessionOutcome) => {
      setLoading(true)
      setError(null)
      setCurrentTenantId(tenantId)
      setCurrentStatus(status)
      setCurrentOutcome(outcome)
      setIsGlobal(false)

      try {
        const response = await apiClient.getFollowUpQueue(tenantId, status, outcome)
        setData(response.entries)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar fila'
        setError(message)
        setData([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const fetchQueueGlobal = useCallback(
    async (tenantId?: string, status?: FollowUpStatus, outcome?: SessionOutcome) => {
      setLoading(true)
      setError(null)
      setCurrentTenantId(tenantId || '')
      setCurrentStatus(status)
      setCurrentOutcome(outcome)
      setIsGlobal(true)

      try {
        const response = await apiClient.getFollowUpQueueGlobal(tenantId, status, outcome)
        setData(response.entries)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar fila'
        setError(message)
        setData([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const refetch = useCallback(() => {
    if (isGlobal) {
      return fetchQueueGlobal(currentTenantId || undefined, currentStatus, currentOutcome)
    } else if (currentTenantId) {
      return fetchQueue(currentTenantId, currentStatus, currentOutcome)
    }
    return Promise.resolve()
  }, [fetchQueue, fetchQueueGlobal, currentTenantId, currentStatus, currentOutcome, isGlobal])

  return { data, loading, error, fetchQueue, fetchQueueGlobal, refetch }
}
