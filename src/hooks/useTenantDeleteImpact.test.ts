import { act, renderHook } from "@testing-library/react";
import { fetchTenantDeleteImpact } from "@/services/pythonBackend";
import { useTenantDeleteImpact } from "./useTenantDeleteImpact";

jest.mock("@/services/pythonBackend", () => ({
  fetchTenantDeleteImpact: jest.fn(),
}));

const fetchMock = jest.mocked(fetchTenantDeleteImpact);

const impact = {
  tenant_id: "tenant-1",
  prompts_to_delete: [{ id: "p1", titulo: "Prompt exclusivo" }],
  prompts_to_unlink_only: [],
  guardrails_to_delete: [],
  guardrails_to_unlink_only: [{ id: "g1", titulo: "Guardrail global", is_global: true }],
};

describe("useTenantDeleteImpact", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts idle and moves to loaded on success", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: impact });
    const { result } = renderHook(() => useTenantDeleteImpact());

    expect(result.current.state).toBe("idle");

    await act(async () => {
      await result.current.fetchImpact("tenant-1");
    });

    expect(fetchMock).toHaveBeenCalledWith("tenant-1");
    expect(result.current.state).toBe("loaded");
    expect(result.current.impact).toEqual(impact);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error state on failure, without keeping stale impact data", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 0,
      message: "Não foi possível concluir a operação. Tente novamente.",
      blockers: [],
      retryable: true,
    });
    const { result } = renderHook(() => useTenantDeleteImpact());

    await act(async () => {
      await result.current.fetchImpact("tenant-1");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.impact).toBeNull();
    expect(result.current.error).toBe("Não foi possível concluir a operação. Tente novamente.");
  });

  it("resets everything to idle via clear()", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: impact });
    const { result } = renderHook(() => useTenantDeleteImpact());

    await act(async () => {
      await result.current.fetchImpact("tenant-1");
    });
    expect(result.current.state).toBe("loaded");

    act(() => {
      result.current.clear();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.impact).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
