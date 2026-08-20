import { act, renderHook, waitFor } from "@testing-library/react";
import { getKnowledgeBase, saveKnowledgeBase } from "@/services/pythonBackend";
import type { KnowledgeBaseReadResult } from "@/services/pythonBackend.types";
import { useKnowledgeBase } from "./useKnowledgeBase";

jest.mock("@/services/pythonBackend", () => ({
  getKnowledgeBase: jest.fn(),
  saveKnowledgeBase: jest.fn(),
}));

const getKnowledgeBaseMock = jest.mocked(getKnowledgeBase);
const saveKnowledgeBaseMock = jest.mocked(saveKnowledgeBase);

describe("useKnowledgeBase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads the existing content for the given tenant", async () => {
    getKnowledgeBaseMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "1234", content: "conteúdo existente", updated_at: "2026-08-19T10:00:00Z" },
    });

    const { result } = renderHook(() => useKnowledgeBase("1234"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getKnowledgeBaseMock).toHaveBeenCalledWith("1234");
    expect(result.current.content).toBe("conteúdo existente");
    expect(result.current.updatedAt).toBe("2026-08-19T10:00:00Z");
  });

  it("treats content: null as a normal empty state, not an error", async () => {
    getKnowledgeBaseMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "1234", content: null, updated_at: null },
    });

    const { result } = renderHook(() => useKnowledgeBase("1234"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("surfaces a load failure", async () => {
    getKnowledgeBaseMock.mockResolvedValue({
      ok: false,
      status: 404,
      message: "Tenant não encontrado.",
      retryable: false,
    });

    const { result } = renderHook(() => useKnowledgeBase("missing"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Tenant não encontrado.");
  });

  it("save() persists new content and updates the local state on success", async () => {
    getKnowledgeBaseMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "1234", content: null, updated_at: null },
    });
    saveKnowledgeBaseMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "1234", content: "novo texto", updated_at: "2026-08-19T10:05:00Z" },
    });

    const { result } = renderHook(() => useKnowledgeBase("1234"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = false;
    await act(async () => {
      ok = await result.current.save("novo texto");
    });

    expect(saveKnowledgeBaseMock).toHaveBeenCalledWith("1234", "novo texto");
    expect(ok).toBe(true);
    expect(result.current.content).toBe("novo texto");
  });

  it("save() preserves the previous content on failure and exposes field errors", async () => {
    getKnowledgeBaseMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "1234", content: "conteúdo atual", updated_at: "2026-08-19T10:00:00Z" },
    });
    saveKnowledgeBaseMock.mockResolvedValue({
      ok: false,
      status: 422,
      message: "Revise o conteúdo informado.",
      fieldErrors: { content: "content não pode estar vazio" },
      retryable: false,
    });

    const { result } = renderHook(() => useKnowledgeBase("1234"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = true;
    await act(async () => {
      ok = await result.current.save("");
    });

    expect(ok).toBe(false);
    expect(result.current.content).toBe("conteúdo atual");
    expect(result.current.fieldErrors).toEqual({ content: "content não pode estar vazio" });
  });

  it("discards a stale load response when the tenant changes before it resolves", async () => {
    let resolveFirst!: (value: KnowledgeBaseReadResult) => void;
    const firstPromise = new Promise<KnowledgeBaseReadResult>((resolve) => {
      resolveFirst = resolve;
    });
    getKnowledgeBaseMock
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { tenant_id: "2", content: "conteúdo do segundo tenant", updated_at: null },
      });

    const { result, rerender } = renderHook(({ tenantId }) => useKnowledgeBase(tenantId), {
      initialProps: { tenantId: "1" },
    });

    rerender({ tenantId: "2" });
    await waitFor(() => expect(result.current.content).toBe("conteúdo do segundo tenant"));

    await act(async () => {
      resolveFirst({
        ok: true,
        status: 200,
        data: { tenant_id: "1", content: "conteúdo do primeiro tenant", updated_at: null },
      });
    });

    expect(result.current.content).toBe("conteúdo do segundo tenant");
  });
});
