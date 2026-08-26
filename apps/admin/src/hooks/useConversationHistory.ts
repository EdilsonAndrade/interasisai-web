'use client'

import { useState, useCallback } from 'react'
import { ConversationMessage } from '../types'
import { apiClient } from '../services/api'

interface UseConversationHistoryResult {
  messages: ConversationMessage[]
  loading: boolean
  error: string | null
  fetchHistory: (tenantId: string, baseThreadId: string, limit?: number) => Promise<void>
  loadMore: (before?: string) => Promise<void>
}

export const useConversationHistory = (): UseConversationHistoryResult => {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTenantId, setCurrentTenantId] = useState<string>('')
  const [currentThreadId, setCurrentThreadId] = useState<string>('')
  const [lastMessageCreatedAt, setLastMessageCreatedAt] = useState<string>('')

  const fetchHistory = useCallback(
    async (tenantId: string, baseThreadId: string, limit = 200) => {
      setLoading(true)
      setError(null)
      setMessages([])
      setCurrentTenantId(tenantId)
      setCurrentThreadId(baseThreadId)
      setLastMessageCreatedAt('')

      try {
        const response = await apiClient.getConversationHistory(tenantId, baseThreadId, limit)
        setMessages(response.messages)
        if (response.messages.length > 0) {
          setLastMessageCreatedAt(response.messages[0].created_at)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar histórico'
        setError(message)
        setMessages([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const loadMore = useCallback(
    async (before?: string) => {
      if (!currentTenantId || !currentThreadId) return

      setLoading(true)
      try {
        const response = await apiClient.getConversationHistory(
          currentTenantId,
          currentThreadId,
          200,
          before || lastMessageCreatedAt
        )
        setMessages(prev => [...prev, ...response.messages])
        if (response.messages.length > 0) {
          setLastMessageCreatedAt(response.messages[0].created_at)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar mais mensagens'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [currentTenantId, currentThreadId, lastMessageCreatedAt]
  )

  return {
    messages,
    loading,
    error,
    fetchHistory,
    loadMore,
  }
}
