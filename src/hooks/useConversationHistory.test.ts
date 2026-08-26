import { act, renderHook } from "@testing-library/react";
import { getConversationHistory } from "@/services/followUpApi";
import type { ConversationMessage } from "@/services/followUpApi.types";
import { useConversationHistory } from "./useConversationHistory";

jest.mock("@/services/followUpApi", () => ({
  getConversationHistory: jest.fn(),
}));

const getConversationHistoryMock = jest.mocked(getConversationHistory);

const olderMessage: ConversationMessage = {
  role: "human",
  content: "Oi, ainda antes",
  created_at: "2026-08-20T14:00:00Z",
};

const newerMessage: ConversationMessage = {
  role: "ai",
  content: "Olá! Como posso ajudar?",
  created_at: "2026-08-20T14:31:00Z",
};

describe("useConversationHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads messages and marks hasMore when the page is full", async () => {
    getConversationHistoryMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "acme", base_thread_id: "acme:123", messages: [newerMessage] },
    });
    const { result } = renderHook(() => useConversationHistory());

    await act(async () => {
      await result.current.fetchHistory("acme", "acme:123", 1);
    });

    expect(getConversationHistoryMock).toHaveBeenCalledWith("acme", "acme:123", 1);
    expect(result.current.messages).toEqual([newerMessage]);
    expect(result.current.hasMore).toBe(true);
  });

  it("marks hasMore false when fewer messages than the limit come back", async () => {
    getConversationHistoryMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "acme", base_thread_id: "acme:123", messages: [newerMessage] },
    });
    const { result } = renderHook(() => useConversationHistory());

    await act(async () => {
      await result.current.fetchHistory("acme", "acme:123", 200);
    });

    expect(result.current.hasMore).toBe(false);
  });

  it("prepends older messages on loadMore, preserving chronological order", async () => {
    getConversationHistoryMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { tenant_id: "acme", base_thread_id: "acme:123", messages: [newerMessage] },
    });
    const { result } = renderHook(() => useConversationHistory());

    await act(async () => {
      await result.current.fetchHistory("acme", "acme:123", 1);
    });

    getConversationHistoryMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { tenant_id: "acme", base_thread_id: "acme:123", messages: [olderMessage] },
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(getConversationHistoryMock).toHaveBeenLastCalledWith("acme", "acme:123", 1, newerMessage.created_at);
    expect(result.current.messages).toEqual([olderMessage, newerMessage]);
  });

  it("surfaces a service failure", async () => {
    getConversationHistoryMock.mockResolvedValue({
      ok: false,
      status: 404,
      message: "Registro não encontrado.",
      retryable: false,
    });
    const { result } = renderHook(() => useConversationHistory());

    await act(async () => {
      await result.current.fetchHistory("acme", "acme:999");
    });

    expect(result.current.error).toBe("Registro não encontrado.");
    expect(result.current.messages).toEqual([]);
  });
});
