import { act, renderHook } from "@testing-library/react";
import { fetchTenantPromptDetail } from "@/services/promptManager";
import type { TenantPromptDetailResult } from "@/services/promptManager.types";
import { useTenantContext } from "./useTenantContext";

jest.mock("@/services/promptManager", () => ({
  fetchTenantPromptDetail: jest.fn(),
}));

const fetchTenantPromptDetailMock = jest.mocked(fetchTenantPromptDetail);

const detail = {
  tenant_id: "tenant-1",
  node_type: "operational" as const,
  prompt_id: "prompt-1",
  is_active: true,
  custom_content_override: null,
  prompt_titulo: "Prompt Padrão",
  prompt_conteudo: "conteúdo",
  is_default_prompt: true,
  guardrails_associados: [],
};

describe("useTenantContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with no detail selected", () => {
    const { result } = renderHook(() => useTenantContext());

    expect(result.current.detail).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("populates the detail on success", async () => {
    fetchTenantPromptDetailMock.mockResolvedValue({ ok: true, status: 200, data: detail });
    const { result } = renderHook(() => useTenantContext());

    await act(async () => {
      await result.current.selectTenant("tenant-1");
    });

    expect(fetchTenantPromptDetailMock).toHaveBeenCalledWith("tenant-1");
    expect(result.current.detail).toEqual(detail);
    expect(result.current.loading).toBe(false);
  });

  it("surfaces a failure (e.g. tenant not found)", async () => {
    fetchTenantPromptDetailMock.mockResolvedValue({
      ok: false,
      status: 404,
      message: "Tenant não encontrado",
      blockers: [],
      retryable: false,
    });
    const { result } = renderHook(() => useTenantContext());

    await act(async () => {
      await result.current.selectTenant("missing");
    });

    expect(result.current.error).toBe("Tenant não encontrado");
    expect(result.current.detail).toBeNull();
  });

  it("clear() resets state and invalidates any in-flight request", async () => {
    let resolveDetail!: (value: TenantPromptDetailResult) => void;
    fetchTenantPromptDetailMock.mockReturnValue(
      new Promise((resolve) => {
        resolveDetail = resolve;
      }),
    );
    const { result } = renderHook(() => useTenantContext());

    let selectPromise!: Promise<void>;
    act(() => {
      selectPromise = result.current.selectTenant("tenant-1");
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.detail).toBeNull();
    expect(result.current.loading).toBe(false);

    await act(async () => {
      resolveDetail({ ok: true, status: 200, data: detail });
      await selectPromise;
    });

    // The response for the cleared selection must not repopulate detail.
    expect(result.current.detail).toBeNull();
  });

  it("discards a stale response when a different tenant is selected first", async () => {
    let resolveFirst!: (value: TenantPromptDetailResult) => void;
    const firstPromise = new Promise<TenantPromptDetailResult>((resolve) => {
      resolveFirst = resolve;
    });
    const secondDetail = { ...detail, tenant_id: "tenant-2" };

    fetchTenantPromptDetailMock
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ ok: true, status: 200, data: secondDetail });

    const { result } = renderHook(() => useTenantContext());

    let firstSelect!: Promise<void>;
    act(() => {
      firstSelect = result.current.selectTenant("tenant-1");
    });
    await act(async () => {
      await result.current.selectTenant("tenant-2");
    });

    expect(result.current.detail).toEqual(secondDetail);

    await act(async () => {
      resolveFirst({ ok: true, status: 200, data: detail });
      await firstSelect;
    });

    expect(result.current.detail).toEqual(secondDetail);
  });
});
