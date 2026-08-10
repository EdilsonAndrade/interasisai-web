// ============================================================================
// Prompt Manager API — HTTP service layer
// Endpoints: /prompt-manager/*
// Pattern: union types (ok/status/message), same as pythonBackend.ts
// ============================================================================

import type {
  Guardrail,
  GuardrailCreateInput,
  GuardrailUpdateInput,
  Prompt,
  PromptCreateInput,
  PromptUpdateInput,
  TenantLinkInput,
  TenantPromptDetail,
  GuardrailListResult,
  GuardrailSingleResult,
  PromptListResult,
  PromptSingleResult,
  TenantLinkResult,
  TenantPromptDetailResult,
  DeleteResult,
} from "./promptManager.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL?.trim();
  if (!url) {
    throw new Error(
      "Configuração do backend Python ausente: NEXT_PUBLIC_PYTHON_BACKEND_URL não está definida.",
    );
  }
  return url.replace(/\/$/, "");
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRetryableStatus(status: number): boolean {
  if (status === 0 || status === 408 || status === 429) return true;
  return status >= 500;
}

/**
 * Extracts a user-friendly error message from an API error payload.
 * NOTE: Does NOT log `conteudo` or `custom_content_override` values (FR-045).
 */
function getErrorMessage(status: number, payload: unknown): string {
  if (status === 0) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }

  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail.trim();
    }
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  if (status === 404) return "Item não encontrado.";
  if (status === 409) return "Operação conflitante. Verifique os vínculos.";
  if (status === 422) return "Dados inválidos. Verifique os campos.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";

  return "Não foi possível concluir a operação. Tente novamente.";
}

/**
 * Extracts field-level errors from a 422 validation error payload (FastAPI format).
 */
function extractFieldErrors(payload: unknown): Record<string, string> | undefined {
  if (!Array.isArray((payload as { detail?: unknown })?.detail)) return undefined;
  const detail = (payload as { detail: unknown[] }).detail;
  const fieldErrors: Record<string, string> = {};
  for (const item of detail) {
    if (item && typeof item === "object") {
      const loc = (item as { loc?: unknown[] }).loc;
      const msg = (item as { msg?: string }).msg;
      if (Array.isArray(loc) && loc.length >= 2 && typeof msg === "string") {
        const field = String(loc[loc.length - 1]);
        fieldErrors[field] = msg;
      }
    }
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

function isGuardrail(value: unknown): value is Guardrail {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Guardrail>;
  return (
    typeof v.id === "string" &&
    typeof v.titulo === "string" &&
    typeof v.conteudo === "string" &&
    typeof v.is_global === "boolean"
  );
}

function normalizePrompt(prompt: Prompt): Prompt {
  const guardrailsFromPrimary = Array.isArray(prompt.guardrails)
    ? prompt.guardrails.filter(isGuardrail)
    : [];
  const guardrailsFromAssociados = Array.isArray(prompt.guardrails_associados)
    ? prompt.guardrails_associados.filter(isGuardrail)
    : [];

  const guardrails =
    guardrailsFromPrimary.length > 0
      ? guardrailsFromPrimary
      : guardrailsFromAssociados;

  const guardrailIdsFromArray = Array.isArray(prompt.guardrail_ids)
    ? prompt.guardrail_ids.filter((id): id is string => typeof id === "string")
    : [];

  const guardrailIdsFromObjects = guardrails.map((g) => g.id);

  return {
    ...prompt,
    guardrails,
    guardrails_associados: guardrailsFromAssociados,
    guardrail_ids:
      guardrailIdsFromArray.length > 0
        ? guardrailIdsFromArray
        : guardrailIdsFromObjects,
  };
}

async function requestPromptManager<T>(
  path: string,
  init: RequestInit,
  isArray: boolean,
): Promise<
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string>; retryable: boolean }
> {
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch (error) {
    const isAborted = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      status: 0,
      message: isAborted
        ? "Solicitação cancelada."
        : "Não foi possível conectar ao servidor. Verifique sua conexão.",
      retryable: !isAborted,
    };
  }

  const payload = await parseJsonSafely(response);

  if (response.ok) {
    if (isArray && !Array.isArray(payload)) {
      return {
        ok: false,
        status: 502,
        message: "O serviço retornou dados em formato inválido.",
        retryable: true,
      };
    }
    return { ok: true, status: response.status, data: (payload ?? []) as T };
  }

  const message = getErrorMessage(response.status, payload);
  const fieldErrors = response.status === 422 ? extractFieldErrors(payload) : undefined;

  console.error("[PromptManager:error]", {
    status: response.status,
    endpoint: path,
    method: init.method ?? "GET",
    // FR-045: não logar conteudo/custom_content_override
  });

  return {
    ok: false,
    status: response.status,
    message,
    fieldErrors,
    retryable: isRetryableStatus(response.status),
  };
}

// ---------------------------------------------------------------------------
// Guardrails
// ---------------------------------------------------------------------------

export function fetchGuardrails(signal?: AbortSignal): Promise<GuardrailListResult> {
  return requestPromptManager<Guardrail[]>("/api/v1/prompt-manager/guardrails", { signal }, true);
}

export function createGuardrail(
  input: GuardrailCreateInput,
  signal?: AbortSignal,
): Promise<GuardrailSingleResult> {
  return requestPromptManager<Guardrail>("/api/v1/prompt-manager/guardrails", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  }, false);
}

export function updateGuardrail(
  id: string,
  input: GuardrailUpdateInput,
  signal?: AbortSignal,
): Promise<GuardrailSingleResult> {
  return requestPromptManager<Guardrail>(`/api/v1/prompt-manager/guardrails/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
    signal,
  }, false);
}

export function deleteGuardrail(id: string, signal?: AbortSignal): Promise<DeleteResult> {
  return requestPromptManager<null>(`/api/v1/prompt-manager/guardrails/${encodeURIComponent(id)}`, {
    method: "DELETE",
    signal,
  }, false);
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export function fetchPrompts(signal?: AbortSignal): Promise<PromptListResult> {
  return requestPromptManager<Prompt[]>("/api/v1/prompt-manager/prompts", { signal }, true).then((result) => {
    if (!result.ok) return result;
    return {
      ...result,
      data: result.data.map(normalizePrompt),
    };
  });
}

export function createPrompt(
  input: PromptCreateInput,
  signal?: AbortSignal,
): Promise<PromptSingleResult> {
  return requestPromptManager<Prompt>("/api/v1/prompt-manager/prompts", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  }, false).then((result) => {
    if (!result.ok) return result;
    return {
      ...result,
      data: normalizePrompt(result.data),
    };
  });
}

export function updatePrompt(
  id: string,
  input: PromptUpdateInput,
  signal?: AbortSignal,
): Promise<PromptSingleResult> {
  return requestPromptManager<Prompt>(`/api/v1/prompt-manager/prompts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
    signal,
  }, false).then((result) => {
    if (!result.ok) return result;
    return {
      ...result,
      data: normalizePrompt(result.data),
    };
  });
}

export function deletePrompt(id: string, signal?: AbortSignal): Promise<DeleteResult> {
  return requestPromptManager<null>(`/api/v1/prompt-manager/prompts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    signal,
  }, false);
}

// ---------------------------------------------------------------------------
// Tenant Prompt Detail
// ---------------------------------------------------------------------------

export function fetchTenantPromptDetail(
  tenantId: string,
  signal?: AbortSignal,
): Promise<TenantPromptDetailResult> {
  return requestPromptManager<TenantPromptDetail>(
    `/api/v1/prompt-manager/tenant/${encodeURIComponent(tenantId)}`,
    { signal },
    false,
  );
}

export function linkTenantToPrompt(
  input: TenantLinkInput,
  signal?: AbortSignal,
): Promise<TenantLinkResult> {
  const body: Record<string, unknown> = {
    tenant_id: input.tenant_id,
    prompt_id: input.prompt_id,
  };
  if (input.custom_content_override) {
    body.custom_content_override = input.custom_content_override;
  }
  return requestPromptManager<null>("/api/v1/prompt-manager/link-tenant", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  }, false);
}
