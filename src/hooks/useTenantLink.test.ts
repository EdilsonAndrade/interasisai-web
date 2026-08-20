import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { fetchTenantPromptDetail, linkTenantToPrompt } from "@/services/promptManager";
import { useTenantLink } from "./useTenantLink";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/services/promptManager", () => ({
  fetchTenantPromptDetail: jest.fn(),
  linkTenantToPrompt: jest.fn(),
}));

const fetchTenantPromptDetailMock = jest.mocked(fetchTenantPromptDetail);
const linkTenantToPromptMock = jest.mocked(linkTenantToPrompt);

const tenantDetail = {
  tenant_id: "tenant-1",
  prompt_id: "prompt-1",
  is_active: true,
  custom_content_override: null,
  prompt_titulo: "Prompt Padrão",
  prompt_conteudo_base: "conteúdo",
  prompt_is_default: true,
  guardrails_associados: [],
};

describe("useTenantLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not set a blocking error when the tenant has no prompt linked yet (404)", async () => {
    fetchTenantPromptDetailMock.mockResolvedValue({
      ok: false,
      status: 404,
      message: "Item não encontrado.",
      retryable: false,
    });
    const { result } = renderHook(() => useTenantLink());

    await act(async () => {
      await result.current.fetchDetail("tenant-sem-vinculo");
    });

    expect(result.current.tenantNotFound).toBe(true);
    expect(result.current.detailError).toBeNull();
    expect(result.current.tenantDetail).toBeNull();
  });

  it("sets a non-blocking detailError for a real failure (not 404)", async () => {
    fetchTenantPromptDetailMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      retryable: true,
    });
    const { result } = renderHook(() => useTenantLink());

    await act(async () => {
      await result.current.fetchDetail("tenant-1");
    });

    expect(result.current.tenantNotFound).toBe(false);
    expect(result.current.detailError).toBe("Erro interno do servidor. Tente novamente.");
  });

  it("populates tenantDetail when found", async () => {
    fetchTenantPromptDetailMock.mockResolvedValue({ ok: true, status: 200, data: tenantDetail });
    const { result } = renderHook(() => useTenantLink());

    await act(async () => {
      await result.current.fetchDetail("tenant-1");
    });

    expect(result.current.tenantDetail).toEqual(tenantDetail);
    expect(result.current.tenantNotFound).toBe(false);
  });

  it("refreshes tenantDetail after a successful link, without requiring another manual search", async () => {
    linkTenantToPromptMock.mockResolvedValue({ ok: true, status: 200, data: null });
    fetchTenantPromptDetailMock.mockResolvedValue({ ok: true, status: 200, data: tenantDetail });
    const { result } = renderHook(() => useTenantLink());

    await act(async () => {
      await result.current.linkTenant({ tenant_id: "tenant-1", prompt_id: "prompt-1" });
    });

    expect(fetchTenantPromptDetailMock).toHaveBeenCalledWith("tenant-1");
    expect(result.current.tenantDetail).toEqual(tenantDetail);
    expect(toast.success).toHaveBeenCalled();
  });
});
