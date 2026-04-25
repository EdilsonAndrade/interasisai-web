import { act, renderHook } from "@testing-library/react";

import { sendAudioMessageToBff, sendTextMessageToBff } from "@/services";
import { optimizeAudioForBff } from "./audioOptimization";
import { useChatAssistant } from "./useChatAssistant";

jest.mock("@/services", () => ({
  sendAudioMessageToBff: jest.fn(),
  sendTextMessageToBff: jest.fn(),
}));

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
const mockedOptimizeAudioForBff = jest.mocked(optimizeAudioForBff);

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("useChatAssistant", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    mockedSendTextMessageToBff.mockResolvedValue({
      ok: true,
      status: 200,
      reply: "Resposta textual do BFF",
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
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("usa o gateway BFF para envio textual e preserva resposta do assistente", async () => {
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Olá, BFF");
    });

    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "Olá, BFF" });
    expect(mockedSendTextMessageToBff).toHaveBeenCalledWith({ text: "Olá, BFF" });

    await act(async () => {
      await flushPromises();
    });

    const assistantMessages = result.current.messages.filter((message) => message.role === "ai");
    expect(assistantMessages).toHaveLength(1);
    expect(assistantMessages[0].content).toBe("Resposta textual do BFF");
  });

  it("envia áudio somente após otimização com duração menor que a original", async () => {
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
    expect(mockedSendAudioMessageToBff).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: expect.any(Blob),
        originalDurationMs: 1200,
        optimizedDurationMs: 900,
      }),
    );
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

  it("marca erro de integração como retryable e permite nova tentativa para texto", async () => {
    mockedSendTextMessageToBff
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        message: "BFF indisponível",
        retryable: true,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        reply: "Recuperado com sucesso",
      });

    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Quero tentar novamente");
    });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.audioError).toBe("BFF indisponível");
    expect(result.current.canRetry).toBe(true);

    act(() => {
      result.current.retryLastMessage();
    });

    await act(async () => {
      await flushPromises();
    });

    expect(mockedSendTextMessageToBff).toHaveBeenCalledTimes(2);
    expect(result.current.canRetry).toBe(false);
    expect(result.current.messages.some((message) => message.content === "Recuperado com sucesso")).toBe(true);
  });
});
