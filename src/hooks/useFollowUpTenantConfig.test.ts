import { act, renderHook } from "@testing-library/react";
import { getFollowUpTenantConfig, updateFollowUpTenantConfig } from "@/services/followUpApi";
import type { FollowUpTenantConfig } from "@/services/followUpApi.types";
import { useFollowUpTenantConfig } from "./useFollowUpTenantConfig";

jest.mock("@/services/followUpApi", () => ({
  getFollowUpTenantConfig: jest.fn(),
  updateFollowUpTenantConfig: jest.fn(),
}));

const getFollowUpTenantConfigMock = jest.mocked(getFollowUpTenantConfig);
const updateFollowUpTenantConfigMock = jest.mocked(updateFollowUpTenantConfig);

const config: FollowUpTenantConfig = {
  id: "acme",
  name: "ACME Inc",
  oferta_vigente_texto: "Desconto de 10% + frete grátis",
  oferta_vigente_validade: "2026-12-31T23:59:59Z",
  retention_days: 90,
};

describe("useFollowUpTenantConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads the tenant config on fetchConfig", async () => {
    getFollowUpTenantConfigMock.mockResolvedValue({ ok: true, status: 200, data: config });
    const { result } = renderHook(() => useFollowUpTenantConfig());

    await act(async () => {
      await result.current.fetchConfig("acme");
    });

    expect(result.current.config).toEqual(config);
    expect(result.current.error).toBeNull();
  });

  it("refuses to save before a config has been loaded", async () => {
    const { result } = renderHook(() => useFollowUpTenantConfig());

    await act(async () => {
      await result.current.updateConfig("acme", { retention_days: 120 });
    });

    expect(updateFollowUpTenantConfigMock).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Configuração não carregada");
  });

  it("merges updates into the full config before sending the PUT", async () => {
    getFollowUpTenantConfigMock.mockResolvedValue({ ok: true, status: 200, data: config });
    const updated = { ...config, retention_days: 120 };
    updateFollowUpTenantConfigMock.mockResolvedValue({ ok: true, status: 200, data: updated });

    const { result } = renderHook(() => useFollowUpTenantConfig());
    await act(async () => {
      await result.current.fetchConfig("acme");
    });
    await act(async () => {
      await result.current.updateConfig("acme", { retention_days: 120 });
    });

    expect(updateFollowUpTenantConfigMock).toHaveBeenCalledWith("acme", updated);
    expect(result.current.config).toEqual(updated);
    expect(result.current.saving).toBe(false);
  });

  it("surfaces a save failure without clearing the current config", async () => {
    getFollowUpTenantConfigMock.mockResolvedValue({ ok: true, status: 200, data: config });
    updateFollowUpTenantConfigMock.mockResolvedValue({
      ok: false,
      status: 422,
      message: "Dados inválidos. Verifique os campos.",
      retryable: false,
    });

    const { result } = renderHook(() => useFollowUpTenantConfig());
    await act(async () => {
      await result.current.fetchConfig("acme");
    });
    await act(async () => {
      await result.current.updateConfig("acme", { retention_days: -1 });
    });

    expect(result.current.error).toBe("Dados inválidos. Verifique os campos.");
    expect(result.current.config).toEqual(config);
  });
});
