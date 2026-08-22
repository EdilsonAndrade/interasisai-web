import { act, renderHook } from "@testing-library/react";
import { fetchTenantPromptDetail } from "@/services/promptManager";
import { useTenantNodePrompts } from "./useTenantNodePrompts";

jest.mock("@/services/promptManager", () => ({
  fetchTenantPromptDetail: jest.fn(),
}));

const fetchMock = jest.mocked(fetchTenantPromptDetail);

function detailFor(nodeType: "operational" | "institutional" | "chitchat", isDefault: boolean) {
  return {
    tenant_id: "tenant-1",
    node_type: nodeType,
    prompt_id: isDefault ? "prompt-default" : `prompt-${nodeType}`,
    is_active: true,
    custom_content_override: null,
    prompt_titulo: isDefault ? "Padrão" : `Prompt ${nodeType}`,
    prompt_conteudo: "...",
    is_default_prompt: isDefault,
    guardrails_associados: [],
  };
}

describe("useTenantNodePrompts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches all three node types in parallel and derives linked/missing per node", async () => {
    fetchMock.mockImplementation(async (_tenantId, nodeType) => {
      if (nodeType === "operational") return { ok: true, status: 200, data: detailFor("operational", false) };
      if (nodeType === "institutional") return { ok: true, status: 200, data: detailFor("institutional", true) };
      return { ok: true, status: 200, data: detailFor("chitchat", false) };
    });

    const { result } = renderHook(() => useTenantNodePrompts());

    await act(async () => {
      await result.current.fetchAll("tenant-1");
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenCalledWith("tenant-1", "operational");
    expect(fetchMock).toHaveBeenCalledWith("tenant-1", "institutional");
    expect(fetchMock).toHaveBeenCalledWith("tenant-1", "chitchat");

    expect(result.current.entries.operational.state).toBe("linked");
    expect(result.current.entries.institutional.state).toBe("missing");
    expect(result.current.entries.chitchat.state).toBe("linked");
  });

  it("dispatches the three calls before any of them resolves (parallel, not sequential)", () => {
    let resolveCount = 0;
    fetchMock.mockImplementation(() => {
      resolveCount += 1;
      return new Promise(() => {}); // never resolves within this test
    });

    const { result } = renderHook(() => useTenantNodePrompts());

    act(() => {
      result.current.fetchAll("tenant-1");
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(resolveCount).toBe(3);
  });

  it("surfaces a per-node error without affecting the other node types", async () => {
    fetchMock.mockImplementation(async (_tenantId, nodeType) => {
      if (nodeType === "operational") {
        return { ok: false, status: 500, message: "Erro interno do servidor. Tente novamente.", blockers: [], retryable: true };
      }
      return { ok: true, status: 200, data: detailFor(nodeType!, false) };
    });

    const { result } = renderHook(() => useTenantNodePrompts());

    await act(async () => {
      await result.current.fetchAll("tenant-1");
    });

    expect(result.current.entries.operational.state).toBe("error");
    expect(result.current.entries.operational.error).toBe("Erro interno do servidor. Tente novamente.");
    expect(result.current.entries.institutional.state).toBe("linked");
    expect(result.current.entries.chitchat.state).toBe("linked");
  });

  it("resets to idle for all node types via clear()", async () => {
    fetchMock.mockImplementation(async (_tenantId, nodeType) => ({
      ok: true,
      status: 200,
      data: detailFor(nodeType!, false),
    }));
    const { result } = renderHook(() => useTenantNodePrompts());

    await act(async () => {
      await result.current.fetchAll("tenant-1");
    });
    expect(result.current.entries.operational.state).toBe("linked");

    act(() => {
      result.current.clear();
    });

    expect(result.current.entries.operational.state).toBe("idle");
    expect(result.current.entries.institutional.state).toBe("idle");
    expect(result.current.entries.chitchat.state).toBe("idle");
  });
});
