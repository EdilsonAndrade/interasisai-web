// ============================================================================
// Tests: pythonBackend — HTTP client for Python Agendamento IA
// ============================================================================

import {
  createWhatsAppInstance,
  getPythonBackendConfig,
  getWhatsAppQrCode,
  sendChatMessage,
  ingestKnowledge,
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
        "test-tenant-123",
      );

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect(url).toBe("http://test-api.example.com/api/v1/chat");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
        "X-Tenant-ID": "test-tenant-123",
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
  // ingestKnowledge — Success
  // -----------------------------------------------------------------------

  describe("ingestKnowledge", () => {
    it("sends POST with correct body, headers, and endpoint", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(201, {
          tenant_id: "admin-tenant",
          status: "processing",
          message: "A tarefa de vetorização foi agendada.",
        }),
      );

      const result = await ingestKnowledge(
        { text_content: "Regras de negócio aqui." },
        "admin-tenant",
      );

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect(url).toBe("http://test-api.example.com/api/v1/ingest/text");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
        "X-Tenant-ID": "admin-tenant",
      });

      const body = JSON.parse(options.body as string);
      expect(body).toEqual({ text_content: "Regras de negócio aqui." });

      expect(result).toEqual({
        ok: true,
        message: "A tarefa de vetorização foi agendada.",
        status: 201,
      });
    });

    it("uses fallback message when response message is empty", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(201, {
          tenant_id: "t",
          status: "processing",
          message: "",
        }),
      );

      const result = await ingestKnowledge(
        { text_content: "text" },
        "t",
      );

      expect(result.ok).toBe(true);
      expect(result.message).toBe(
        "Texto enviado para vetorização. O processamento está em andamento em segundo plano.",
      );
    });

    // -------------------------------------------------------------------
    // ingestKnowledge — Errors
    // -------------------------------------------------------------------

    it("handles HTTP 400 error with detail from body", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(400, {
          detail: "text_content não pode estar vazio.",
        }),
      );

      const result = await ingestKnowledge(
        { text_content: "" },
        "admin-tenant",
      );

      expect(result).toEqual({
        ok: false,
        status: 400,
        message: "text_content não pode estar vazio.",
      });
    });

    it("handles network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const result = await ingestKnowledge(
        { text_content: "text" },
        "admin-tenant",
      );

      expect(result).toEqual({
        ok: false,
        status: 0,
        message:
          "Não foi possível se conectar ao serviço de mensagens.",
      });
    });

    it("falls back to generic error when detail is missing", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(500, {}),
      );

      const result = await ingestKnowledge(
        { text_content: "text" },
        "admin-tenant",
      );

      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe(
        "Erro ao enviar texto para vetorização. Tente novamente.",
      );
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
