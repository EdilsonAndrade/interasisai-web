// ============================================================================
// Python Backend API — TypeScript types (Agendamento IA)
// Contract: GET /api/v1/chat/init, POST /api/v1/chat, tenants and knowledge-base endpoints
// Source: specs/010-integrate-python-backend/contracts/, specs/017-tenant-search-knowledge-base/contracts/
// ============================================================================

import type { ApiErrorCode, Blocker } from "@/lib/apiError";
import type { NodeType } from "./promptManager.types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type PythonBackendConfig = {
  baseUrl: string;
  tenantId: string;
};

// ---------------------------------------------------------------------------
// Chat API — Request
// ---------------------------------------------------------------------------

export type PythonChatRequest = {
  message: string;
  thread_id: string;
};

// ---------------------------------------------------------------------------
// Chat API — Success Response (HTTP 200)
// ---------------------------------------------------------------------------

export type PythonChatSuccessResponse = {
  tenant_id: string;
  status: "success";
  response: string;
};

// ---------------------------------------------------------------------------
// Chat API — Error Response (HTTP 4xx / 5xx)
// ---------------------------------------------------------------------------

export type PythonChatErrorResponse = {
  detail: string;
};

// ---------------------------------------------------------------------------
// Chat API — Union result type
// ---------------------------------------------------------------------------

export type PythonChatSuccess = {
  ok: true;
  reply: string;
  status: number;
};

export type PythonChatFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type PythonChatResult = PythonChatSuccess | PythonChatFailure;

// ---------------------------------------------------------------------------
// Chat Init API — Success Response (HTTP 200)
// ---------------------------------------------------------------------------

export type PythonChatInitSuccessResponse = {
  access_token: string;
  token_type: string;
};

// ---------------------------------------------------------------------------
// Chat Init API — Error Response (HTTP 4xx / 5xx)
// ---------------------------------------------------------------------------

export type PythonChatInitErrorResponse = {
  detail: string;
};

// ---------------------------------------------------------------------------
// Chat Init API — Union result type
// ---------------------------------------------------------------------------

export type PythonChatInitSuccess = {
  ok: true;
  accessToken: string;
  tokenType: string;
  status: number;
};

export type PythonChatInitFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type PythonChatInitResult =
  | PythonChatInitSuccess
  | PythonChatInitFailure;

// ---------------------------------------------------------------------------
// WhatsApp instance API
// ---------------------------------------------------------------------------

export type CreateWhatsAppInstanceRequest = {
  tenant_id: string;
  instance_name: string;
};

export type CreateWhatsAppInstanceResponse = {
  message: string;
  tenant_id: string;
  instance_name: string;
  qrcode_base64: string;
};

export type WhatsAppQrCodeResponse = {
  instance_name: string;
  qrcode_base64: string;
};

export type WhatsAppInstanceSuccess = {
  ok: true;
  status: number;
  message: string;
  tenantId: string;
  instanceName: string;
  qrCode: string;
};

export type WhatsAppQrCodeSuccess = {
  ok: true;
  status: number;
  instanceName: string;
  qrCode: string;
};

export type WhatsAppOperationFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type CreateWhatsAppInstanceResult =
  | WhatsAppInstanceSuccess
  | WhatsAppOperationFailure;

export type WhatsAppQrCodeResult =
  | WhatsAppQrCodeSuccess
  | WhatsAppOperationFailure;

// ---------------------------------------------------------------------------
// Tenant management API
// ---------------------------------------------------------------------------

export type TenantWriteInput = {
  name: string;
  google_calendar_id: string;
  allowed_domains: string[];
};

export type TenantCreateInput = TenantWriteInput & {
  tenant_id: string;
  prompt_id: string;
};

export type Tenant = {
  id: string;
  name: string;
  google_calendar_id: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  allowed_domains: string[];
};

export type TenantFieldErrors = Partial<
  Record<keyof TenantCreateInput, string>
>;

export type TenantOperationFailure = {
  ok: false;
  status: number;
  code?: ApiErrorCode;
  message: string;
  blockers: Blocker[];
  fieldErrors?: TenantFieldErrors;
  retryable: boolean;
};

export type TenantOperationSuccess = {
  ok: true;
  status: number;
  tenant: Tenant;
};

export type TenantDeleteSuccess = {
  ok: true;
  status: number;
};

export type TenantOperationResult =
  | TenantOperationSuccess
  | TenantOperationFailure;

export type TenantDeleteResult =
  | TenantDeleteSuccess
  | TenantOperationFailure;

// ---------------------------------------------------------------------------
// Tenant delete impact preview — GET /tenants/{id}/delete-impact (EDI-45)
// ---------------------------------------------------------------------------

export type TenantDeleteImpactPromptItem = {
  id: string;
  titulo: string;
  node_type?: NodeType; // presente apenas em prompts_to_delete
};

export type TenantDeleteImpactGuardrailItem = {
  id: string;
  titulo: string;
  is_global?: boolean; // presente apenas em guardrails_to_unlink_only
};

export type TenantDeleteImpact = {
  tenant_id: string;
  prompts_to_delete: TenantDeleteImpactPromptItem[];
  prompts_to_unlink_only: TenantDeleteImpactPromptItem[];
  guardrails_to_delete: TenantDeleteImpactGuardrailItem[];
  guardrails_to_unlink_only: TenantDeleteImpactGuardrailItem[];
};

export type TenantDeleteImpactSuccess = {
  ok: true;
  status: number;
  data: TenantDeleteImpact;
};

export type TenantDeleteImpactResult =
  | TenantDeleteImpactSuccess
  | TenantOperationFailure;

// ---------------------------------------------------------------------------
// Tenant search API — GET /tenants?q=&limit=
// ---------------------------------------------------------------------------

export type TenantSearchItem = Tenant;

export type TenantSearchSuccess = {
  ok: true;
  status: number;
  tenants: TenantSearchItem[]; // empty array is a valid result, not an error
};

export type TenantSearchFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type TenantSearchResult = TenantSearchSuccess | TenantSearchFailure;

// ---------------------------------------------------------------------------
// Tenant grid API — GET /tenants/list?q=&limit=&offset= (EDI-46)
// ---------------------------------------------------------------------------

export type TenantGridPromptTag = {
  id: string;
  titulo: string;
  node_type: NodeType;
};

export type TenantGridGuardrailTag = {
  id: string;
  titulo: string;
  is_global: boolean;
};

export type TenantGridItem = {
  id: string;
  name: string;
  google_calendar_id: string;
  allowed_domains: string[];
  created_at: string;
  updated_at: string | null;
  prompts: TenantGridPromptTag[];
  guardrails: TenantGridGuardrailTag[];
};

export type TenantListSuccess = {
  ok: true;
  status: number;
  items: TenantGridItem[];
  total: number;
};

export type TenantListFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type TenantListResult = TenantListSuccess | TenantListFailure;

// ---------------------------------------------------------------------------
// Knowledge base API — GET/PUT/DELETE /tenants/{tenant_id}/knowledge-base
// ---------------------------------------------------------------------------

export type KnowledgeBase = {
  tenant_id: string;
  content: string | null; // null = no knowledge base saved yet (normal state)
  updated_at: string | null;
};

export type KnowledgeBaseReadSuccess = {
  ok: true;
  status: number;
  data: KnowledgeBase;
};

export type KnowledgeBaseWriteSuccess = {
  ok: true;
  status: number;
  data: KnowledgeBase;
};

export type KnowledgeBaseDeleteSuccess = {
  ok: true;
  status: number;
  message: string;
};

export type KnowledgeBaseFailure = {
  ok: false;
  status: number;
  message: string;
  fieldErrors?: { content?: string };
  retryable: boolean;
};

export type KnowledgeBaseReadResult = KnowledgeBaseReadSuccess | KnowledgeBaseFailure;
export type KnowledgeBaseWriteResult = KnowledgeBaseWriteSuccess | KnowledgeBaseFailure;
export type KnowledgeBaseDeleteResult = KnowledgeBaseDeleteSuccess | KnowledgeBaseFailure;
