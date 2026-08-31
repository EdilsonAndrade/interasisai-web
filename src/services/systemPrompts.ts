// ============================================================================
// System Prompts API — HTTP service layer
// Endpoints: /api/v1/system-prompts/*
// Pattern: union types (ok/status/message), same as promptManager.ts
// ============================================================================

import { normalizeApiError } from "@/lib/apiError";
import type {
  SystemPrompt,
  SystemPromptKey,
  SystemPromptUpdateInput,
  SystemPromptListResult,
  SystemPromptSingleResult,
  SystemPromptsResult,
} from "./systemPrompts.types";

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

async function requestSystemPrompts<T>(
  path: string,
  init: RequestInit,
  isArray: boolean,
): Promise<SystemPromptsResult<T>> {
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

  // FR-021: não logar o conteudo dos prompts — apenas prompt_key/status/endpoint.
  const normalized = normalizeApiError(response.status, payload);

  console.error("[SystemPrompts:error]", {
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
// Endpoints
// ---------------------------------------------------------------------------

export function fetchSystemPrompts(signal?: AbortSignal): Promise<SystemPromptListResult> {
  return requestSystemPrompts<SystemPrompt[]>("/api/v1/system-prompts", { signal }, true);
}

export function fetchSystemPrompt(
  promptKey: SystemPromptKey | string,
  signal?: AbortSignal,
): Promise<SystemPromptSingleResult> {
  return requestSystemPrompts<SystemPrompt>(
    `/api/v1/system-prompts/${encodeURIComponent(promptKey)}`,
    { signal },
    false,
  );
}

export function updateSystemPrompt(
  promptKey: SystemPromptKey | string,
  input: SystemPromptUpdateInput,
  signal?: AbortSignal,
): Promise<SystemPromptSingleResult> {
  return requestSystemPrompts<SystemPrompt>(
    `/api/v1/system-prompts/${encodeURIComponent(promptKey)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      signal,
    },
    false,
  );
}

export function rollbackSystemPrompt(
  promptKey: SystemPromptKey | string,
  signal?: AbortSignal,
): Promise<SystemPromptSingleResult> {
  return requestSystemPrompts<SystemPrompt>(
    `/api/v1/system-prompts/${encodeURIComponent(promptKey)}/rollback`,
    {
      method: "POST",
      signal,
    },
    false,
  );
}
