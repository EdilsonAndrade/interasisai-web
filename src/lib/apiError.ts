// ============================================================================
// apiError — normaliza os três formatos de `detail` retornados pelo backend
// (objeto de regra de negócio, lista de validação Pydantic, string legada)
// em um único ApiError. Todo consumidor decide o fluxo por `code`, nunca por
// `message` (FR-032/FR-033).
// ============================================================================

export type ApiErrorCode =
  | "PROMPT_NOT_FOUND"
  | "PROMPT_NODE_TYPE_INVALID"
  | "PROMPT_IN_USE_BY_TENANTS"
  | "GUARDRAIL_IS_GLOBAL"
  | "GUARDRAIL_IN_USE_BY_TENANTS"
  | "TENANT_NOT_FOUND";

const KNOWN_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  "PROMPT_NOT_FOUND",
  "PROMPT_NODE_TYPE_INVALID",
  "PROMPT_IN_USE_BY_TENANTS",
  "GUARDRAIL_IS_GLOBAL",
  "GUARDRAIL_IN_USE_BY_TENANTS",
  "TENANT_NOT_FOUND",
]);

export type Blocker = {
  type: "tenant" | "prompt";
  id: string;
  name?: string;
  tenant_count?: number;
};

export type ApiError = {
  status: number;
  code?: ApiErrorCode;
  message: string;
  blockers: Blocker[];
  fieldErrors?: Record<string, string>;
  retryable: boolean;
};

function isRetryableStatus(status: number): boolean {
  if (status === 0 || status === 408 || status === 429) return true;
  return status >= 500;
}

function fallbackMessage(status: number): string {
  if (status === 0) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }
  if (status === 404) return "Item não encontrado.";
  if (status === 409) return "Operação conflitante. Verifique os vínculos.";
  if (status === 422) return "Dados inválidos. Verifique os campos.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return "Não foi possível concluir a operação. Tente novamente.";
}

function isBlocker(value: unknown): value is Blocker {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Blocker>;
  return (v.type === "tenant" || v.type === "prompt") && typeof v.id === "string";
}

function extractBlockers(value: unknown): Blocker[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isBlocker);
}

function extractFieldErrorsFromPydanticList(
  detail: unknown[],
): Record<string, string> | undefined {
  const fieldErrors: Record<string, string> = {};
  for (const item of detail) {
    if (item && typeof item === "object") {
      const loc = (item as { loc?: unknown }).loc;
      const msg = (item as { msg?: unknown }).msg;
      if (Array.isArray(loc) && loc.length > 0 && typeof msg === "string") {
        const field = String(loc[loc.length - 1]);
        fieldErrors[field] = msg;
      }
    }
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/**
 * Reduz os três formatos de `detail` em uso pelo backend a uma estrutura
 * única. `blockers` nunca é undefined — ausente no payload vira `[]`.
 */
export function normalizeApiError(status: number, payload: unknown): ApiError {
  const retryable = isRetryableStatus(status);

  if (status === 0) {
    return { status, message: fallbackMessage(status), blockers: [], retryable };
  }

  const detail =
    payload && typeof payload === "object"
      ? (payload as { detail?: unknown }).detail
      : undefined;

  // Formato 1 — objeto de regra de negócio {code, message, blockers}
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const d = detail as { code?: unknown; message?: unknown; blockers?: unknown };
    const code =
      typeof d.code === "string" && KNOWN_CODES.has(d.code)
        ? (d.code as ApiErrorCode)
        : undefined;
    const message =
      typeof d.message === "string" && d.message.trim()
        ? d.message.trim()
        : fallbackMessage(status);
    return { status, code, message, blockers: extractBlockers(d.blockers), retryable };
  }

  // Formato 2 — lista de erros de validação Pydantic (422)
  if (Array.isArray(detail)) {
    return {
      status,
      message: fallbackMessage(status),
      blockers: [],
      fieldErrors: extractFieldErrorsFromPydanticList(detail),
      retryable,
    };
  }

  // Formato 3 — string legada (ex.: 500 DefaultPromptNotConfiguredError)
  if (typeof detail === "string" && detail.trim()) {
    return { status, message: detail.trim(), blockers: [], retryable };
  }

  // Sem `detail` reconhecível — tenta `message` solto, senão cai no fallback
  const looseMessage =
    payload && typeof payload === "object"
      ? (payload as { message?: unknown }).message
      : undefined;
  const message =
    typeof looseMessage === "string" && looseMessage.trim()
      ? looseMessage.trim()
      : fallbackMessage(status);
  return { status, message, blockers: [], retryable };
}
