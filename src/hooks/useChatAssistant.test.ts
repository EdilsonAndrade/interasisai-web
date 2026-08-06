import { act, renderHook } from "@testing-library/react";

import {
  decodeAudioBase64,
  sendAudioMessageToBff,
  sendTextMessageToBff,
  getThreadId,
  sendChatMessage,
} from "@/services";
import { optimizeAudioForBff } from "./audioOptimization";
import { useChatAssistant } from "./useChatAssistant";

jest.mock("@/services", () => {
  const actual = jest.requireActual("@/services");
  return {
    ...actual,
    sendAudioMessageToBff: jest.fn(),
    sendTextMessageToBff: jest.fn(),
    sendChatMessage: jest.fn(),
    decodeAudioBase64: jest.fn(),
    getThreadId: jest.fn(),
  };
});

jest.mock("./audioOptimization", () => ({
  optimizeAudioForBff: jest.fn(),
}));

class MockMediaRecorder {
  static isTypeSupported = () => true;

  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  start() {
    setTimeout(() => {
      if (this.ondataavailable) {
        this.ondataavailable({
          data: new Blob(["raw-audio"], { type: "audio/webm" }),
        });
      }
    }, 50);
  }

  stop() {
    if (this.onstop) {
      this.onstop();
    }
  }
}

Object.defineProperty(global, "MediaRecorder", {
  writable: true,
  value: MockMediaRecorder,
});

const mockGetUserMedia = jest.fn();

Object.defineProperty(global.navigator, "mediaDevices", {
  writable: true,
  value: { getUserMedia: mockGetUserMedia },
});

const mockedSendAudioMessageToBff = jest.mocked(sendAudioMessageToBff);
const mockedSendTextMessageToBff = jest.mocked(sendTextMessageToBff);
const mockedSendChatMessage = jest.mocked(sendChatMessage);
const mockedOptimizeAudioForBff = jest.mocked(optimizeAudioForBff);
const mockedDecodeAudioBase64 = jest.mocked(decodeAudioBase64);
const mockedGetThreadId = jest.mocked(getThreadId);

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("useChatAssistant", () => {
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  let urlCounter = 0;

  beforeAll(() => {
    if (typeof URL.createObjectURL !== "function") {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        writable: true,
        value: () => "blob:noop",
      });
    }
    if (typeof URL.revokeObjectURL !== "function") {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        writable: true,
        value: () => undefined,
      });
    }
  });

  beforeEach(() => {
    jest.useFakeTimers();
    urlCounter = 0;

    // Set required env vars for tenant validation
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-backend.local";
    process.env.NEXT_PUBLIC_TENANT_ID = "test-tenant-id";
    // Enable audio for existing audio tests (new tests override this)
    process.env.NEXT_PUBLIC_ENABLE_AUDIO = "true";

    createObjectURLSpy = jest
      .spyOn(URL, "createObjectURL")
      .mockImplementation(() => `blob:mock-${++urlCounter}`);
    revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    mockedSendTextMessageToBff.mockResolvedValue({
      ok: true,
      status: 200,
      reply: "Resposta textual do BFF",
      correlationId: "req_text",
      responseId: "rsp_text",
      sessionId: "ses_text",
      cache: { cacheable: false, source: "engine" },
    });

    mockedSendChatMessage.mockResolvedValue({
      ok: true,
      status: 200,
      reply: "Resposta do Python Backend",
    });

    mockedOptimizeAudioForBff.mockResolvedValue({
      optimizedBlob: new Blob(["optimized"], { type: "audio/wav" }),
      originalDurationMs: 1200,
      optimizedDurationMs: 900,
      optimizationFactor: 1.15,
    });

    mockedSendAudioMessageToBff.mockResolvedValue({
      ok: true,
      status: 200,
      reply: "Resposta de áudio do BFF",
    });

    mockedDecodeAudioBase64.mockImplementation(
      (base64: string, mime?: string) => new Blob([base64], { type: mime || "audio/mpeg" }),
    );

    mockedGetThreadId.mockReturnValue("test-thread-550e8400-e29b-41d4-a716-446655440000");
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
    createObjectURLSpy?.mockRestore();
    revokeObjectURLSpy?.mockRestore();
    // Clean up env vars
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_TENANT_ID;
    delete process.env.NEXT_PUBLIC_ENABLE_AUDIO;
  });

  it("usa o Python backend para envio textual e preserva resposta do assistente", async () => {
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Olá, Python");
    });

    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "Olá, Python" });
    expect(mockedSendChatMessage).toHaveBeenCalledWith(
      { message: "Olá, Python", thread_id: "test-thread-550e8400-e29b-41d4-a716-446655440000" },
      "test-tenant-id",
    );

    await act(async () => {
      await flushPromises();
    });

    const assistantMessages = result.current.messages.filter((m) => m.role === "ai");
    expect(assistantMessages).toHaveLength(1);
    expect(assistantMessages[0].content).toBe("Resposta do Python Backend");
    expect(result.current.audioReplyBlob).toBeNull();
    expect(result.current.audioReplyUrl).toBeNull();
  });

  it("loga informações no console em sucesso via Python backend", async () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("hi");
    });

    await act(async () => {
      await flushPromises();
    });

    const logCall = infoSpy.mock.calls.find((call) => call[0] === "[PythonBackend]");
    expect(logCall).toBeDefined();
    expect(logCall?.[1]).toMatchObject({
      thread_id: "test-thread-550e8400-e29b-41d4-a716-446655440000",
      status: 200,
    });
    infoSpy.mockRestore();
  });

  it("audioReplyBlob é null após resposta de texto via Python backend", async () => {
    mockedSendChatMessage.mockResolvedValueOnce({
      ok: true,
      status: 200,
      reply: "sem áudio",
    });

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("test");
    });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.audioReplyBlob).toBeNull();
    expect(result.current.audioReplyUrl).toBeNull();
  });

  it("expõe audioReplyBlob e audioReplyUrl via gravação de áudio (BFF legado)", async () => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    mockedSendAudioMessageToBff.mockResolvedValueOnce({
      ok: true,
      status: 200,
      reply: "com áudio",
      audio: { base64: "QUJD", mimeType: "audio/mpeg" },
    });

    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      jest.advanceTimersByTime(550);
      result.current.stopRecording();
    });

    await act(async () => {
      await flushPromises();
    });

    expect(mockedDecodeAudioBase64).toHaveBeenCalledWith("QUJD", "audio/mpeg");
    expect(result.current.audioReplyBlob).toBeInstanceOf(Blob);
    expect(result.current.audioReplyUrl).toBe("blob:mock-1");
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });

  it("revoga URL anterior ao receber nova gravação com áudio", async () => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    mockedSendAudioMessageToBff
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        reply: "1",
        audio: { base64: "QUJD", mimeType: "audio/mpeg" },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        reply: "2",
        audio: { base64: "WFla", mimeType: "audio/mpeg" },
      });

    const { result } = renderHook(() => useChatAssistant());

    // First recording
    await act(async () => {
      await result.current.startRecording();
    });
    act(() => {
      jest.advanceTimersByTime(550);
      result.current.stopRecording();
    });
    await act(async () => {
      await flushPromises();
    });

    // Second recording
    await act(async () => {
      await result.current.startRecording();
    });
    act(() => {
      jest.advanceTimersByTime(550);
      result.current.stopRecording();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-1");
    expect(result.current.audioReplyUrl).toBe("blob:mock-2");
  });

  it("revoga URL no cleanup do hook após gravação", async () => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    mockedSendAudioMessageToBff.mockResolvedValueOnce({
      ok: true,
      status: 200,
      reply: "1",
      audio: { base64: "QUJD", mimeType: "audio/mpeg" },
    });

    const { result, unmount } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });
    act(() => {
      jest.advanceTimersByTime(550);
      result.current.stopRecording();
    });
    await act(async () => {
      await flushPromises();
    });

    unmount();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-1");
  });

  it("envia áudio somente após otimização, sem campos de duração no payload", async () => {
    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    act(() => {
      result.current.stopRecording();
    });

    await act(async () => {
      await flushPromises();
    });

    expect(mockedOptimizeAudioForBff).toHaveBeenCalledTimes(1);
    expect(mockedSendAudioMessageToBff).toHaveBeenCalledTimes(1);
    const callArg = mockedSendAudioMessageToBff.mock.calls[0][0];
    expect(callArg.audio).toBeInstanceOf(Blob);
    expect(callArg).not.toHaveProperty("originalDurationMs");
    expect(callArg).not.toHaveProperty("optimizedDurationMs");
    expect(result.current.audioBlob?.size).toBeGreaterThan(0);
  });

  it("bloqueia payload de voz quando otimização falha", async () => {
    mockedOptimizeAudioForBff.mockRejectedValueOnce(new Error("Falha de otimização"));

    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      jest.advanceTimersByTime(1200);
      result.current.stopRecording();
    });

    await act(async () => {
      await flushPromises();
    });

    expect(mockedSendAudioMessageToBff).not.toHaveBeenCalled();
    expect(result.current.audioError).toContain("Não foi possível otimizar seu áudio");
  });

  it("falha não retryable (400) bloqueia retry", async () => {
    mockedSendChatMessage.mockResolvedValueOnce({
      ok: false,
      status: 400,
      message: "Mensagem inválida.",
      retryable: false,
    });

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("x");
    });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.audioError).toBe("Mensagem inválida.");
    expect(result.current.canRetry).toBe(false);
  });

  it("marca erro 500 como retryable e permite nova tentativa para texto (T018)", async () => {
    mockedSendChatMessage
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        message: "Erro interno no motor de IA. Nossa equipe foi notificada.",
        retryable: true,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        reply: "Recuperado com sucesso",
      });

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Quero tentar novamente");
    });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.audioError).toBe(
      "Erro interno no motor de IA. Nossa equipe foi notificada.",
    );
    expect(result.current.canRetry).toBe(true);

    const errorCall = errorSpy.mock.calls.find(
      (c) => c[0] === "[PythonBackend:error]",
    );
    expect(errorCall).toBeDefined();
    expect(errorCall?.[1]).toMatchObject({
      status: 500,
      message: "Erro interno no motor de IA. Nossa equipe foi notificada.",
    });

    act(() => {
      result.current.retryLastMessage();
    });

    await act(async () => {
      await flushPromises();
    });

    expect(mockedSendChatMessage).toHaveBeenCalledTimes(2);
    expect(result.current.canRetry).toBe(false);
    expect(
      result.current.messages.some((m) => m.content === "Recuperado com sucesso"),
    ).toBe(true);
    errorSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // US1 — Python Backend integration tests (T016-T019)
  // -----------------------------------------------------------------------

  it("T016 — envia mensagem via contrato Python (message + thread_id, não text)", async () => {
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Mensagem Python");
    });

    expect(mockedSendChatMessage).toHaveBeenCalledWith(
      {
        message: "Mensagem Python",
        thread_id: "test-thread-550e8400-e29b-41d4-a716-446655440000",
      },
      "test-tenant-id",
    );
  });

  it("T017 — processa success response e adiciona mensagem da IA", async () => {
    mockedSendChatMessage.mockResolvedValueOnce({
      ok: true,
      status: 200,
      reply: "Resposta do Python!",
    });

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("test");
    });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.messages).toHaveLength(2); // user + ai
    expect(result.current.messages[1]).toMatchObject({
      role: "ai",
      content: "Resposta do Python!",
    });
  });

  it("T018 — handles HTTP 500 with friendly message and allows retry", async () => {
    mockedSendChatMessage
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        message: "Erro interno no motor de IA. Nossa equipe foi notificada.",
        retryable: true,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        reply: "Recuperado!",
      });

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("test");
    });
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.canRetry).toBe(true);
    expect(result.current.audioError).toBe(
      "Erro interno no motor de IA. Nossa equipe foi notificada.",
    );

    act(() => {
      result.current.retryLastMessage();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.messages[1].content).toBe("Recuperado!");
  });

  it("T019 — handles HTTP 504 timeout with friendly message and allows retry", async () => {
    mockedSendChatMessage.mockResolvedValueOnce({
      ok: false,
      status: 504,
      message:
        "O serviço de atendimento demorou para responder. Por favor, tente novamente em instantes.",
      retryable: true,
    });

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("timeout test");
    });
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.canRetry).toBe(true);
    expect(result.current.audioError).toBe(
      "O serviço de atendimento demorou para responder. Por favor, tente novamente em instantes.",
    );
  });

  // -----------------------------------------------------------------------
  // US2 — Thread ID management
  // -----------------------------------------------------------------------

  it("initializes thread_id via getThreadId on first render", () => {
    mockedGetThreadId.mockReturnValue("test-uuid-1234-abcd");
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);

    renderHook(() => useChatAssistant());

    expect(mockedGetThreadId).toHaveBeenCalled();
    const logCall = infoSpy.mock.calls.find(
      (call) => call[0] === "[SessionManager:threadId]",
    );
    expect(logCall).toBeDefined();
    expect(logCall?.[1]).toMatchObject({ thread_id: "test-uuid-1234-abcd" });
    infoSpy.mockRestore();
  });

  it("reuses the same thread_id across multiple sendMessage calls", () => {
    mockedGetThreadId.mockReturnValue("persistent-thread-uuid");
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("first");
    });
    act(() => {
      result.current.sendMessage("second");
    });

    // getThreadId should only be called once (on init), not per sendMessage
    // In current Phase 3, thread_id is stored but not yet passed to BFF
    // Verified via mock call count
    expect(mockedGetThreadId).toHaveBeenCalledTimes(1);
  });

  it("initializes cleanly when localStorage is mocked as unavailable", () => {
    const getItemSpy = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("SecurityError");
      });

    mockedGetThreadId.mockReturnValue("fallback-uuid-no-storage");

    const { result } = renderHook(() => useChatAssistant());

    expect(mockedGetThreadId).toHaveBeenCalled();
    // Hook should still work — sendMessage should not throw
    expect(() => {
      act(() => {
        result.current.sendMessage("test in anonymous mode");
      });
    }).not.toThrow();

    getItemSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // US3 — Tenant ID validation
  // -----------------------------------------------------------------------

  it("blocks sendMessage when NEXT_PUBLIC_TENANT_ID is missing", () => {
    const originalTenant = process.env.NEXT_PUBLIC_TENANT_ID;
    delete process.env.NEXT_PUBLIC_TENANT_ID;

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("should be blocked");
    });

    expect(result.current.audioError).toBe(
      "Configuração do tenant ausente. Contate o administrador.",
    );
    expect(result.current.messages).toHaveLength(0);

    // Restore env
    if (originalTenant) {
      process.env.NEXT_PUBLIC_TENANT_ID = originalTenant;
    }
  });

  // -----------------------------------------------------------------------
  // US5 — Audio feature flag
  // -----------------------------------------------------------------------

  it("isRecording remains false when NEXT_PUBLIC_ENABLE_AUDIO is false", async () => {
    const originalAudio = process.env.NEXT_PUBLIC_ENABLE_AUDIO;
    process.env.NEXT_PUBLIC_ENABLE_AUDIO = "false";

    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(mockGetUserMedia).not.toHaveBeenCalled();

    // Restore
    if (originalAudio !== undefined) {
      process.env.NEXT_PUBLIC_ENABLE_AUDIO = originalAudio;
    } else {
      delete process.env.NEXT_PUBLIC_ENABLE_AUDIO;
    }
  });

  it("startRecording is a no-op when audio is disabled (T040)", () => {
    const originalAudio = process.env.NEXT_PUBLIC_ENABLE_AUDIO;
    process.env.NEXT_PUBLIC_ENABLE_AUDIO = "false";

    const { result } = renderHook(() => useChatAssistant());

    // startRecording should not throw or change state
    expect(() => {
      act(() => {
        void result.current.startRecording();
      });
    }).not.toThrow();

    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioBlob).toBeNull();

    // Restore
    if (originalAudio !== undefined) {
      process.env.NEXT_PUBLIC_ENABLE_AUDIO = originalAudio;
    } else {
      delete process.env.NEXT_PUBLIC_ENABLE_AUDIO;
    }
  });
});
