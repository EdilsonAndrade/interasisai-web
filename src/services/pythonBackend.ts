// ============================================================================
// Python Backend HTTP Client — Agendamento IA
// Wraps fetch for POST /api/v1/chat and POST /api/v1/ingest/text
// ============================================================================

import type {
  PythonBackendConfig,
  PythonChatRequest,
  PythonChatSuccessResponse,
  PythonChatErrorResponse,
  PythonChatResult,
  IngestRequest,
  IngestSuccessResponse,
  IngestErrorResponse,
  IngestResult,
} from "./pythonBackend.types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Reads and validates the Python backend configuration from environment variables.
 *
 * @returns {PythonBackendConfig} Validated configuration object.
 * @throws {Error} If NEXT_PUBLIC_PYTHON_BACKEND_URL or NEXT_PUBLIC_TENANT_ID is missing.
 */
export function getPythonBackendConfig(): PythonBackendConfig {
  const baseUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL?.trim();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();

  if (!baseUrl) {
    throw new Error(
      "Configuração do backend Python ausente: NEXT_PUBLIC_PYTHON_BACKEND_URL não está definida. Verifique o arquivo .env.",
    );
  }

  if (!tenantId) {
    throw new Error(
      "Configuração do tenant ausente: NEXT_PUBLIC_TENANT_ID não está definida. Verifique o arquivo .env.",
    );
  }

  return { baseUrl, tenantId };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIMEOUT_MSG =
  "O serviço de atendimento demorou para responder. Por favor, tente novamente em instantes.";
const INTERNAL_ERROR_MSG =
  "Erro interno no motor de IA. Nossa equipe foi notificada.";
const NETWORK_ERROR_MSG =
  "Não foi possível se conectar ao serviço de mensagens.";
const FALLBACK_REPLY = "Recebemos sua mensagem e já estamos processando.";

function isRetryableStatus(status: number): boolean {
  // Network error (status 0), timeout, throttling, or server errors
  if (status === 0 || status === 408 || status === 429) return true;
  return status >= 500;
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(
  status: number,
  payload: PythonChatErrorResponse | null,
): string {
  if (status === 504) return TIMEOUT_MSG;
  if (status === 500) return INTERNAL_ERROR_MSG;
  if (payload?.detail?.trim()) return payload.detail;
  if (status === 0) return NETWORK_ERROR_MSG;
  return "Erro inesperado ao comunicar com o serviço de IA.";
}

// ---------------------------------------------------------------------------
// Chat API — POST /api/v1/chat
// ---------------------------------------------------------------------------

/**
 * Sends a text message to the Python backend chat endpoint.
 *
 * @param request - The chat request containing message and thread_id.
 * @param tenantId - The tenant identifier for the X-Tenant-ID header.
 * @returns {Promise<PythonChatResult>} Success or failure result.
 */
export async function sendChatMessage(
  request: PythonChatRequest,
  tenantId: string,
): Promise<PythonChatResult> {
  const config = getPythonBackendConfig();

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId,
      },
      body: JSON.stringify(request),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: NETWORK_ERROR_MSG,
      retryable: true,
    };
  }

  const payload = await parseJsonSafely(response);

  if (response.ok) {
    const successPayload = payload as PythonChatSuccessResponse | null;
    const reply =
      successPayload?.response?.trim() || FALLBACK_REPLY;

    console.info("[PythonBackend:chat]", {
      tenant_id: successPayload?.tenant_id ?? tenantId,
      thread_id: request.thread_id,
      endpoint: "/api/v1/chat",
      status: response.status,
    });

    return {
      ok: true,
      reply,
      status: response.status,
    };
  }

  const errorPayload = payload as PythonChatErrorResponse | null;
  const message = getErrorMessage(response.status, errorPayload);

  console.error("[PythonBackend:chat:error]", {
    status: response.status,
    message,
    thread_id: request.thread_id,
  });

  return {
    ok: false,
    status: response.status,
    message,
    retryable: isRetryableStatus(response.status),
  };
}

// ---------------------------------------------------------------------------
// Ingest API — POST /api/v1/ingest/text
// ---------------------------------------------------------------------------

/**
 * Sends business rules / institutional text for vectorization in the RAG knowledge base.
 *
 * @param request - The ingest request containing text_content.
 * @param tenantId - The tenant identifier from the admin form (NOT from env var).
 * @returns {Promise<IngestResult>} Success or failure result.
 */
export async function ingestKnowledge(
  request: IngestRequest,
  tenantId: string,
): Promise<IngestResult> {
  const config = getPythonBackendConfig();

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/api/v1/ingest/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId,
      },
      body: JSON.stringify(request),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: NETWORK_ERROR_MSG,
    };
  }

  const payload = await parseJsonSafely(response);

  if (response.ok) {
    const successPayload = payload as IngestSuccessResponse | null;

    console.info("[PythonBackend:ingest]", {
      tenant_id: successPayload?.tenant_id ?? tenantId,
      status: successPayload?.status ?? "unknown",
      endpoint: "/api/v1/ingest/text",
    });

    return {
      ok: true,
      message:
        successPayload?.message?.trim() ||
        "Texto enviado para vetorização. O processamento está em andamento em segundo plano.",
      status: response.status,
    };
  }

  const errorPayload = payload as IngestErrorResponse | null;

  console.error("[PythonBackend:ingest:error]", {
    status: response.status,
    message: errorPayload?.detail ?? "Erro desconhecido",
  });

  return {
    ok: false,
    status: response.status,
    message:
      errorPayload?.detail?.trim() ||
      "Erro ao enviar texto para vetorização. Tente novamente.",
  };
}
