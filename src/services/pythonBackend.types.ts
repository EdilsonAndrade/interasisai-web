// ============================================================================
// Python Backend API — TypeScript types (Agendamento IA)
// Contract: POST /api/v1/chat and POST /api/v1/ingest/text
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
