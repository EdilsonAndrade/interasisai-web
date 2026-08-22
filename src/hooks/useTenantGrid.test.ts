import { act, renderHook } from "@testing-library/react";
import { listTenants } from "@/services/pythonBackend";
import { useTenantGrid } from "./useTenantGrid";

jest.mock("@/services/pythonBackend", () => ({
  listTenants: jest.fn(),
}));

const listMock = jest.mocked(listTenants);

function itemsPage(startIndex: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `tenant-${startIndex + i}`,
    name: `Tenant ${startIndex + i}`,
    google_calendar_id: "cal@x",
    allowed_domains: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    prompts: [],
    guardrails: [],
  }));
}

describe("useTenantGrid", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches a page and exposes items/total", async () => {
    listMock.mockResolvedValue({ ok: true, status: 200, items: itemsPage(1, 20), total: 45 });
    const { result } = renderHook(() => useTenantGrid());

    await act(async () => {
      await result.current.fetchPage(0);
    });

    expect(listMock).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(result.current.items).toHaveLength(20);
    expect(result.current.total).toBe(45);
    expect(result.current.offset).toBe(0);
  });

  it("derives hasPrevious/hasNext from offset, limit and total", async () => {
    listMock.mockResolvedValue({ ok: true, status: 200, items: itemsPage(1, 20), total: 45 });
    const { result } = renderHook(() => useTenantGrid());

    await act(async () => {
      await result.current.fetchPage(0);
    });
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(true);

    listMock.mockResolvedValue({ ok: true, status: 200, items: itemsPage(21, 20), total: 45 });
    await act(async () => {
      await result.current.fetchPage(20);
    });
    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(true);

    listMock.mockResolvedValue({ ok: true, status: 200, items: itemsPage(41, 5), total: 45 });
    await act(async () => {
      await result.current.fetchPage(40);
    });
    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it("goToNext/goToPrevious step by the page size and do nothing past the edges", async () => {
    listMock.mockResolvedValue({ ok: true, status: 200, items: itemsPage(1, 20), total: 45 });
    const { result } = renderHook(() => useTenantGrid());
    await act(async () => {
      await result.current.fetchPage(0);
    });

    act(() => result.current.goToPrevious());
    expect(listMock).toHaveBeenCalledTimes(1); // no-op at offset 0

    await act(async () => {
      result.current.goToNext();
    });
    expect(listMock).toHaveBeenLastCalledWith({ limit: 20, offset: 20 });
  });

  it("surfaces an error without clearing previously loaded items on a failed page fetch", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: itemsPage(1, 20), total: 45 });
    const { result } = renderHook(() => useTenantGrid());
    await act(async () => {
      await result.current.fetchPage(0);
    });

    listMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      retryable: true,
    });
    await act(async () => {
      await result.current.fetchPage(20);
    });

    expect(result.current.error).toBe("Erro interno do servidor. Tente novamente.");
    expect(result.current.items).toHaveLength(20);
    expect(result.current.offset).toBe(0);
  });
});
