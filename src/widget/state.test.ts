import { getThreadId } from "@/services/sessionManager";
import { initSession as apiInitSession, sendMessage as apiSendMessage } from "./network";
import { getState, initSession, sendUserMessage, subscribe } from "./state";

jest.mock("@/services/sessionManager", () => ({
  getThreadId: jest.fn(() => "thread-123"),
}));

jest.mock("./network", () => ({
  initSession: jest.fn(),
  sendMessage: jest.fn(),
}));

const initSessionMock = jest.mocked(apiInitSession);
const sendMessageMock = jest.mocked(apiSendMessage);
const getThreadIdMock = jest.mocked(getThreadId);

describe("widget state (src/widget/state.ts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getThreadIdMock.mockReturnValue("thread-123");
    // Reset module-level state between tests by re-importing is not trivial here,
    // so every test explicitly re-initializes the session before asserting.
  });

  it("initSession resolves true and stores the access token on success", async () => {
    initSessionMock.mockResolvedValue({
      ok: true,
      accessToken: "token-abc",
      tokenType: "bearer",
      status: 200,
    });

    const ok = await initSession("demo-cliente");

    expect(ok).toBe(true);
    expect(initSessionMock).toHaveBeenCalledWith("demo-cliente");
    expect(getState().ready).toBe(true);
  });

  it("initSession resolves false on failure (e.g. unauthorized domain)", async () => {
    initSessionMock.mockResolvedValue({
      ok: false,
      status: 403,
      message: "domínio não autorizado",
      retryable: false,
    });

    const ok = await initSession("demo-cliente");

    expect(ok).toBe(false);
  });

  it("sendUserMessage appends the user message, then the AI reply, using the persisted thread id", async () => {
    initSessionMock.mockResolvedValue({
      ok: true,
      accessToken: "token-abc",
      tokenType: "bearer",
      status: 200,
    });
    await initSession("demo-cliente");

    sendMessageMock.mockResolvedValue({ ok: true, reply: "Olá! Como posso ajudar?", status: 200 });

    await sendUserMessage("Oi");

    expect(sendMessageMock).toHaveBeenCalledWith(
      { message: "Oi", thread_id: "thread-123" },
      "token-abc",
    );
    const state = getState();
    expect(state.messages.at(-2)).toMatchObject({ role: "user", content: "Oi" });
    expect(state.messages.at(-1)).toMatchObject({
      role: "ai",
      content: "Olá! Como posso ajudar?",
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("renews the access token once and resends on a 401, then succeeds", async () => {
    initSessionMock
      .mockResolvedValueOnce({
        ok: true,
        accessToken: "token-expired",
        tokenType: "bearer",
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: true,
        accessToken: "token-renewed",
        tokenType: "bearer",
        status: 200,
      });
    await initSession("demo-cliente");

    sendMessageMock
      .mockResolvedValueOnce({ ok: false, status: 401, message: "expirado", retryable: false })
      .mockResolvedValueOnce({ ok: true, reply: "Resposta após renovar", status: 200 });

    await sendUserMessage("Oi de novo");

    expect(sendMessageMock).toHaveBeenNthCalledWith(
      1,
      { message: "Oi de novo", thread_id: "thread-123" },
      "token-expired",
    );
    expect(sendMessageMock).toHaveBeenNthCalledWith(
      2,
      { message: "Oi de novo", thread_id: "thread-123" },
      "token-renewed",
    );
    expect(getState().messages.at(-1)?.content).toBe("Resposta após renovar");
  });

  it("sets an error and stops loading when sending fails", async () => {
    initSessionMock.mockResolvedValue({
      ok: true,
      accessToken: "token-abc",
      tokenType: "bearer",
      status: 200,
    });
    await initSession("demo-cliente");

    sendMessageMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno no motor de IA.",
      retryable: true,
    });

    await sendUserMessage("Oi");

    const state = getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("Erro interno no motor de IA.");
  });

  it("notifies subscribers on every state change", async () => {
    initSessionMock.mockResolvedValue({
      ok: true,
      accessToken: "token-abc",
      tokenType: "bearer",
      status: 200,
    });
    sendMessageMock.mockResolvedValue({ ok: true, reply: "oi", status: 200 });

    const listener = jest.fn();
    const unsubscribe = subscribe(listener);
    listener.mockClear();

    await initSession("demo-cliente");
    await sendUserMessage("Oi");

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("ignores blank messages", async () => {
    initSessionMock.mockResolvedValue({
      ok: true,
      accessToken: "token-abc",
      tokenType: "bearer",
      status: 200,
    });
    await initSession("demo-cliente");
    const before = getState().messages.length;

    await sendUserMessage("   ");

    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(getState().messages.length).toBe(before);
  });
});
