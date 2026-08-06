import {
  buildRequestKey,
  chatResponseCache,
  normalizeBffResponse,
  sendAudioMessageToBff,
  sendTextMessageToBff,
} from "@/services";

type MockResponse = {
  ok: boolean;
  status: number;
  headers: { get: (name: string) => string | null };
  json: () => Promise<unknown>;
};

function createMockResponse(
  status: number,
  payload: unknown,
  headers: Record<string, string> = {},
): MockResponse {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => lower[name.toLowerCase()] ?? null,
    },
    json: async () => payload,
  };
}

describe("chatGateway", () => {
  const fetchMock = jest.fn();
  const originalEnv = process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT;
  let setItemSpy: jest.SpyInstance;
  let sessionSetItemSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    chatResponseCache.clear();
    delete process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT;
    setItemSpy = jest.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT;
    } else {
      process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT = originalEnv;
    }
    setItemSpy?.mockRestore();
    sessionSetItemSpy?.mockRestore();
  });

  // ----- C1. Endpoint -----
  describe("C1 endpoint", () => {
    it("usa /chat/message como default", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      await sendTextMessageToBff({ text: "hi" });
      expect(fetchMock.mock.calls[0][0]).toBe("/chat/message");
    });

    it("respeita override por env NEXT_PUBLIC_CHAT_BFF_ENDPOINT", async () => {
      process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT = "https://api.example.com/chat/message";
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      await sendTextMessageToBff({ text: "hi" });
      expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.com/chat/message");
    });

    it("override pontual em input.endpoint prevalece", async () => {
      process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT = "https://api.example.com/chat/message";
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      await sendTextMessageToBff({ text: "hi", endpoint: "/custom" });
      expect(fetchMock.mock.calls[0][0]).toBe("/custom");
    });
  });

  // ----- C2. Texto -----
  describe("C2 envio de texto", () => {
    it("envia POST JSON com {text} e credentials, sem kind/internalSecret", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      await sendTextMessageToBff({ text: "Mensagem" });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe("POST");
      expect(options.credentials).toBe("include");
      expect(options.headers).toEqual({ "Content-Type": "application/json" });
      const body = JSON.parse(options.body as string);
      expect(body).toEqual({ text: "Mensagem" });
      expect(body).not.toHaveProperty("kind");
      expect(body).not.toHaveProperty("internalSecret");
    });

    it("aplica trim ao texto antes do envio", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      await sendTextMessageToBff({ text: "  oi  " });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual({ text: "oi" });
    });

    it("bloqueia texto vazio sem chamar fetch", async () => {
      const result = await sendTextMessageToBff({ text: "   " });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        ok: false,
        status: 400,
        retryable: false,
        errorStatus: "local",
      });
    });

    it("bloqueia texto > 4000 caracteres com 413 sem chamar fetch", async () => {
      const big = "a".repeat(4001);
      const result = await sendTextMessageToBff({ text: big });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        ok: false,
        status: 413,
        retryable: false,
        errorStatus: "local",
      });
    });

    it("permite texto com exatamente 4000 caracteres", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const big = "a".repeat(4000);
      const result = await sendTextMessageToBff({ text: big });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
    });
  });

  // ----- C3. Áudio -----
  describe("C3 envio de áudio", () => {
    it.each([
      ["audio/webm", "recording.webm"],
      ["audio/webm;codecs=opus", "recording.webm"],
      ["audio/mp4", "recording.mp4"],
      ["audio/wav", "recording.wav"],
      ["application/octet-stream", "recording.bin"],
    ])("usa filename %s -> %s", async (mime, expected) => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: mime });
      await sendAudioMessageToBff({ audio: blob });

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = options.body as FormData;
      const file = body.get("audio");
      expect(file).toBeInstanceOf(Blob);
      // jsdom FormData expõe File via name
      expect((file as File).name).toBe(expected);
    });

    it("não anexa kind, originalDurationMs, optimizedDurationMs nem Content-Type manual", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });
      await sendAudioMessageToBff({ audio: blob });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = options.body as FormData;
      expect(body.get("kind")).toBeNull();
      expect(body.get("originalDurationMs")).toBeNull();
      expect(body.get("optimizedDurationMs")).toBeNull();
      expect(options.headers).toBeUndefined();
    });

    it("anexa text opcional quando preenchido (após trim)", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });
      await sendAudioMessageToBff({ audio: blob, text: "  Olá  " });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = options.body as FormData;
      expect(body.get("text")).toBe("Olá");
    });

    it("descarta text opcional somente com whitespace", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });
      await sendAudioMessageToBff({ audio: blob, text: "   " });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = options.body as FormData;
      expect(body.get("text")).toBeNull();
    });

    it("bloqueia áudio com size:0 com 400 sem chamar fetch", async () => {
      const blob = new Blob([], { type: "audio/webm" });
      const result = await sendAudioMessageToBff({ audio: blob });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toMatchObject({ ok: false, status: 400, retryable: false });
    });

    it("bloqueia áudio > 10 MB com 413 sem chamar fetch", async () => {
      const fakeBig = { size: 10 * 1024 * 1024 + 1, type: "audio/webm" } as unknown as Blob;
      const result = await sendAudioMessageToBff({ audio: fakeBig });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toMatchObject({ ok: false, status: 413, retryable: false });
    });

    it("permite áudio com exatamente 10 MB", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const blob = new Blob([new Uint8Array(10 * 1024 * 1024)], { type: "audio/webm" });
      const result = await sendAudioMessageToBff({ audio: blob });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
    });
  });

  // ----- C4. Sucesso canonical-first -----
  describe("C4 sucesso canonical-first", () => {
    it("response_text tem precedência sobre text", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, { response_text: "A", text: "B" }),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.reply).toBe("A");
    });

    it("usa text como fallback quando response_text ausente", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { text: "B" }));
      const result = await sendTextMessageToBff({ text: "x" });
      if (result.ok) expect(result.reply).toBe("B");
    });

    it("usa fallback quando ambos ausentes", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, {}));
      const result = await sendTextMessageToBff({ text: "x" });
      if (result.ok) expect(result.reply).toContain("processando");
    });

    it("propaga responseId, sessionId, correlationId, cache e cacheControl", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          200,
          {
            response_text: "ok",
            responseId: "rsp_1",
            sessionId: "ses_1",
            correlationId: "req_1",
            cache: { cacheable: true, source: "engine" },
          },
          { "Cache-Control": "max-age=60" },
        ),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      if (result.ok) {
        expect(result.responseId).toBe("rsp_1");
        expect(result.sessionId).toBe("ses_1");
        expect(result.correlationId).toBe("req_1");
        expect(result.cache).toEqual({
          cacheable: true,
          source: "engine",
          cacheControl: "max-age=60",
        });
      }
    });

    it("response_audio_base64 tem precedência sobre audio.contentBase64", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, {
          response_audio_base64: "X",
          audio: { mimeType: "audio/wav", contentBase64: "Y" },
        }),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      if (result.ok) {
        expect(result.audio).toEqual({ base64: "X", mimeType: "audio/wav" });
      }
    });

    it("usa audio/mpeg como mimeType default quando ausente", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(200, { response_audio_base64: "X" }),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      if (result.ok) {
        expect(result.audio).toEqual({ base64: "X", mimeType: "audio/mpeg" });
      }
    });

    it("audio undefined quando resposta sem áudio", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const result = await sendTextMessageToBff({ text: "x" });
      if (result.ok) expect(result.audio).toBeUndefined();
    });
  });

  // ----- C5. Erros -----
  describe("C5 erros", () => {
    it.each([
      [400, "rejected", false],
      [403, "blocked", false],
      [429, "rejected", true],
      [502, "failed", true],
    ])("status %i mapeia errorStatus=%s retryable=%s", async (httpStatus, errorStatus, retryable) => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(httpStatus, { status: errorStatus, reason: "X" }),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      expect(result).toMatchObject({
        ok: false,
        status: httpStatus,
        retryable,
        errorStatus,
        message: "X",
      });
    });

    it("reason tem precedência sobre error/message", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(400, { reason: "R", error: "E", message: "M" }),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      expect((result as { message: string }).message).toBe("R");
    });

    it("usa error quando reason ausente", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(400, { error: "E" }));
      const result = await sendTextMessageToBff({ text: "x" });
      expect((result as { message: string }).message).toBe("E");
    });

    it("usa message quando reason e error ausentes", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(400, { message: "M" }));
      const result = await sendTextMessageToBff({ text: "x" });
      expect((result as { message: string }).message).toBe("M");
    });

    it("408 e 503 são retryable", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(408, {}));
      const r1 = await sendTextMessageToBff({ text: "x" });
      expect((r1 as { retryable: boolean }).retryable).toBe(true);

      fetchMock.mockResolvedValueOnce(createMockResponse(503, {}));
      const r2 = await sendTextMessageToBff({ text: "y" });
      expect((r2 as { retryable: boolean }).retryable).toBe(true);
    });

    it("falha de rede vira status 0 retryable", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));
      const result = await sendTextMessageToBff({ text: "x" });
      expect(result).toMatchObject({ ok: false, status: 0, retryable: true });
    });

    it("propaga correlationId em erro", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(429, {
          status: "rejected",
          reason: "rate",
          correlationId: "req_err",
        }),
      );
      const result = await sendTextMessageToBff({ text: "x" });
      expect((result as { correlationId?: string }).correlationId).toBe("req_err");
    });
  });

  // ----- C6. Credenciais e segurança -----
  describe("C6 credentials e segurança", () => {
    it("texto envia credentials: include e sem internalSecret", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      await sendTextMessageToBff({ text: "x" });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(options.credentials).toBe("include");
      expect(options.body as string).not.toContain("internalSecret");
    });

    it("áudio envia credentials: include sem entrada internalSecret", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(200, { response_text: "ok" }));
      const blob = new Blob([new Uint8Array([1])], { type: "audio/webm" });
      await sendAudioMessageToBff({ audio: blob });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(options.credentials).toBe("include");
      const body = options.body as FormData;
      expect(body.get("internalSecret")).toBeNull();
    });
  });

  // ----- C7. Cache em memória -----
  describe("C7 cache em memória de sessão", () => {
    it("texto idêntico com Cache-Control max-age e cacheable:true serve do cache na 2ª chamada", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          200,
          { response_text: "cached", cache: { cacheable: true } },
          { "Cache-Control": "max-age=60" },
        ),
      );
      const r1 = await sendTextMessageToBff({ text: "pergunta" });
      const r2 = await sendTextMessageToBff({ text: "pergunta" });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(r1.ok && r1.reply).toBe("cached");
      expect(r2.ok && r2.reply).toBe("cached");
      if (r2.ok) expect(r2.cache?.source).toBe("client");
    });

    it("Cache-Control no-store nunca cacheia", async () => {
      fetchMock
        .mockResolvedValueOnce(
          createMockResponse(
            200,
            { response_text: "no-cache", cache: { cacheable: true } },
            { "Cache-Control": "no-store" },
          ),
        )
        .mockResolvedValueOnce(
          createMockResponse(
            200,
            { response_text: "no-cache", cache: { cacheable: true } },
            { "Cache-Control": "no-store" },
          ),
        );

      await sendTextMessageToBff({ text: "p" });
      await sendTextMessageToBff({ text: "p" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("cacheable:false não cacheia mesmo com max-age", async () => {
      fetchMock
        .mockResolvedValueOnce(
          createMockResponse(
            200,
            { response_text: "x", cache: { cacheable: false } },
            { "Cache-Control": "max-age=60" },
          ),
        )
        .mockResolvedValueOnce(
          createMockResponse(
            200,
            { response_text: "x", cache: { cacheable: false } },
            { "Cache-Control": "max-age=60" },
          ),
        );
      await sendTextMessageToBff({ text: "q" });
      await sendTextMessageToBff({ text: "q" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("max-age=0 não cacheia", async () => {
      fetchMock
        .mockResolvedValueOnce(
          createMockResponse(
            200,
            { response_text: "x", cache: { cacheable: true } },
            { "Cache-Control": "max-age=0" },
          ),
        )
        .mockResolvedValueOnce(
          createMockResponse(
            200,
            { response_text: "x", cache: { cacheable: true } },
            { "Cache-Control": "max-age=0" },
          ),
        );
      await sendTextMessageToBff({ text: "z" });
      await sendTextMessageToBff({ text: "z" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("respostas de erro nunca cacheiam", async () => {
      fetchMock
        .mockResolvedValueOnce(createMockResponse(400, { reason: "rejected" }))
        .mockResolvedValueOnce(createMockResponse(400, { reason: "rejected" }));
      await sendTextMessageToBff({ text: "err" });
      await sendTextMessageToBff({ text: "err" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("nunca persiste cache em localStorage/sessionStorage", async () => {
      sessionSetItemSpy = jest.spyOn(window.sessionStorage.__proto__, "setItem");
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          200,
          { response_text: "ok", cache: { cacheable: true } },
          { "Cache-Control": "max-age=60" },
        ),
      );
      await sendTextMessageToBff({ text: "persist" });
      expect(setItemSpy).not.toHaveBeenCalled();
      expect(sessionSetItemSpy).not.toHaveBeenCalled();
    });

    it("buildRequestKey é determinístico", () => {
      expect(buildRequestKey("a")).toBe(buildRequestKey("a"));
    });
  });

  // ----- normalizeBffResponse legado -----
  describe("normalizeBffResponse direto", () => {
    it("normaliza fallback de sucesso sem reply", async () => {
      const response = createMockResponse(200, {});
      const result = await normalizeBffResponse(response as unknown as Response);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.reply).toContain("processando");
    });
  });
});
