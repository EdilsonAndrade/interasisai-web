// ============================================================================
// Follow-up Admin API — TypeScript types (EDI-65 / EDI-53)
// Contract: specs/025-follow-up-admin-panel/contracts/endpoints.md
// Same backend as pythonBackend.ts (NEXT_PUBLIC_PYTHON_BACKEND_URL, /api/v1 prefix)
// ============================================================================

export type FollowUpStatus = "pendente" | "aprovado" | "enviado" | "descartado" | "opt_out";
export type SessionOutcome = "fechado" | "pensando" | "sem_resposta" | "recusado" | "em_andamento";

export type FollowUpQueueEntry = {
  id: number;
  tenant_id: string;
  base_thread_id: string;
  customer_name?: string | null;
  outcome: SessionOutcome;
  summary: string;
  draft_message: string | null;
  status: FollowUpStatus;
  created_at: string;
};

export type FollowUpQueueResponse = {
  tenant_id: string;
  entries: FollowUpQueueEntry[];
};

export type FollowUpQueueGlobalResponse = {
  entries: FollowUpQueueEntry[];
};

export type UpdateFollowUpRequest = {
  status?: FollowUpStatus;
  draft_message?: string;
  approved_by?: string;
};

export type ConversationMessageRole = "human" | "ai";

export type ConversationMessage = {
  role: ConversationMessageRole;
  content: string;
  created_at: string;
};

export type ConversationHistoryResponse = {
  tenant_id: string;
  base_thread_id: string;
  messages: ConversationMessage[];
};

export type FollowUpTenantConfig = {
  id: string;
  name: string;
  google_calendar_id?: string;
  allowed_domains?: string[];
  oferta_vigente_texto?: string | null;
  oferta_vigente_validade?: string | null;
  retention_days: number;
  [key: string]: unknown;
};

export type FollowUpTenantListResponse = FollowUpTenantConfig[];

export type FollowUpApiFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type FollowUpQueueResult =
  | { ok: true; status: number; data: FollowUpQueueResponse }
  | FollowUpApiFailure;

export type FollowUpQueueGlobalResult =
  | { ok: true; status: number; data: FollowUpQueueGlobalResponse }
  | FollowUpApiFailure;

export type UpdateFollowUpResult =
  | { ok: true; status: number; data: FollowUpQueueEntry }
  | FollowUpApiFailure;

export type ConversationHistoryResult =
  | { ok: true; status: number; data: ConversationHistoryResponse }
  | FollowUpApiFailure;

export type FollowUpTenantConfigResult =
  | { ok: true; status: number; data: FollowUpTenantConfig }
  | FollowUpApiFailure;

export type FollowUpTenantListResult =
  | { ok: true; status: number; data: FollowUpTenantListResponse }
  | FollowUpApiFailure;
