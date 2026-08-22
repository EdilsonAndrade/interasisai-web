// ============================================================================
// Prompt Manager API — HTTP service layer
// Endpoints: /prompt-manager/*
// Pattern: union types (ok/status/message), same as pythonBackend.ts
// ============================================================================

import { normalizeApiError } from "@/lib/apiError";
import type {
  Guardrail,
  GuardrailCreateInput,
  GuardrailUpdateInput,
  NodeType,
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
  PromptManagerResult,
  BulkTenantLinkInput,
  BulkTenantLinkResponse,
  PromptTenantsResponse,
  PromptTenantsResult,
  BulkTenantLinkResult,
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
): Promise<PromptManagerResult<T>> {
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
      blockers: [],
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
        blockers: [],
        retryable: true,
      };
    }
    return { ok: true, status: response.status, data: (payload ?? []) as T };
  }

  // FR-045/FR-039: não logar conteudo/custom_content_override.
  const normalized = normalizeApiError(response.status, payload);

  console.error("[PromptManager:error]", {
    status: response.status,
    endpoint: path,
    method: init.method ?? "GET",
    code: normalized.code,
  });

  return {
    ok: false,
    status: response.status,
    code: normalized.code,
    message: normalized.message,
    blockers: normalized.blockers,
    fieldErrors: normalized.fieldErrors,
    retryable: normalized.retryable,
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

export function fetchPrompts(
  signal?: AbortSignal,
  nodeType?: NodeType,
): Promise<PromptListResult> {
  const query = nodeType ? `?node_type=${encodeURIComponent(nodeType)}` : "";
  return requestPromptManager<Prompt[]>(`/api/v1/prompt-manager/prompts${query}`, { signal }, true).then((result) => {
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
  nodeType?: NodeType,
  signal?: AbortSignal,
): Promise<TenantPromptDetailResult> {
  const query = nodeType ? `?node_type=${encodeURIComponent(nodeType)}` : "";
  return requestPromptManager<TenantPromptDetail>(
    `/api/v1/prompt-manager/tenant/${encodeURIComponent(tenantId)}${query}`,
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

// ---------------------------------------------------------------------------
// Bulk tenant link (US3)
// ---------------------------------------------------------------------------

export function fetchPromptTenants(
  promptId: string,
  signal?: AbortSignal,
): Promise<PromptTenantsResult> {
  return requestPromptManager<PromptTenantsResponse>(
    `/api/v1/prompt-manager/prompts/${encodeURIComponent(promptId)}/tenants`,
    { signal },
    false,
  );
}

export function linkTenantsBulk(
  input: BulkTenantLinkInput,
  signal?: AbortSignal,
): Promise<BulkTenantLinkResult> {
  const body: Record<string, unknown> = {
    prompt_id: input.prompt_id,
    tenant_ids: input.tenant_ids,
  };
  if (input.custom_content_override) {
    body.custom_content_override = input.custom_content_override;
  }
  return requestPromptManager<BulkTenantLinkResponse>("/api/v1/prompt-manager/link-tenants", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  }, false);
}
