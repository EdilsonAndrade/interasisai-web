'use client'

import { useState, useEffect, useCallback } from 'react'
import { FollowUpQueueEntry, FollowUpFilters } from '../types'
import { apiClient } from '../services/api'

interface UseFollowUpQueueResult {
  data: FollowUpQueueEntry[]
  loading: boolean
  error: string | null
  totalCount: number
  fetchQueue: (filters?: FollowUpFilters) => Promise<void>
  refetch: () => Promise<void>
}

export const useFollowUpQueue = (): UseFollowUpQueueResult => {
  const [data, setData] = useState<FollowUpQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentFilters, setCurrentFilters] = useState<FollowUpFilters>({})

  const fetchQueue = useCallback(async (filters?: FollowUpFilters) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getFollowUpQueue(filters)
      setData(response.data)
      setTotalCount(response.total)
      setCurrentFilters(filters || {})
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar fila'
      setError(message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchQueue(currentFilters)
  }, [fetchQueue, currentFilters])

  useEffect(() => {
    fetchQueue()
  }, [])

  return { data, loading, error, totalCount, fetchQueue, refetch }
}
