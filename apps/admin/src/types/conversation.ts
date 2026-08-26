export type MessageRole = 'user' | 'assistant'

export interface ConversationMessage {
  id: string
  tenantId: string
  baseThreadId: string
  activeThreadId: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface ConversationHistoryState {
  messages: ConversationMessage[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

export interface HistorySearchParams {
  tenantId: string
  baseThreadId: string
  page?: number
  limit?: number
}
