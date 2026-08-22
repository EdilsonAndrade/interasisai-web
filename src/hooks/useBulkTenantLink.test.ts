import { act, renderHook } from "@testing-library/react";
import { searchTenants } from "@/services/pythonBackend";
import { fetchPromptTenants, linkTenantsBulk } from "@/services/promptManager";
import { useBulkTenantLink } from "./useBulkTenantLink";

jest.mock("@/services/pythonBackend", () => ({
  searchTenants: jest.fn(),
}));

jest.mock("@/services/promptManager", () => ({
  fetchPromptTenants: jest.fn(),
  linkTenantsBulk: jest.fn(),
}));

const searchMock = jest.mocked(searchTenants);
const fetchPromptTenantsMock = jest.mocked(fetchPromptTenants);
const linkBulkMock = jest.mocked(linkTenantsBulk);

describe("useBulkTenantLink", () => {
  beforeEach(() => jest.clearAllMocks());

  it("computes the diff between selected tenants and the ones already linked", async () => {
    fetchPromptTenantsMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        prompt_id: "prompt-1",
        node_type: "operational",
        tenants: [{ id: "acme", name: "Acme Ltda" }],
      },
    });
    const { result } = renderHook(() => useBulkTenantLink());

    await act(async () => {
      await result.current.loadAlreadyLinked("prompt-1");
    });
    act(() => {
      result.current.toggleTenant({ id: "acme", name: "Acme Ltda" });
      result.current.toggleTenant({ id: "beta", name: "Beta S.A." });
    });

    expect(result.current.diff.unchanged).toEqual([{ id: "acme", name: "Acme Ltda" }]);
    expect(result.current.diff.changing).toEqual([{ id: "beta", name: "Beta S.A." }]);
  });

  it("blocks confirmation when nothing is selected", async () => {
    const { result } = renderHook(() => useBulkTenantLink());

    let ok = true;
    await act(async () => {
      ok = await result.current.confirm("prompt-1");
    });

    expect(ok).toBe(false);
    expect(linkBulkMock).not.toHaveBeenCalled();
    expect(result.current.submitError).toBe("Selecione ao menos um tenant.");
  });

  it("applies nothing and exposes blockers on TENANT_NOT_FOUND", async () => {
    linkBulkMock.mockResolvedValue({
      ok: false,
      status: 404,
      code: "TENANT_NOT_FOUND",
      message: "1 tenant informado não existe. Nenhum vínculo foi aplicado.",
      blockers: [{ type: "tenant", id: "inexistente-1" }],
      retryable: false,
    });
    const { result } = renderHook(() => useBulkTenantLink());

    act(() => {
      result.current.toggleTenant({ id: "inexistente-1", name: "inexistente-1" });
    });

    let ok = true;
    await act(async () => {
      ok = await result.current.confirm("prompt-1");
    });

    expect(ok).toBe(false);
    expect(result.current.submitError).toBe(
      "1 tenant informado não existe. Nenhum vínculo foi aplicado.",
    );
    expect(result.current.blockers).toEqual([{ type: "tenant", id: "inexistente-1" }]);
    expect(result.current.linkedCount).toBeNull();
  });

  it("returns the linked count on success", async () => {
    linkBulkMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { prompt_id: "prompt-1", node_type: "operational", linked_count: 2, tenant_ids: ["acme", "beta"] },
    });
    const { result } = renderHook(() => useBulkTenantLink());

    act(() => {
      result.current.toggleTenant({ id: "acme", name: "Acme Ltda" });
      result.current.toggleTenant({ id: "beta", name: "Beta S.A." });
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.confirm("prompt-1");
    });

    expect(ok).toBe(true);
    expect(linkBulkMock).toHaveBeenCalledWith({
      prompt_id: "prompt-1",
      tenant_ids: ["acme", "beta"],
    });
    expect(result.current.linkedCount).toBe(2);
  });

  it("searches tenants via searchTenants", async () => {
    searchMock.mockResolvedValue({
      ok: true,
      status: 200,
      tenants: [
        {
          id: "acme",
          name: "Acme Ltda",
          google_calendar_id: "x@g.com",
          created_at: "2026-01-01",
          updated_at: null,
          deleted_at: null,
          allowed_domains: [],
          scheduling_enabled: true,
        },
      ],
    });
    const { result } = renderHook(() => useBulkTenantLink());

    await act(async () => {
      await result.current.search("Acme");
    });

    expect(searchMock).toHaveBeenCalledWith("Acme");
    expect(result.current.searchResults).toHaveLength(1);
  });
});
