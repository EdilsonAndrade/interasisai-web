import { FollowUpQueueEntry, FollowUpFilters } from './followup'
import { ConversationMessage, HistorySearchParams } from './conversation'
import { TenantConfig, OfferInfo } from './tenant'

export interface ListFollowUpResponse {
  data: FollowUpQueueEntry[]
  total: number
  page: number
  limit: number
}

export interface UpdateFollowUpRequest {
  status: FollowUpQueueEntry['status']
  draftMessage?: string
  approvedBy?: string
}

export interface UpdateFollowUpResponse {
  data: FollowUpQueueEntry
  success: boolean
}

export interface ListConversationResponse {
  data: ConversationMessage[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface GetTenantResponse {
  data: TenantConfig
}

export interface UpdateTenantRequest {
  ofertaVigente?: OfferInfo | null
  retentionDays?: number
}

export interface UpdateTenantResponse {
  data: TenantConfig
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
