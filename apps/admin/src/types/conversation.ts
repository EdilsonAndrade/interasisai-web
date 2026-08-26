export type MessageRole = 'human' | 'ai'

export interface ConversationMessage {
  role: MessageRole
  content: string
  created_at: string
}

export interface ConversationHistory {
  tenant_id: string
  base_thread_id: string
  messages: ConversationMessage[]
}

export interface ConversationHistoryState {
  messages: ConversationMessage[]
  loading: boolean
  error: string | null
}

export interface HistorySearchParams {
  tenantId: string
  baseThreadId: string
  limit?: number
  before?: string
}
