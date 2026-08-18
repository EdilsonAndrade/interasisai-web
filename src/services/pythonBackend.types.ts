// ============================================================================
// Python Backend API — TypeScript types (Agendamento IA)
// Contract: GET /api/v1/chat/init, POST /api/v1/chat and POST /api/v1/ingest/text
// Source: specs/010-integrate-python-backend/contracts/
// ============================================================================

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
// Ingest API — Request
// ---------------------------------------------------------------------------

export type IngestRequest = {
  text_content: string;
};

// ---------------------------------------------------------------------------
// Ingest API — Success Response (HTTP 201)
// ---------------------------------------------------------------------------

export type IngestSuccessResponse = {
  tenant_id: string;
  status: "processing";
  message: string;
};

// ---------------------------------------------------------------------------
// Ingest API — Error Response
// ---------------------------------------------------------------------------

export type IngestErrorResponse = {
  detail: string;
};

// ---------------------------------------------------------------------------
// Ingest API — Union result type
// ---------------------------------------------------------------------------

export type IngestSuccess = {
  ok: true;
  message: string;
  status: number;
};

export type IngestFailure = {
  ok: false;
  status: number;
  message: string;
};

export type IngestResult = IngestSuccess | IngestFailure;

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
};

export type Tenant = {
  id: string;
  name: string;
  google_calendar_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  allowed_domains: string[];
};

export type TenantFieldErrors = Partial<
  Record<keyof TenantCreateInput, string>
>;

export type TenantOperationFailure = {
  ok: false;
  status: number;
  message: string;
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
