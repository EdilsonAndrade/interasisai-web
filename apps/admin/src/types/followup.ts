export type FollowUpStatus = 'pendente' | 'aprovado' | 'enviado' | 'descartado' | 'opt_out'
export type SessionOutcome = 'fechado' | 'pensando' | 'sem_resposta' | 'recusado' | 'em_andamento'

export interface FollowUpQueueEntry {
  id: string
  tenantId: string
  baseThreadId: string
  outcome: SessionOutcome
  summary: string
  draftMessage: string
  status: FollowUpStatus
  attempts: number
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface FollowUpFilters {
  status?: FollowUpStatus | null
  outcome?: SessionOutcome | null
  tenantId?: string | null
  page?: number
  limit?: number
}

export interface FollowUpQueueState {
  entries: FollowUpQueueEntry[]
  filters: FollowUpFilters
  loading: boolean
  error: string | null
  totalCount: number
}
