import {
  normalizeBffResponse,
  sendAudioMessageToBff,
  sendTextMessageToBff,
} from "./chatGateway";

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createMockResponse(status: number, payload: unknown): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

describe("chatGateway", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("envia texto em JSON com credentials no canal do BFF", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(200, { ok: true, reply: "ok" }));

    await sendTextMessageToBff({ text: "Mensagem textual" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(options.body).toBe(JSON.stringify({ kind: "text", text: "Mensagem textual" }));
  });

  it("envia áudio otimizado em FormData com os campos de contrato", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(200, { ok: true, reply: "ok" }));

    await sendAudioMessageToBff({
      audio: new Blob(["optimized"], { type: "audio/wav" }),
      originalDurationMs: 1500,
      optimizedDurationMs: 900,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.body).toBeInstanceOf(FormData);

    const body = options.body as FormData;
    expect(body.get("kind")).toBe("audio");
    expect(body.get("originalDurationMs")).toBe("1500");
    expect(body.get("optimizedDurationMs")).toBe("900");
    expect(body.get("audio")).toBeInstanceOf(Blob);
  });

  it("retorna erro retryable em falha HTTP 503", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(503, { ok: false, error: "indisponível" }));

    const result = await sendTextMessageToBff({ text: "Teste" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.retryable).toBe(true);
      expect(result.message).toBe("indisponível");
    }
  });

  it("não envia áudio quando duração otimizada não é menor que original", async () => {
    const result = await sendAudioMessageToBff({
      audio: new Blob(["optimized"], { type: "audio/wav" }),
      originalDurationMs: 1000,
      optimizedDurationMs: 1000,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it("normaliza fallback de sucesso sem reply", async () => {
    const response = createMockResponse(200, { ok: true });

    const result = await normalizeBffResponse(response as unknown as Response);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reply).toContain("processando");
    }
  });
});
