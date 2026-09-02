// ============================================================================
// Tests: pythonBackend — HTTP client for Python Agendamento IA
// ============================================================================

import {
  createWhatsAppInstance,
  fetchTenantDeleteImpact,
  getPythonBackendConfig,
  getWhatsAppQrCode,
  initializeChatSession,
  listTenants,
  sendChatMessage,
  searchTenants,
  getKnowledgeBase,
  saveKnowledgeBase,
  deleteKnowledgeBase,
  listKnowledgeBaseItems,
  getKnowledgeBaseItem,
  uploadKnowledgeBaseItems,
  updateKnowledgeBaseItemContent,
  replaceKnowledgeBaseItemFile,
  deleteKnowledgeBaseItem,
} from "./pythonBackend";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createMockResponse(
  status: number,
  payload: unknown,
): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

const fetchMock = jest.fn();

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

describe("pythonBackend", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    // Set required env vars for all tests
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
    process.env.NEXT_PUBLIC_TENANT_ID = "test-tenant-123";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_TENANT_ID;
  });

  // -----------------------------------------------------------------------
  // getPythonBackendConfig
  // -----------------------------------------------------------------------

  describe("getPythonBackendConfig", () => {
    it("returns config when both env vars are set", () => {
      const config = getPythonBackendConfig();
      expect(config).toEqual({
        baseUrl: "http://test-api.example.com",
        tenantId: "test-tenant-123",
      });
    });

    it("throws when NEXT_PUBLIC_PYTHON_BACKEND_URL is missing", () => {
      delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
      expect(() => getPythonBackendConfig()).toThrow(
        "NEXT_PUBLIC_PYTHON_BACKEND_URL",
      );
    });

    it("throws when NEXT_PUBLIC_TENANT_ID is missing", () => {
      delete process.env.NEXT_PUBLIC_TENANT_ID;
      expect(() => getPythonBackendConfig()).toThrow(
        "NEXT_PUBLIC_TENANT_ID",
      );
    });
  });

  // -----------------------------------------------------------------------
  // sendChatMessage — Success
  // -----------------------------------------------------------------------

  describe("sendChatMessage", () => {
    it("sends POST with correct body, headers, and endpoint", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "test-tenant-123",
          status: "success",
          response: "Olá! Como posso ajudar?",
        }),
      );

      const result = await sendChatMessage(
        { message: "Oi", thread_id: "550e8400-e29b-41d4-a716-446655440000" },
        "test-access-token",
      );

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect(url).toBe("http://test-api.example.com/api/v1/chat");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
        "Authorization": "Bearer test-access-token",
      });

      const body = JSON.parse(options.body as string);
      expect(body).toEqual({
        message: "Oi",
        thread_id: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result).toEqual({
        ok: true,
        reply: "Olá! Como posso ajudar?",
        status: 200,
      });
    });

    it("extracts response field from success payload", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "xyz",
          status: "success",
          response: "Resposta da IA",
        }),
      );

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result).toEqual({
        ok: true,
        reply: "Resposta da IA",
        status: 200,
      });
    });

    it("uses fallback reply when response field is empty", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "xyz",
          status: "success",
          response: "",
        }),
      );

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result.ok).toBe(true);
      expect(result.reply).toBe(
        "Recebemos sua mensagem e já estamos processando.",
      );
    });

    it("uses fallback when response field is missing", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "xyz",
          status: "success",
        } as Record<string, unknown>),
      );

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result.ok).toBe(true);
      expect(result.reply).toBe(
        "Recebemos sua mensagem e já estamos processando.",
      );
    });

    // -------------------------------------------------------------------
    // sendChatMessage — Errors
    // -------------------------------------------------------------------

    it("handles HTTP 504 with timeout message", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(504, {
          detail: "O serviço de atendimento demorou.",
        }),
      );

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result).toEqual({
        ok: false,
        status: 504,
        message:
          "O serviço de atendimento demorou para responder. Por favor, tente novamente em instantes.",
        retryable: true,
      });
    });

    it("handles HTTP 500 with internal error message", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(500, {
          detail: "Erro no motor de IA.",
        }),
      );

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result).toEqual({
        ok: false,
        status: 500,
        message:
          "Erro interno no motor de IA. Nossa equipe foi notificada.",
        retryable: true,
      });
    });

    it("handles network failure (fetch rejection)", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result).toEqual({
        ok: false,
        status: 0,
        message:
          "Não foi possível se conectar ao serviço de mensagens.",
        retryable: true,
      });
    });

    it("handles HTTP 400 with detail message from body", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(400, {
          detail: "Mensagem inválida.",
        }),
      );

      const result = await sendChatMessage(
        { message: "test", thread_id: "uuid" },
        "xyz",
      );

      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe("Mensagem inválida.");
      expect(result.retryable).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // initializeChatSession
  // -----------------------------------------------------------------------

  describe("initializeChatSession", () => {
    it("sends GET with X-Tenant-ID header and returns the access token", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          access_token: "eyJhbGciOi...",
          token_type: "bearer",
        }),
      );

      const result = await initializeChatSession("test-tenant-123");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect(url).toBe("http://test-api.example.com/api/v1/chat/init");
      expect(options.method).toBe("GET");
      expect(options.headers).toEqual({ "X-Tenant-ID": "test-tenant-123" });
      expect(result).toEqual({
        ok: true,
        accessToken: "eyJhbGciOi...",
        tokenType: "bearer",
        status: 200,
      });
    });

    it("falls back token_type to bearer when missing", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, { access_token: "abc" }),
      );

      const result = await initializeChatSession("t");

      expect(result).toEqual({
        ok: true,
        accessToken: "abc",
        tokenType: "bearer",
        status: 200,
      });
    });

    it("rejects a response without access_token", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, {}));

      const result = await initializeChatSession("t");

      expect(result).toEqual(
        expect.objectContaining({ ok: false, status: 502, retryable: true }),
      );
    });

    it("handles HTTP 401 error with detail from body", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(401, { detail: "Tenant inválido." }),
      );

      const result = await initializeChatSession("t");

      expect(result).toEqual({
        ok: false,
        status: 401,
        message: "Tenant inválido.",
        retryable: false,
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const result = await initializeChatSession("t");

      expect(result).toEqual({
        ok: false,
        status: 0,
        message:
          "Não foi possível se conectar ao serviço de mensagens.",
        retryable: true,
      });
    });
  });

  // -----------------------------------------------------------------------
  // searchTenants — GET /tenants?q=&limit=
  // -----------------------------------------------------------------------

  describe("searchTenants", () => {
    const tenant = {
      id: "1234",
      name: "Barbearia Central",
      google_calendar_id: "abc@group.calendar.google.com",
      allowed_domains: ["barbeariacentral.com.br"],
      created_at: "2026-01-10T12:00:00Z",
      updated_at: null,
      deleted_at: null,
    };

    it("sends GET with the term and default limit, returns the tenant list", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, [tenant]));

      const result = await searchTenants("Barbearia");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants?q=Barbearia&limit=20",
      );
      expect(options.method).toBe("GET");
      expect(result).toEqual({ ok: true, status: 200, tenants: [tenant] });
    });

    it("treats an empty result list as a valid success", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, []));

      const result = await searchTenants("termo-sem-resultado");

      expect(result).toEqual({ ok: true, status: 200, tenants: [] });
    });

    it("normalizes a 401 failure", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(401, { detail: "Token inválido" }),
      );

      const result = await searchTenants("qualquer");

      expect(result).toEqual({
        ok: false,
        status: 401,
        message: "Token inválido",
        retryable: false,
      });
    });

    it("normalizes a 422 failure (empty q)", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(422, { detail: "q é obrigatório" }),
      );

      const result = await searchTenants("");

      expect(result).toEqual({
        ok: false,
        status: 422,
        message: "q é obrigatório",
        retryable: false,
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await searchTenants("qualquer");

      expect(result).toEqual({
        ok: false,
        status: 0,
        message: "Não foi possível se conectar ao serviço de mensagens.",
        retryable: true,
      });
    });
  });

  // -----------------------------------------------------------------------
  // fetchTenantDeleteImpact — GET /tenants/{id}/delete-impact (EDI-45)
  // -----------------------------------------------------------------------

  describe("fetchTenantDeleteImpact", () => {
    const impact = {
      tenant_id: "tenant-1",
      prompts_to_delete: [{ id: "p1", titulo: "Prompt exclusivo", node_type: "operational" }],
      prompts_to_unlink_only: [{ id: "p2", titulo: "Prompt compartilhado" }],
      guardrails_to_delete: [{ id: "g1", titulo: "Guardrail exclusivo" }],
      guardrails_to_unlink_only: [{ id: "g2", titulo: "Guardrail global", is_global: true }],
    };

    it("returns the four impact groups on success", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, impact));

      const result = await fetchTenantDeleteImpact("tenant-1");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("http://test-api.example.com/api/v1/tenants/tenant-1/delete-impact");
      expect(options.method).toBe("GET");
      expect(result).toEqual({ ok: true, status: 200, data: impact });
    });

    it("normalizes a 404 as tenant not found", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(404, { detail: { code: "TENANT_NOT_FOUND", message: "x", blockers: [] } }),
      );

      const result = await fetchTenantDeleteImpact("missing-tenant");

      expect(result).toEqual({
        ok: false,
        status: 404,
        code: "TENANT_NOT_FOUND",
        message: "Tenant não encontrado",
        blockers: [],
        retryable: false,
      });
    });

    it("treats a malformed payload as a 502 failure", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { unexpected: true }));

      const result = await fetchTenantDeleteImpact("tenant-1");

      expect(result).toEqual({
        ok: false,
        status: 502,
        code: undefined,
        message: "Não foi possível concluir a operação. Tente novamente.",
        blockers: [],
        retryable: true,
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await fetchTenantDeleteImpact("tenant-1");

      expect(result).toEqual({
        ok: false,
        status: 0,
        code: undefined,
        message: "Não foi possível concluir a operação. Tente novamente.",
        blockers: [],
        retryable: true,
      });
    });
  });

  // -----------------------------------------------------------------------
  // listTenants — GET /tenants/list?q=&limit=&offset= (EDI-46)
  // -----------------------------------------------------------------------

  describe("listTenants", () => {
    const gridItem = {
      id: "tenant-1",
      name: "Acme Barbearia",
      google_calendar_id: "cal@x",
      allowed_domains: ["acme.com.br"],
      created_at: "2026-01-10T12:00:00Z",
      updated_at: null,
      prompts: [{ id: "p1", titulo: "Prompt", node_type: "operational" }],
      guardrails: [{ id: "g1", titulo: "Guardrail", is_global: true }],
    };

    it("lists all tenants with default limit/offset when no params are given", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { items: [gridItem], total: 1 }));

      const result = await listTenants();

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("http://test-api.example.com/api/v1/tenants/list?limit=20&offset=0");
      expect(options.method).toBe("GET");
      expect(result).toEqual({ ok: true, status: 200, items: [gridItem], total: 1 });
    });

    it("sends q, limit and offset when provided", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { items: [], total: 0 }));

      await listTenants({ q: "acme", limit: 10, offset: 20 });

      const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("http://test-api.example.com/api/v1/tenants/list?limit=10&offset=20&q=acme");
    });

    it("treats an empty result list as a valid success", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { items: [], total: 0 }));

      const result = await listTenants();

      expect(result).toEqual({ ok: true, status: 200, items: [], total: 0 });
    });

    it("normalizes a failure response", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(500, { detail: "Erro interno" }));

      const result = await listTenants();

      expect(result).toEqual({
        ok: false,
        status: 500,
        message: "Erro interno",
        retryable: true,
      });
    });

    it("treats a malformed payload as a 502 failure", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { unexpected: true }));

      const result = await listTenants();

      expect(result).toEqual({
        ok: false,
        status: 502,
        message: "O serviço retornou dados em formato inválido.",
        retryable: true,
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await listTenants();

      expect(result).toEqual({
        ok: false,
        status: 0,
        message: "Não foi possível se conectar ao serviço de mensagens.",
        retryable: true,
      });
    });
  });

  // -----------------------------------------------------------------------
  // Knowledge base — GET/PUT/DELETE /tenants/{tenant_id}/knowledge-base
  // -----------------------------------------------------------------------

  describe("getKnowledgeBase", () => {
    it("returns the current content", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "1234",
          content: "Regra: o barbeiro Lucas atende...",
          updated_at: "2026-08-19T10:00:00Z",
        }),
      );

      const result = await getKnowledgeBase("1234");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base",
      );
      expect(options.method).toBe("GET");
      expect(result).toEqual({
        ok: true,
        status: 200,
        data: {
          tenant_id: "1234",
          content: "Regra: o barbeiro Lucas atende...",
          updated_at: "2026-08-19T10:00:00Z",
        },
      });
    });

    it("treats content: null as a valid (empty) state", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, { tenant_id: "1234", content: null, updated_at: null }),
      );

      const result = await getKnowledgeBase("1234");

      expect(result).toEqual({
        ok: true,
        status: 200,
        data: { tenant_id: "1234", content: null, updated_at: null },
      });
    });

    it("normalizes a 404 (tenant not found)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(404, { detail: "not found" }));

      const result = await getKnowledgeBase("missing");

      expect(result).toEqual({
        ok: false,
        status: 404,
        message: "Tenant não encontrado.",
        retryable: false,
      });
    });

    it("encodes the tenant id in the URL", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, { tenant_id: "a/b", content: null, updated_at: null }),
      );

      await getKnowledgeBase("a/b");

      const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/a%2Fb/knowledge-base",
      );
    });
  });

  describe("saveKnowledgeBase", () => {
    it("sends PUT with the content body and returns the saved document", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "1234",
          content: "novo conteúdo",
          updated_at: "2026-08-19T10:05:00Z",
        }),
      );

      const result = await saveKnowledgeBase("1234", "novo conteúdo");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base",
      );
      expect(options.method).toBe("PUT");
      expect(options.headers).toEqual({ "Content-Type": "application/json" });
      expect(JSON.parse(options.body as string)).toEqual({ content: "novo conteúdo" });
      expect(result.ok).toBe(true);
    });

    it("normalizes a 422 (empty content) with a field error", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(422, {
          detail: [{ loc: ["body", "content"], msg: "content não pode estar vazio" }],
        }),
      );

      const result = await saveKnowledgeBase("1234", "");

      expect(result).toEqual({
        ok: false,
        status: 422,
        message: "Revise o conteúdo informado.",
        fieldErrors: { content: "content não pode estar vazio" },
        retryable: false,
      });
    });

    it("normalizes a 404 (tenant not found)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(404, { detail: "not found" }));

      const result = await saveKnowledgeBase("missing", "texto");

      expect(result).toEqual({
        ok: false,
        status: 404,
        message: "Tenant não encontrado.",
        retryable: false,
      });
    });
  });

  describe("deleteKnowledgeBase", () => {
    it("sends DELETE and returns the confirmation message", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          tenant_id: "1234",
          message: "Base de conhecimento removida com sucesso.",
        }),
      );

      const result = await deleteKnowledgeBase("1234");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base",
      );
      expect(options.method).toBe("DELETE");
      expect(result).toEqual({
        ok: true,
        status: 200,
        message: "Base de conhecimento removida com sucesso.",
      });
    });

    it("normalizes a 404 (tenant not found, or nothing to delete)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(404, { detail: "not found" }));

      const result = await deleteKnowledgeBase("1234");

      expect(result).toEqual({
        ok: false,
        status: 404,
        message: "Tenant não encontrado.",
        retryable: false,
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await deleteKnowledgeBase("1234");

      expect(result).toEqual({
        ok: false,
        status: 0,
        message: "Não foi possível se conectar ao serviço de mensagens.",
        retryable: true,
      });
    });
  });

  describe("listKnowledgeBaseItems", () => {
    it("returns the item list", async () => {
      const item = {
        id: "item-1",
        tenant_id: "1234",
        source_type: "file",
        filename: "precos.xlsx",
        content_preview: "primeiros 1000 caracteres",
        content_length: 4832,
        created_at: "2026-09-01T12:00:00Z",
        updated_at: "2026-09-01T12:00:00Z",
      };
      fetchMock.mockResolvedValueOnce(createMockResponse(200, [item]));

      const result = await listKnowledgeBaseItems("1234");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base/items",
      );
      expect(options.method).toBe("GET");
      expect(result).toEqual({ ok: true, status: 200, data: [item] });
    });

    it("normalizes an invalid payload shape as a 502", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { not: "an array" }));

      const result = await listKnowledgeBaseItems("1234");

      expect(result).toEqual({
        ok: false,
        status: 502,
        message: "Não foi possível concluir a operação. Tente novamente.",
        retryable: true,
      });
    });
  });

  describe("getKnowledgeBaseItem", () => {
    it("returns the full item content", async () => {
      const detail = {
        id: "item-1",
        tenant_id: "1234",
        source_type: "file",
        filename: "precos.xlsx",
        content: "conteúdo completo...",
        created_at: "2026-09-01T12:00:00Z",
        updated_at: "2026-09-01T12:00:00Z",
      };
      fetchMock.mockResolvedValueOnce(createMockResponse(200, detail));

      const result = await getKnowledgeBaseItem("1234", "item-1");

      const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base/items/item-1",
      );
      expect(result).toEqual({ ok: true, status: 200, data: detail });
    });

    it("normalizes a 404 (item not found)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(404, { detail: "not found" }));

      const result = await getKnowledgeBaseItem("1234", "missing");

      expect(result).toEqual({
        ok: false,
        status: 404,
        message: "Item não encontrado.",
        retryable: false,
      });
    });
  });

  describe("uploadKnowledgeBaseItems", () => {
    it("sends files/texts/mode as multipart form data and returns created/replaced items", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(201, {
          created: [{ id: "item-1", filename: "precos.xlsx", source_type: "file" }],
          replaced: [],
        }),
      );
      const file = new File(["conteudo"], "precos.xlsx");

      const result = await uploadKnowledgeBaseItems("1234", {
        files: [file],
        texts: ["texto colado"],
        mode: "append",
      });

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base/items",
      );
      expect(options.method).toBe("POST");
      const body = options.body as FormData;
      expect(body.get("files")).toBe(file);
      expect(body.get("texts")).toBe("texto colado");
      expect(body.get("mode")).toBe("append");
      expect(body.has("duplicate_resolutions")).toBe(false);
      expect(result).toEqual({
        ok: true,
        status: 201,
        data: {
          created: [{ id: "item-1", filename: "precos.xlsx", source_type: "file" }],
          replaced: [],
        },
      });
    });

    it("includes duplicate_resolutions as a JSON string when provided", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(201, { created: [], replaced: [] }),
      );

      await uploadKnowledgeBaseItems("1234", {
        mode: "append",
        duplicateResolutions: [
          { filename: "precos.xlsx", action: "replace", existing_item_id: "item-1" },
        ],
      });

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = options.body as FormData;
      expect(JSON.parse(body.get("duplicate_resolutions") as string)).toEqual([
        { filename: "precos.xlsx", action: "replace", existing_item_id: "item-1" },
      ]);
    });

    it("normalizes a 409 duplicate-filename conflict", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(409, {
          detail: "Alguns arquivos já existem na base de conhecimento deste tenant.",
          conflicts: [{ filename: "precos.xlsx", existing_item_id: "item-1" }],
        }),
      );

      const result = await uploadKnowledgeBaseItems("1234", { mode: "append" });

      expect(result).toEqual({
        ok: false,
        status: 409,
        message: "Alguns arquivos já existem na base de conhecimento deste tenant.",
        conflicts: [{ filename: "precos.xlsx", existing_item_id: "item-1" }],
      });
    });

    it("normalizes a 422 (nothing sent / invalid extension)", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(422, { detail: "Envie ao menos um arquivo ou texto." }),
      );

      const result = await uploadKnowledgeBaseItems("1234", { mode: "append" });

      expect(result).toEqual({
        ok: false,
        status: 422,
        message: "Envie ao menos um arquivo ou texto.",
        retryable: false,
      });
    });
  });

  describe("updateKnowledgeBaseItemContent", () => {
    it("sends PUT with the edited content and returns the updated item", async () => {
      const detail = {
        id: "item-1",
        tenant_id: "1234",
        source_type: "file",
        filename: "precos.xlsx",
        content: "texto editado",
        created_at: "2026-09-01T12:00:00Z",
        updated_at: "2026-09-01T12:05:00Z",
      };
      fetchMock.mockResolvedValueOnce(createMockResponse(200, detail));

      const result = await updateKnowledgeBaseItemContent("1234", "item-1", "texto editado");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base/items/item-1",
      );
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body as string)).toEqual({ content: "texto editado" });
      expect(result).toEqual({ ok: true, status: 200, data: detail });
    });

    it("normalizes a 422 (empty content)", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(422, { detail: "content não pode estar vazio" }),
      );

      const result = await updateKnowledgeBaseItemContent("1234", "item-1", "");

      expect(result).toEqual({
        ok: false,
        status: 422,
        message: "content não pode estar vazio",
        retryable: false,
      });
    });
  });

  describe("replaceKnowledgeBaseItemFile", () => {
    it("sends the new file as multipart form data and returns the updated item", async () => {
      const detail = {
        id: "item-1",
        tenant_id: "1234",
        source_type: "file",
        filename: "precos-v2.xlsx",
        content: "novo conteúdo extraído",
        created_at: "2026-09-01T12:00:00Z",
        updated_at: "2026-09-01T12:10:00Z",
      };
      fetchMock.mockResolvedValueOnce(createMockResponse(200, detail));
      const file = new File(["conteudo"], "precos-v2.xlsx");

      const result = await replaceKnowledgeBaseItemFile("1234", "item-1", file);

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base/items/item-1/file",
      );
      expect(options.method).toBe("PUT");
      expect((options.body as FormData).get("file")).toBe(file);
      expect(result).toEqual({ ok: true, status: 200, data: detail });
    });

    it("normalizes a 404 (item not found)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(404, { detail: "not found" }));
      const file = new File(["conteudo"], "precos.xlsx");

      const result = await replaceKnowledgeBaseItemFile("1234", "missing", file);

      expect(result).toEqual({
        ok: false,
        status: 404,
        message: "Item não encontrado.",
        retryable: false,
      });
    });
  });

  describe("deleteKnowledgeBaseItem", () => {
    it("sends DELETE and returns success", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(204, null));

      const result = await deleteKnowledgeBaseItem("1234", "item-1");

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        "http://test-api.example.com/api/v1/tenants/1234/knowledge-base/items/item-1",
      );
      expect(options.method).toBe("DELETE");
      expect(result).toEqual({ ok: true, status: 204 });
    });

    it("normalizes a 404 (item not found)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(404, { detail: "not found" }));

      const result = await deleteKnowledgeBaseItem("1234", "missing");

      expect(result).toEqual({
        ok: false,
        status: 404,
        message: "Item não encontrado.",
        retryable: false,
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await deleteKnowledgeBaseItem("1234", "item-1");

      expect(result).toEqual({
        ok: false,
        status: 0,
        message: "Não foi possível se conectar ao serviço de mensagens.",
        retryable: true,
      });
    });
  });

  describe("WhatsApp instances", () => {
    const qrCode = "data:image/png;base64,iVBORw0KGgo=";

    it("creates an instance using the documented POST contract", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(201, {
          message: "Criada",
          tenant_id: "tenant-1",
          instance_name: "instance-1",
          qrcode_base64: qrCode,
        }),
      );

      const result = await createWhatsAppInstance({
        tenant_id: "tenant-1",
        instance_name: "instance-1",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "http://test-api.example.com/api/v1/whatsapp/instances",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            tenant_id: "tenant-1",
            instance_name: "instance-1",
          }),
        }),
      );
      expect(result).toEqual({
        ok: true,
        status: 201,
        message: "Criada",
        tenantId: "tenant-1",
        instanceName: "instance-1",
        qrCode,
      });
    });

    it("rejects malformed QR content", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(201, {
          message: "Criada",
          tenant_id: "tenant-1",
          instance_name: "instance-1",
          qrcode_base64: "javascript:alert(1)",
        }),
      );

      const result = await createWhatsAppInstance({
        tenant_id: "tenant-1",
        instance_name: "instance-1",
      });

      expect(result).toEqual(
        expect.objectContaining({ ok: false, status: 502 }),
      );
    });

    it("gets an encoded instance QR without requiring the default tenant", async () => {
      delete process.env.NEXT_PUBLIC_TENANT_ID;
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          instance_name: "loja sul/01",
          qrcode_base64: qrCode,
        }),
      );

      const result = await getWhatsAppQrCode("loja sul/01");

      expect(fetchMock).toHaveBeenCalledWith(
        "http://test-api.example.com/api/v1/whatsapp/instances/loja%20sul%2F01/qrcode",
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual({
        ok: true,
        status: 200,
        instanceName: "loja sul/01",
        qrCode,
      });
    });

    it("maps API and network errors without leaking QR data", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(404, { detail: "Instância não encontrada." }),
      );
      const apiError = await getWhatsAppQrCode("missing");
      fetchMock.mockRejectedValueOnce(new Error("network"));
      const networkError = await getWhatsAppQrCode("missing");

      expect(apiError).toEqual({
        ok: false,
        status: 404,
        message: "Instância não encontrada.",
        retryable: false,
      });
      expect(networkError).toEqual(
        expect.objectContaining({ ok: false, status: 0, retryable: true }),
      );
    });
  });
});
