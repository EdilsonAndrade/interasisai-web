'use client'

import { useState, useCallback } from 'react'
import { ConversationMessage } from '../types'
import { apiClient } from '../services/api'

interface UseConversationHistoryResult {
  messages: ConversationMessage[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  fetchHistory: (tenantId: string, baseThreadId: string) => Promise<void>
  loadMore: () => Promise<void>
}

export const useConversationHistory = (): UseConversationHistoryResult => {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [currentTenantId, setCurrentTenantId] = useState<string>('')
  const [currentThreadId, setCurrentThreadId] = useState<string>('')

  const fetchHistory = useCallback(async (tenantId: string, baseThreadId: string) => {
    setLoading(true)
    setError(null)
    setMessages([])
    setPage(1)
    setCurrentTenantId(tenantId)
    setCurrentThreadId(baseThreadId)

    try {
      const response = await apiClient.getConversationHistory(tenantId, baseThreadId, 1, 50)
      setMessages(response.data)
      setHasMore(response.hasMore)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar histórico'
      setError(message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!currentTenantId || !currentThreadId) return
    if (!hasMore) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const response = await apiClient.getConversationHistory(
        currentTenantId,
        currentThreadId,
        nextPage,
        50
      )
      setMessages(prev => [...prev, ...response.data])
      setPage(nextPage)
      setHasMore(response.hasMore)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar mais mensagens'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [currentTenantId, currentThreadId, hasMore, page])

  return {
    messages,
    loading,
    error,
    hasMore,
    page,
    fetchHistory,
    loadMore,
  }
}
