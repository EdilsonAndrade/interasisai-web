import { FollowUpQueueEntry, FollowUpQueueResponse, FollowUpStatus } from './followup'
import { ConversationMessage, ConversationHistory } from './conversation'
import { TenantConfig } from './tenant'

// GET /tenants/{tenant_id}/follow-up-queue
export interface GetFollowUpQueueResponse extends FollowUpQueueResponse {}

// PATCH /tenants/{tenant_id}/follow-up-queue/{entry_id}
export interface UpdateFollowUpRequest {
  status?: FollowUpStatus
  draft_message?: string
  approved_by?: string
}

export interface UpdateFollowUpResponse extends FollowUpQueueEntry {}

// GET /tenants/{tenant_id}/conversation-history/{base_thread_id}
export interface GetConversationHistoryResponse extends ConversationHistory {}

// GET /tenants/{tenant_id}
export interface GetTenantResponse extends TenantConfig {}

// PUT /tenants/{tenant_id}
export interface UpdateTenantRequest extends TenantConfig {}

export interface UpdateTenantResponse extends TenantConfig {}

// List tenants
export interface ListTenantsResponse {
  tenants: TenantConfig[]
}

// Error
export interface ApiErrorResponse {
  detail: string
}
