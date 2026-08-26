export type FollowUpStatus = 'pendente' | 'aprovado' | 'enviado' | 'descartado' | 'opt_out'
export type SessionOutcome = 'fechado' | 'pensando' | 'sem_resposta' | 'recusado' | 'em_andamento'

export interface FollowUpQueueEntry {
  id: number
  tenant_id: string
  base_thread_id: string
  customer_name?: string | null
  outcome: SessionOutcome
  summary: string
  draft_message: string
  status: FollowUpStatus
  created_at: string
}

export interface FollowUpQueueResponse {
  tenant_id: string
  entries: FollowUpQueueEntry[]
}

export interface FollowUpQueueGlobalResponse {
  entries: FollowUpQueueEntry[]
}

export interface FollowUpFilters {
  status?: FollowUpStatus | null
  outcome?: SessionOutcome | null
}

export interface FollowUpQueueState {
  entries: FollowUpQueueEntry[]
  filters: FollowUpFilters
  loading: boolean
  error: string | null
}
