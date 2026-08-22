import { act, renderHook } from "@testing-library/react";
import { fetchTenantPromptDetail, linkTenantToPrompt } from "@/services/promptManager";
import { useTenantPromptBinding } from "./useTenantPromptBinding";

jest.mock("@/services/promptManager", () => ({
  fetchTenantPromptDetail: jest.fn(),
  linkTenantToPrompt: jest.fn(),
}));

const fetchMock = jest.mocked(fetchTenantPromptDetail);
const linkMock = jest.mocked(linkTenantToPrompt);

const linkedDetail = {
  tenant_id: "tenant-1",
  node_type: "operational" as const,
  prompt_id: "prompt-1",
  is_active: true,
  custom_content_override: null,
  prompt_titulo: "Atendimento Clínica",
  prompt_conteudo: "...",
  is_default_prompt: false,
  guardrails_associados: [],
};

const missingDetail = {
  ...linkedDetail,
  prompt_id: "prompt-default",
  prompt_titulo: "Atendimento Padrão",
  is_default_prompt: true,
};

describe("useTenantPromptBinding", () => {
  beforeEach(() => jest.clearAllMocks());

  it("derives the linked state from a tenant with its own binding", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: linkedDetail });
    const { result } = renderHook(() => useTenantPromptBinding());

    await act(async () => {
      await result.current.fetchBinding("tenant-1");
    });

    expect(fetchMock).toHaveBeenCalledWith("tenant-1", "operational");
    expect(result.current.state).toBe("linked");
    expect(result.current.detail).toEqual(linkedDetail);
  });

  it("derives the missing state via isPromptBindingMissing, not by reading is_default_prompt directly", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: missingDetail });
    const { result } = renderHook(() => useTenantPromptBinding());

    await act(async () => {
      await result.current.fetchBinding("tenant-1");
    });

    expect(result.current.state).toBe("missing");
  });

  it("surfaces an error state on failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      blockers: [],
      retryable: true,
    });
    const { result } = renderHook(() => useTenantPromptBinding());

    await act(async () => {
      await result.current.fetchBinding("tenant-1");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Erro interno do servidor. Tente novamente.");
  });

  it("re-fetches from the server after a successful link, instead of assuming local state", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, status: 200, data: missingDetail })
      .mockResolvedValueOnce({ ok: true, status: 200, data: linkedDetail });
    linkMock.mockResolvedValue({ ok: true, status: 200, data: null });
    const { result } = renderHook(() => useTenantPromptBinding());

    await act(async () => {
      await result.current.fetchBinding("tenant-1");
    });
    expect(result.current.state).toBe("missing");

    await act(async () => {
      await result.current.linkPrompt("tenant-1", "prompt-1");
    });

    expect(linkMock).toHaveBeenCalledWith({ tenant_id: "tenant-1", prompt_id: "prompt-1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe("linked");
  });

  it("keeps the missing state and surfaces the error when linking fails", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: missingDetail });
    linkMock.mockResolvedValue({
      ok: false,
      status: 404,
      code: "PROMPT_NOT_FOUND",
      message: "Prompt não encontrado.",
      blockers: [],
      retryable: false,
    });
    const { result } = renderHook(() => useTenantPromptBinding());

    await act(async () => {
      await result.current.fetchBinding("tenant-1");
    });
    await act(async () => {
      const ok = await result.current.linkPrompt("tenant-1", "prompt-x");
      expect(ok).toBe(false);
    });

    expect(result.current.state).toBe("missing");
    expect(result.current.error).toBe("Prompt não encontrado.");
  });
});
