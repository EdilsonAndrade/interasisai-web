import { normalizeApiError } from "./apiError";

describe("normalizeApiError", () => {
  it("normalizes the business-rule object format", () => {
    const result = normalizeApiError(409, {
      detail: {
        code: "PROMPT_IN_USE_BY_TENANTS",
        message: "Este prompt está em uso por 3 tenants.",
        blockers: [
          { type: "tenant", id: "acme", name: "Acme Ltda" },
          { type: "tenant", id: "beta" },
        ],
      },
    });

    expect(result).toEqual({
      status: 409,
      code: "PROMPT_IN_USE_BY_TENANTS",
      message: "Este prompt está em uso por 3 tenants.",
      blockers: [
        { type: "tenant", id: "acme", name: "Acme Ltda" },
        { type: "tenant", id: "beta" },
      ],
      retryable: false,
    });
  });

  it("normalizes the Pydantic validation list format into fieldErrors", () => {
    const result = normalizeApiError(422, {
      detail: [
        { loc: ["body", "prompt_id"], msg: "Field required", type: "missing" },
        { loc: ["body", "tenant_id"], msg: "Field required", type: "missing" },
      ],
    });

    expect(result.code).toBeUndefined();
    expect(result.blockers).toEqual([]);
    expect(result.fieldErrors).toEqual({
      prompt_id: "Field required",
      tenant_id: "Field required",
    });
    expect(result.retryable).toBe(false);
  });

  it("normalizes the legacy string detail format (500)", () => {
    const result = normalizeApiError(500, {
      detail: "DefaultPromptNotConfiguredError: prompt padrão ausente.",
    });

    expect(result.code).toBeUndefined();
    expect(result.message).toBe("DefaultPromptNotConfiguredError: prompt padrão ausente.");
    expect(result.blockers).toEqual([]);
    expect(result.retryable).toBe(true);
  });

  it("falls back to a usable message for a malformed or empty payload", () => {
    expect(normalizeApiError(500, null).message).toBe(
      "Erro interno do servidor. Tente novamente.",
    );
    expect(normalizeApiError(409, {}).message).toBe(
      "Operação conflitante. Verifique os vínculos.",
    );
    expect(normalizeApiError(404, { detail: {} }).message).toBe(
      "Item não encontrado.",
    );
  });

  it("treats an unknown code as undefined instead of breaking", () => {
    const result = normalizeApiError(409, {
      detail: { code: "SOMETHING_NEW", message: "Texto", blockers: [] },
    });
    expect(result.code).toBeUndefined();
    expect(result.message).toBe("Texto");
  });

  it("defaults blockers to an empty array when absent", () => {
    const result = normalizeApiError(404, {
      detail: { code: "PROMPT_NOT_FOUND", message: "Não encontrado" },
    });
    expect(result.blockers).toEqual([]);
  });

  it("marks network failure (status 0) as retryable with a connection message", () => {
    const result = normalizeApiError(0, null);
    expect(result.retryable).toBe(true);
    expect(result.message).toBe(
      "Não foi possível conectar ao servidor. Verifique sua conexão.",
    );
  });

  it("filters out malformed blocker entries", () => {
    const result = normalizeApiError(409, {
      detail: {
        code: "TENANT_NOT_FOUND",
        message: "x",
        blockers: [{ type: "tenant", id: "ok" }, { foo: "bar" }, null, "x"],
      },
    });
    expect(result.blockers).toEqual([{ type: "tenant", id: "ok" }]);
  });
});
