// ============================================================================
// Follow-up Admin API Client (EDI-65 / EDI-53)
// Wraps fetch for GET/PATCH follow-up-queue, conversation-history and tenant
// oferta/retention config. Reuses the same Python backend origin as
// pythonBackend.ts (NEXT_PUBLIC_PYTHON_BACKEND_URL).
// ============================================================================

import { getPythonBackendBaseUrl } from "./pythonBackend";
import type {
  FollowUpStatus,
  SessionOutcome,
  FollowUpQueueResult,
  FollowUpQueueGlobalResult,
  UpdateFollowUpRequest,
  UpdateFollowUpResult,
  ConversationHistoryResult,
  FollowUpTenantConfig,
  FollowUpTenantConfigResult,
  FollowUpTenantListResult,
} from "./followUpApi.types";

const NETWORK_ERROR_MSG = "Não foi possível se conectar ao serviço de follow-up.";
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

function isRetryableStatus(status: number): boolean {
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

function errorMessageFromPayload(status: number, payload: unknown): string {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail.trim();
  }
  if (status === 0) return NETWORK_ERROR_MSG;
  if (status === 404) return "Registro não encontrado.";
  if (status === 422) return "Dados inválidos. Verifique os campos.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return "Não foi possível concluir a operação. Tente novamente.";
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${getPythonBackendBaseUrl()}/api/v1${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function requestFollowUp<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number; message: string; retryable: boolean }> {
  let attempt = 0;

  while (true) {
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
      });
    } catch {
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_BASE_DELAY_MS * 2 ** attempt));
        attempt += 1;
        continue;
      }
      return { ok: false, status: 0, message: NETWORK_ERROR_MSG, retryable: true };
    }

    if (response.ok) {
      const payload = (await parseJsonSafely(response)) as T;
      return { ok: true, status: response.status, data: payload };
    }

    if (isRetryableStatus(response.status) && attempt < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_BASE_DELAY_MS * 2 ** attempt));
      attempt += 1;
      continue;
    }

    const payload = await parseJsonSafely(response);
    return {
      ok: false,
      status: response.status,
      message: errorMessageFromPayload(response.status, payload),
      retryable: isRetryableStatus(response.status),
    };
  }
}

export function getFollowUpQueue(
  tenantId: string,
  status?: FollowUpStatus,
  outcome?: SessionOutcome
): Promise<FollowUpQueueResult> {
  return requestFollowUp(buildUrl(`/tenants/${encodeURIComponent(tenantId)}/follow-up-queue`, { status, outcome }));
}

export function getFollowUpQueueGlobal(
  tenantId?: string,
  status?: FollowUpStatus,
  outcome?: SessionOutcome
): Promise<FollowUpQueueGlobalResult> {
  return requestFollowUp(buildUrl("/follow-up-queue", { tenant_id: tenantId, status, outcome }));
}

export function updateFollowUpQueueEntry(
  tenantId: string,
  entryId: number,
  request: UpdateFollowUpRequest
): Promise<UpdateFollowUpResult> {
  return requestFollowUp(
    buildUrl(`/tenants/${encodeURIComponent(tenantId)}/follow-up-queue/${entryId}`),
    { method: "PATCH", body: JSON.stringify(request) }
  );
}

export function getConversationHistory(
  tenantId: string,
  baseThreadId: string,
  limit = 200,
  before?: string
): Promise<ConversationHistoryResult> {
  return requestFollowUp(
    buildUrl(`/tenants/${encodeURIComponent(tenantId)}/conversation-history/${encodeURIComponent(baseThreadId)}`, {
      limit,
      before,
    })
  );
}

export function getFollowUpTenantConfig(tenantId: string): Promise<FollowUpTenantConfigResult> {
  return requestFollowUp(buildUrl(`/tenants/${encodeURIComponent(tenantId)}`));
}

export function updateFollowUpTenantConfig(
  tenantId: string,
  config: FollowUpTenantConfig
): Promise<FollowUpTenantConfigResult> {
  return requestFollowUp(buildUrl(`/tenants/${encodeURIComponent(tenantId)}`), {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export function listFollowUpTenants(q?: string, limit = 50, offset = 0): Promise<FollowUpTenantListResult> {
  return requestFollowUp(buildUrl("/tenants", { q, limit, offset }));
}
