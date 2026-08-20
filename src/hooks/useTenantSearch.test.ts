import { act, renderHook } from "@testing-library/react";
import { searchTenants } from "@/services/pythonBackend";
import type { TenantSearchResult } from "@/services/pythonBackend.types";
import { useTenantSearch } from "./useTenantSearch";

jest.mock("@/services/pythonBackend", () => ({
  searchTenants: jest.fn(),
}));

const searchTenantsMock = jest.mocked(searchTenants);

const tenant = {
  id: "1234",
  name: "Barbearia Central",
  google_calendar_id: "abc@group.calendar.google.com",
  allowed_domains: ["barbeariacentral.com.br"],
  created_at: "2026-01-10T12:00:00Z",
  updated_at: null,
  deleted_at: null,
};

describe("useTenantSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call the service and shows a required-field message for an empty term", async () => {
    const { result } = renderHook(() => useTenantSearch());

    await act(async () => {
      await result.current.search("   ");
    });

    expect(searchTenantsMock).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Informe um termo de busca.");
  });

  it("populates results on success", async () => {
    searchTenantsMock.mockResolvedValue({ ok: true, status: 200, tenants: [tenant] });
    const { result } = renderHook(() => useTenantSearch());

    await act(async () => {
      await result.current.search("Barbearia");
    });

    expect(result.current.results).toEqual([tenant]);
    expect(result.current.notFound).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("treats an empty result list as notFound, not an error", async () => {
    searchTenantsMock.mockResolvedValue({ ok: true, status: 200, tenants: [] });
    const { result } = renderHook(() => useTenantSearch());

    await act(async () => {
      await result.current.search("sem-resultado");
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("surfaces a service failure and clears previous results", async () => {
    searchTenantsMock.mockResolvedValue({
      ok: false,
      status: 401,
      message: "Token inválido",
      retryable: false,
    });
    const { result } = renderHook(() => useTenantSearch());

    await act(async () => {
      await result.current.search("qualquer");
    });

    expect(result.current.error).toBe("Token inválido");
    expect(result.current.results).toEqual([]);
    expect(result.current.notFound).toBe(false);
  });

  it("discards a stale response when a newer search resolves first", async () => {
    let resolveFirst!: (value: TenantSearchResult) => void;
    const firstPromise = new Promise<TenantSearchResult>((resolve) => {
      resolveFirst = resolve;
    });

    searchTenantsMock
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ ok: true, status: 200, tenants: [tenant] });

    const { result } = renderHook(() => useTenantSearch());

    let firstSearch!: Promise<void>;
    act(() => {
      firstSearch = result.current.search("primeiro");
    });
    await act(async () => {
      await result.current.search("segundo");
    });

    expect(result.current.results).toEqual([tenant]);

    await act(async () => {
      resolveFirst({ ok: true, status: 200, tenants: [] });
      await firstSearch;
    });

    // The stale first response must not overwrite the newer state.
    expect(result.current.results).toEqual([tenant]);
  });
});
