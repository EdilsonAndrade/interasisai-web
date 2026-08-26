// ============================================================================
// Python Backend HTTP Client — Agendamento IA
// Wraps fetch for GET /api/v1/chat/init, POST /api/v1/chat, tenants and knowledge-base endpoints
// ============================================================================

import { normalizeApiError } from "@/lib/apiError";
import type {
  PythonBackendConfig,
  PythonChatRequest,
  PythonChatSuccessResponse,
  PythonChatErrorResponse,
  PythonChatResult,
  PythonChatInitSuccessResponse,
  PythonChatInitErrorResponse,
  PythonChatInitResult,
  CreateWhatsAppInstanceRequest,
  CreateWhatsAppInstanceResponse,
  CreateWhatsAppInstanceResult,
  WhatsAppQrCodeResponse,
  WhatsAppQrCodeResult,
  Tenant,
  TenantCreateInput,
  TenantDeleteImpact,
  TenantDeleteImpactResult,
  TenantDeleteResult,
  TenantFieldErrors,
  TenantOperationFailure,
  TenantOperationResult,
  TenantWriteInput,
  TenantSearchItem,
  TenantSearchResult,
  TenantGridItem,
  TenantGridPromptTag,
  TenantGridGuardrailTag,
  TenantListResult,
  KnowledgeBase,
  KnowledgeBaseReadResult,
  KnowledgeBaseWriteResult,
  KnowledgeBaseDeleteResult,
  KnowledgeBaseFailure,
  TenantUsage,
  TenantUsageResult,
  TenantMessageLimitConfig,
  TenantMessageLimitConfigResult,
  GlobalRecipient,
  GlobalRecipientListResult,
  GlobalRecipientOperationResult,
  GlobalRecipientDeleteResult,
  GlobalRecipientFailure,
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
// Chat Init API — GET /api/v1/chat/init
// ---------------------------------------------------------------------------

/**
 * Initializes a chat session for the given tenant and returns an access token.
 *
 * @param tenantId - The tenant identifier for the X-Tenant-ID header.
 * @returns {Promise<PythonChatInitResult>} Success (with access token) or failure.
 */
export async function initializeChatSession(
  tenantId: string,
): Promise<PythonChatInitResult> {
  let response: Response;
  try {
    response = await fetch(`${getPythonBackendBaseUrl()}/api/v1/chat/init`, {
      method: "GET",
      headers: {
        "X-Tenant-ID": tenantId,
      },
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
    const success = payload as Partial<PythonChatInitSuccessResponse> | null;
    const accessToken = success?.access_token?.trim();

    if (!accessToken) {
      console.error("[PythonBackend:init:error]", {
        status: 502,
        message: "O serviço não retornou um token de acesso válido.",
      });
      return {
        ok: false,
        status: 502,
        message: "O serviço não retornou um token de acesso válido.",
        retryable: true,
      };
    }

    console.info("[PythonBackend:init]", {
      tenant_id: tenantId,
      token_type: success?.token_type?.trim() || "bearer",
      endpoint: "/api/v1/chat/init",
      status: response.status,
    });

    return {
      ok: true,
      accessToken,
      tokenType: success?.token_type?.trim() || "bearer",
      status: response.status,
    };
  }

  const errorPayload = payload as PythonChatInitErrorResponse | null;
  const message = getErrorMessage(response.status, errorPayload);

  console.error("[PythonBackend:init:error]", {
    status: response.status,
    message,
  });

  return {
    ok: false,
    status: response.status,
    message,
    retryable: isRetryableStatus(response.status),
  };
}

// ---------------------------------------------------------------------------
// Chat API — POST /api/v1/chat
// ---------------------------------------------------------------------------

/**
 * Sends a text message to the Python backend chat endpoint.
 *
 * @param request - The chat request containing message and thread_id.
 * @param accessToken - The access token obtained from /api/v1/chat/init.
 * @returns {Promise<PythonChatResult>} Success or failure result.
 */
export async function sendChatMessage(
  request: PythonChatRequest,
  accessToken: string,
): Promise<PythonChatResult> {
  let response: Response;
  try {
    response = await fetch(`${getPythonBackendBaseUrl()}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
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

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

const TENANT_OPERATION_ERROR =
  "Não foi possível concluir a operação. Tente novamente.";

function isTenantDeleteImpactItemList(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as { id?: unknown }).id === "string" &&
      typeof (item as { titulo?: unknown }).titulo === "string",
  );
}

function isTenantDeleteImpact(value: unknown): value is TenantDeleteImpact {
  if (!value || typeof value !== "object") return false;
  const impact = value as Partial<TenantDeleteImpact>;
  return (
    typeof impact.tenant_id === "string" &&
    isTenantDeleteImpactItemList(impact.prompts_to_delete) &&
    isTenantDeleteImpactItemList(impact.prompts_to_unlink_only) &&
    isTenantDeleteImpactItemList(impact.guardrails_to_delete) &&
    isTenantDeleteImpactItemList(impact.guardrails_to_unlink_only)
  );
}

function isTenant(value: unknown): value is Tenant {
  if (!value || typeof value !== "object") return false;
  const tenant = value as Partial<Tenant>;
  return (
    typeof tenant.id === "string" &&
    typeof tenant.name === "string" &&
    typeof tenant.google_calendar_id === "string" &&
    Array.isArray(tenant.allowed_domains) &&
    tenant.allowed_domains.every((domain) => typeof domain === "string") &&
    typeof tenant.scheduling_enabled === "boolean" &&
    typeof tenant.created_at === "string" &&
    (typeof tenant.updated_at === "string" || tenant.updated_at === null) &&
    (typeof tenant.deleted_at === "string" || tenant.deleted_at === null) &&
    (tenant.monthly_message_limit === null ||
      typeof tenant.monthly_message_limit === "number") &&
    Array.isArray(tenant.notification_emails) &&
    tenant.notification_emails.every((email) => typeof email === "string")
  );
}

function toTenantFieldErrors(
  fieldErrors: Record<string, string> | undefined,
): TenantFieldErrors | undefined {
  if (!fieldErrors) return undefined;
  const result: TenantFieldErrors = {};
  for (const [field, msg] of Object.entries(fieldErrors)) {
    if (
      field === "tenant_id" ||
      field === "name" ||
      field === "google_calendar_id" ||
      field === "allowed_domains" ||
      field === "prompt_id" ||
      field === "scheduling_enabled" ||
      field === "monthly_message_limit" ||
      field === "notification_emails"
    ) {
      result[field] = msg;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function tenantFailure(
  status: number,
  payload?: unknown,
): TenantOperationFailure {
  const normalized = normalizeApiError(status, payload);
  const fieldErrors = toTenantFieldErrors(normalized.fieldErrors);

  if (status === 404) {
    return {
      ok: false,
      status,
      code: normalized.code,
      message: "Tenant não encontrado",
      blockers: normalized.blockers,
      retryable: false,
    };
  }

  return {
    ok: false,
    status,
    code: normalized.code,
    message: fieldErrors
      ? "Revise os campos informados."
      : status === 0 || status === 502
        ? TENANT_OPERATION_ERROR
        : normalized.message,
    blockers: normalized.blockers,
    fieldErrors,
    retryable: normalized.retryable,
  };
}

async function requestTenant(
  path: string,
  init: RequestInit,
): Promise<TenantOperationResult> {
  let response: Response;
  try {
    response = await fetch(`${getPythonBackendBaseUrl()}${path}`, init);
  } catch {
    return tenantFailure(0);
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return tenantFailure(response.status, payload);
  if (!isTenant(payload)) return tenantFailure(502);
  return { ok: true, status: response.status, tenant: payload };
}

export function createTenant(
  input: TenantCreateInput,
  signal?: AbortSignal,
): Promise<TenantOperationResult> {
  return requestTenant("/api/v1/tenants/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenant_id: input.tenant_id,
      name: input.name,
      google_calendar_id: input.google_calendar_id,
      allowed_domains: input.allowed_domains,
      scheduling_enabled: input.scheduling_enabled,
      prompt_id: input.prompt_id,
      monthly_message_limit: input.monthly_message_limit ?? null,
      notification_emails: input.notification_emails ?? [],
    }),
    signal,
  });
}

export function getTenantById(
  tenantId: string,
  signal?: AbortSignal,
): Promise<TenantOperationResult> {
  return requestTenant(
    `/api/v1/tenants/${encodeURIComponent(tenantId)}`,
    { method: "GET", signal },
  );
}

export function updateTenant(
  tenantId: string,
  input: TenantWriteInput,
  signal?: AbortSignal,
): Promise<TenantOperationResult> {
  return requestTenant(
    `/api/v1/tenants/${encodeURIComponent(tenantId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        google_calendar_id: input.google_calendar_id,
        allowed_domains: input.allowed_domains,
        scheduling_enabled: input.scheduling_enabled,
        monthly_message_limit: input.monthly_message_limit ?? null,
        notification_emails: input.notification_emails ?? [],
      }),
      signal,
    },
  );
}

export async function deleteTenant(
  tenantId: string,
  signal?: AbortSignal,
): Promise<TenantDeleteResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/tenants/${encodeURIComponent(tenantId)}`,
      { method: "DELETE", signal },
    );
  } catch {
    return tenantFailure(0);
  }

  if (response.ok) return { ok: true, status: response.status };
  return tenantFailure(response.status, await parseJsonSafely(response));
}

export async function fetchTenantDeleteImpact(
  tenantId: string,
  signal?: AbortSignal,
): Promise<TenantDeleteImpactResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/tenants/${encodeURIComponent(tenantId)}/delete-impact`,
      { method: "GET", signal },
    );
  } catch {
    return tenantFailure(0);
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return tenantFailure(response.status, payload);
  if (!isTenantDeleteImpact(payload)) return tenantFailure(502);
  return { ok: true, status: response.status, data: payload };
}

// ---------------------------------------------------------------------------
// Tenant search — GET /tenants?q=&limit=
// ---------------------------------------------------------------------------

export async function searchTenants(
  term: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<TenantSearchResult> {
  const params = new URLSearchParams({ q: term, limit: String(limit) });

  let response: Response;
  try {
    response = await fetch(`${getPythonBackendBaseUrl()}/api/v1/tenants?${params.toString()}`, {
      method: "GET",
      signal,
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
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

  if (!Array.isArray(payload)) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou dados em formato inválido.",
      retryable: true,
    };
  }

  const tenants = (payload as unknown[]).filter(isTenant) as TenantSearchItem[];
  return { ok: true, status: response.status, tenants };
}

// ---------------------------------------------------------------------------
// Tenant grid — GET /tenants/list?q=&limit=&offset= (EDI-46)
// ---------------------------------------------------------------------------

function isPromptTagList(value: unknown): value is TenantGridPromptTag[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as { id?: unknown }).id === "string" &&
      typeof (item as { titulo?: unknown }).titulo === "string",
  );
}

function isGuardrailTagList(value: unknown): value is TenantGridGuardrailTag[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as { id?: unknown }).id === "string" &&
      typeof (item as { titulo?: unknown }).titulo === "string",
  );
}

function isTenantGridItem(value: unknown): value is TenantGridItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<TenantGridItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    isPromptTagList(item.prompts ?? []) &&
    isGuardrailTagList(item.guardrails ?? [])
  );
}

export type ListTenantsParams = {
  q?: string;
  limit?: number;
  offset?: number;
};

export async function listTenants(
  { q, limit = 20, offset = 0 }: ListTenantsParams = {},
  signal?: AbortSignal,
): Promise<TenantListResult> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);

  let response: Response;
  try {
    response = await fetch(`${getPythonBackendBaseUrl()}/api/v1/tenants/list?${params.toString()}`, {
      method: "GET",
      signal,
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
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

  const items = (payload as { items?: unknown } | null)?.items;
  const total = (payload as { total?: unknown } | null)?.total;
  if (!Array.isArray(items) || typeof total !== "number" || !items.every(isTenantGridItem)) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou dados em formato inválido.",
      retryable: true,
    };
  }

  return { ok: true, status: response.status, items, total };
}

// ---------------------------------------------------------------------------
// Knowledge base — GET/PUT/DELETE /tenants/{tenant_id}/knowledge-base
// ---------------------------------------------------------------------------

function isKnowledgeBase(value: unknown): value is KnowledgeBase {
  if (!value || typeof value !== "object") return false;
  const kb = value as Partial<KnowledgeBase>;
  return (
    typeof kb.tenant_id === "string" &&
    (typeof kb.content === "string" || kb.content === null) &&
    (typeof kb.updated_at === "string" || kb.updated_at === null)
  );
}

function getKnowledgeBaseFieldErrors(payload: unknown): { content?: string } | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const detail = (payload as { detail?: unknown }).detail;
  if (!Array.isArray(detail)) return undefined;
  for (const issue of detail) {
    if (!issue || typeof issue !== "object") continue;
    const { loc, msg } = issue as { loc?: unknown; msg?: unknown };
    if (Array.isArray(loc) && typeof msg === "string" && loc.at(-1) === "content") {
      return { content: msg };
    }
  }
  return undefined;
}

function knowledgeBaseFailure(status: number, payload?: unknown): KnowledgeBaseFailure {
  if (status === 404) {
    return { ok: false, status, message: "Tenant não encontrado.", retryable: false };
  }
  const fieldErrors = getKnowledgeBaseFieldErrors(payload);
  return {
    ok: false,
    status,
    message: fieldErrors ? "Revise o conteúdo informado." : getOperationErrorMessage(payload),
    fieldErrors,
    retryable: isRetryableStatus(status),
  };
}

async function requestKnowledgeBase(
  tenantId: string,
  init: RequestInit,
): Promise<KnowledgeBaseReadResult | KnowledgeBaseWriteResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/tenants/${encodeURIComponent(tenantId)}/knowledge-base`,
      init,
    );
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
      retryable: true,
    };
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return knowledgeBaseFailure(response.status, payload);
  if (!isKnowledgeBase(payload)) return knowledgeBaseFailure(502);
  return { ok: true, status: response.status, data: payload };
}

export function getKnowledgeBase(
  tenantId: string,
  signal?: AbortSignal,
): Promise<KnowledgeBaseReadResult> {
  return requestKnowledgeBase(tenantId, { method: "GET", signal });
}

export function saveKnowledgeBase(
  tenantId: string,
  content: string,
  signal?: AbortSignal,
): Promise<KnowledgeBaseWriteResult> {
  return requestKnowledgeBase(tenantId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    signal,
  });
}

export async function deleteKnowledgeBase(
  tenantId: string,
  signal?: AbortSignal,
): Promise<KnowledgeBaseDeleteResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/tenants/${encodeURIComponent(tenantId)}/knowledge-base`,
      { method: "DELETE", signal },
    );
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
      retryable: true,
    };
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return knowledgeBaseFailure(response.status, payload);

  const success = payload as { message?: unknown } | null;
  return {
    ok: true,
    status: response.status,
    message:
      typeof success?.message === "string" && success.message.trim()
        ? success.message.trim()
        : "Base de conhecimento removida com sucesso.",
  };
}

// ---------------------------------------------------------------------------
// Tenant usage — GET /tenants/{id}/usage (EDI-63)
// ---------------------------------------------------------------------------

function isTenantUsage(value: unknown): value is TenantUsage {
  if (!value || typeof value !== "object") return false;
  const usage = value as Partial<TenantUsage>;
  return (
    typeof usage.tenant_id === "string" &&
    (usage.monthly_message_limit === null || typeof usage.monthly_message_limit === "number") &&
    typeof usage.current_month_calls === "number" &&
    (usage.percentage_used === null || typeof usage.percentage_used === "number") &&
    typeof usage.blocked === "boolean"
  );
}

export async function getTenantUsage(
  tenantId: string,
  signal?: AbortSignal,
): Promise<TenantUsageResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/tenants/${encodeURIComponent(tenantId)}/usage`,
      { method: "GET", signal },
    );
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
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
  if (!isTenantUsage(payload)) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou dados de consumo em formato inválido.",
      retryable: true,
    };
  }
  return { ok: true, status: response.status, data: payload };
}

// ---------------------------------------------------------------------------
// Tenant message-limit config — GET /tenants/message-limit-config (EDI-63)
// ---------------------------------------------------------------------------

function isTenantMessageLimitConfig(value: unknown): value is TenantMessageLimitConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<TenantMessageLimitConfig>;
  return (
    typeof config.worst_case_calls_per_message === "number" &&
    typeof config.average_calls_per_message === "number"
  );
}

export async function getMessageLimitConfig(
  signal?: AbortSignal,
): Promise<TenantMessageLimitConfigResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/tenants/message-limit-config`,
      { method: "GET", signal },
    );
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
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
  if (!isTenantMessageLimitConfig(payload)) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou configuração em formato inválido.",
      retryable: true,
    };
  }
  return { ok: true, status: response.status, data: payload };
}

// ---------------------------------------------------------------------------
// Global notification recipients — CRUD /global-notification-recipients/ (EDI-63)
// ---------------------------------------------------------------------------

function isGlobalRecipient(value: unknown): value is GlobalRecipient {
  if (!value || typeof value !== "object") return false;
  const recipient = value as Partial<GlobalRecipient>;
  return (
    typeof recipient.id === "number" &&
    typeof recipient.email === "string" &&
    typeof recipient.active === "boolean" &&
    typeof recipient.created_at === "string"
  );
}

function globalRecipientFailure(status: number, payload?: unknown): GlobalRecipientFailure {
  if (status === 404) {
    return { ok: false, status, message: "Destinatário não encontrado.", retryable: false };
  }
  if (status === 409) {
    return {
      ok: false,
      status,
      code: "EMAIL_ALREADY_EXISTS",
      message: getOperationErrorMessage(payload),
      retryable: false,
    };
  }
  const normalized = normalizeApiError(status, payload);
  return {
    ok: false,
    status,
    message: normalized.message,
    retryable: normalized.retryable,
  };
}

export async function listGlobalRecipients(
  signal?: AbortSignal,
): Promise<GlobalRecipientListResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/global-notification-recipients/`,
      { method: "GET", signal },
    );
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "Solicitação cancelada."
          : NETWORK_ERROR_MSG,
      retryable: true,
    };
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return globalRecipientFailure(response.status, payload);
  if (!Array.isArray(payload) || !payload.every(isGlobalRecipient)) {
    return {
      ok: false,
      status: 502,
      message: "O serviço retornou dados em formato inválido.",
      retryable: true,
    };
  }
  return { ok: true, status: response.status, items: payload };
}

export async function createGlobalRecipient(
  email: string,
  signal?: AbortSignal,
): Promise<GlobalRecipientOperationResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/global-notification-recipients/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal,
      },
    );
  } catch {
    return globalRecipientFailure(0);
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return globalRecipientFailure(response.status, payload);
  if (!isGlobalRecipient(payload)) return globalRecipientFailure(502);
  return { ok: true, status: response.status, recipient: payload };
}

export async function updateGlobalRecipient(
  id: number,
  active: boolean,
  signal?: AbortSignal,
): Promise<GlobalRecipientOperationResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/global-notification-recipients/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
        signal,
      },
    );
  } catch {
    return globalRecipientFailure(0);
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) return globalRecipientFailure(response.status, payload);
  if (!isGlobalRecipient(payload)) return globalRecipientFailure(502);
  return { ok: true, status: response.status, recipient: payload };
}

export async function deleteGlobalRecipient(
  id: number,
  signal?: AbortSignal,
): Promise<GlobalRecipientDeleteResult> {
  let response: Response;
  try {
    response = await fetch(
      `${getPythonBackendBaseUrl()}/api/v1/global-notification-recipients/${id}`,
      { method: "DELETE", signal },
    );
  } catch {
    return globalRecipientFailure(0);
  }

  if (response.ok) return { ok: true, status: response.status };
  return globalRecipientFailure(response.status, await parseJsonSafely(response));
}
