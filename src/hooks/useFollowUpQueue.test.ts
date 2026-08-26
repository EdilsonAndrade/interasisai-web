import { act, renderHook } from "@testing-library/react";
import { getFollowUpQueue, getFollowUpQueueGlobal } from "@/services/followUpApi";
import type { FollowUpQueueEntry } from "@/services/followUpApi.types";
import { useFollowUpQueue } from "./useFollowUpQueue";

jest.mock("@/services/followUpApi", () => ({
  getFollowUpQueue: jest.fn(),
  getFollowUpQueueGlobal: jest.fn(),
}));

const getFollowUpQueueMock = jest.mocked(getFollowUpQueue);
const getFollowUpQueueGlobalMock = jest.mocked(getFollowUpQueueGlobal);

const entry: FollowUpQueueEntry = {
  id: 1,
  tenant_id: "acme",
  base_thread_id: "acme:5511999999999",
  customer_name: "Maria",
  outcome: "sem_resposta",
  summary: "Cliente perguntou sobre horário e não respondeu mais.",
  draft_message: "Oi! Vi que você tinha interesse em...",
  status: "pendente",
  created_at: "2026-08-26T20:00:00Z",
};

describe("useFollowUpQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("populates data on a successful tenant fetch", async () => {
    getFollowUpQueueMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "acme", entries: [entry] },
    });
    const { result } = renderHook(() => useFollowUpQueue());

    await act(async () => {
      await result.current.fetchQueue("acme", "pendente", "sem_resposta");
    });

    expect(getFollowUpQueueMock).toHaveBeenCalledWith("acme", "pendente", "sem_resposta");
    expect(result.current.data).toEqual([entry]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("surfaces a service failure and clears previous data", async () => {
    getFollowUpQueueMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      retryable: true,
    });
    const { result } = renderHook(() => useFollowUpQueue());

    await act(async () => {
      await result.current.fetchQueue("acme");
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe("Erro interno do servidor. Tente novamente.");
  });

  it("fetches the global queue across tenants", async () => {
    getFollowUpQueueGlobalMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { entries: [entry] },
    });
    const { result } = renderHook(() => useFollowUpQueue());

    await act(async () => {
      await result.current.fetchQueueGlobal(undefined, "pendente");
    });

    expect(getFollowUpQueueGlobalMock).toHaveBeenCalledWith(undefined, "pendente", undefined);
    expect(result.current.data).toEqual([entry]);
  });

  it("refetch replays the last tenant-scoped fetch with the same filters", async () => {
    getFollowUpQueueMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "acme", entries: [entry] },
    });
    const { result } = renderHook(() => useFollowUpQueue());

    await act(async () => {
      await result.current.fetchQueue("acme", "pendente");
    });
    await act(async () => {
      await result.current.refetch();
    });

    expect(getFollowUpQueueMock).toHaveBeenNthCalledWith(2, "acme", "pendente", undefined);
  });

  it("refetch replays the last global fetch, not the tenant-scoped endpoint", async () => {
    getFollowUpQueueGlobalMock.mockResolvedValue({ ok: true, status: 200, data: { entries: [] } });
    const { result } = renderHook(() => useFollowUpQueue());

    await act(async () => {
      await result.current.fetchQueueGlobal("acme");
    });
    await act(async () => {
      await result.current.refetch();
    });

    expect(getFollowUpQueueGlobalMock).toHaveBeenCalledTimes(2);
    expect(getFollowUpQueueMock).not.toHaveBeenCalled();
  });
});
