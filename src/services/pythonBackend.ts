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
  CreateWhatsAppInstanceRequest,
  CreateWhatsAppInstanceResponse,
  CreateWhatsAppInstanceResult,
  WhatsAppQrCodeResponse,
  WhatsAppQrCodeResult,
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
  const baseUrl = getPythonBackendBaseUrl();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();

  if (!tenantId) {
    throw new Error(
      "Configuração do tenant ausente: NEXT_PUBLIC_TENANT_ID não está definida. Verifique o arquivo .env.",
    );
  }

  return { baseUrl, tenantId };
}

export function getPythonBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL?.trim();
  if (!baseUrl) {
    throw new Error(
      "Configuração do backend Python ausente: NEXT_PUBLIC_PYTHON_BACKEND_URL não está definida. Verifique o arquivo .env.",
    );
  }
  return baseUrl.replace(/\/$/, "");
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

function isValidPngDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
  );
}

function getOperationErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Não foi possível concluir a operação. Tente novamente.";
  }
  const value = payload as { detail?: unknown; message?: unknown };
  if (typeof value.detail === "string" && value.detail.trim()) {
    return value.detail.trim();
  }
  if (typeof value.message === "string" && value.message.trim()) {
    return value.message.trim();
  }
  return "Não foi possível concluir a operação. Tente novamente.";
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

// ---------------------------------------------------------------------------
// WhatsApp instances
// ---------------------------------------------------------------------------

export async function createWhatsAppInstance(
  request: CreateWhatsAppInstanceRequest,
  signal?: AbortSignal,
): Promise<CreateWhatsAppInstanceResult> {
  let response: Response;
  try {
    response = await fetch(`${getPythonBackendBaseUrl()}/api/v1/whatsapp/instances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    console.log("[PythonBackend:whatsapp:create:error]", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : "Não foi possível conectar ao serviço de WhatsApp.",
      retryable: true,
    };
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: getOperationErrorMessage(payload),
      retryable: isRetryableStatus(response.status),
    };
  }

  const success = payload as Partial<CreateWhatsAppInstanceResponse> | null;
  if (
    !success ||
    typeof success.tenant_id !== "string" ||
    typeof success.instance_name !== "string" ||
    !isValidPngDataUrl(success.qrcode_base64)
  ) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou um QR Code inválido.",
      retryable: true,
    };
  }

  return {
    ok: true,
    status: response.status,
    message:
      typeof success.message === "string" && success.message.trim()
        ? success.message.trim()
        : "Instância cadastrada com sucesso.",
    tenantId: success.tenant_id,
    instanceName: success.instance_name,
    qrCode: success.qrcode_base64,
  };
}

export async function getWhatsAppQrCode(
  instanceName: string,
  signal?: AbortSignal,
): Promise<WhatsAppQrCodeResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/whatsapp/instances/${encodeURIComponent(instanceName)}/qrcode`,
      { method: "GET", signal },
    );
  } catch (error) {
    console.log("[PythonBackend:whatsapp:create:error]", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : "Não foi possível conectar ao serviço de WhatsApp.",
      retryable: true,
    };
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: getOperationErrorMessage(payload),
      retryable: isRetryableStatus(response.status),
    };
  }

  const success = payload as Partial<WhatsAppQrCodeResponse> | null;
  if (
    !success ||
    typeof success.instance_name !== "string" ||
    !isValidPngDataUrl(success.qrcode_base64)
  ) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou um QR Code inválido.",
      retryable: true,
    };
  }

  return {
    ok: true,
    status: response.status,
    instanceName: success.instance_name,
    qrCode: success.qrcode_base64,
  };
}
