import { act, renderHook } from "@testing-library/react";
import { getFollowUpQueueGlobal, listFollowUpTenants } from "@/services/followUpApi";
import type { FollowUpQueueEntry, FollowUpTenantConfig } from "@/services/followUpApi.types";
import { useFollowUpDashboardKPIs } from "./useFollowUpDashboardKPIs";

jest.mock("@/services/followUpApi", () => ({
  getFollowUpQueueGlobal: jest.fn(),
  listFollowUpTenants: jest.fn(),
}));

const getFollowUpQueueGlobalMock = jest.mocked(getFollowUpQueueGlobal);
const listFollowUpTenantsMock = jest.mocked(listFollowUpTenants);

function entry(overrides: Partial<FollowUpQueueEntry>): FollowUpQueueEntry {
  return {
    id: 1,
    tenant_id: "acme",
    base_thread_id: "acme:1",
    customer_name: null,
    outcome: "fechado",
    summary: "resumo",
    draft_message: null,
    status: "pendente",
    created_at: "2026-08-26T20:00:00Z",
    ...overrides,
  };
}

const expiredTenant: FollowUpTenantConfig = {
  id: "acme",
  name: "ACME Inc",
  oferta_vigente_texto: "10% off",
  oferta_vigente_validade: "2020-01-01T00:00:00Z",
  retention_days: 90,
};

const activeTenant: FollowUpTenantConfig = {
  id: "outra",
  name: "Outra Empresa",
  oferta_vigente_texto: null,
  oferta_vigente_validade: null,
  retention_days: 90,
};

describe("useFollowUpDashboardKPIs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("computes pendentes, outcome breakdown, expired tenants and recent sessions", async () => {
    getFollowUpQueueGlobalMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        entries: [
          entry({ id: 1, status: "pendente", outcome: "sem_resposta", created_at: "2026-08-26T10:00:00Z" }),
          entry({ id: 2, status: "aprovado", outcome: "fechado", created_at: "2026-08-26T12:00:00Z" }),
          entry({ id: 3, status: "pendente", outcome: "sem_resposta", created_at: "2026-08-26T11:00:00Z" }),
        ],
      },
    });
    listFollowUpTenantsMock.mockResolvedValue({ ok: true, status: 200, data: [expiredTenant, activeTenant] });

    const { result } = renderHook(() => useFollowUpDashboardKPIs());

    await act(async () => {
      await result.current.fetchKPIs();
    });

    expect(result.current.kpis?.totalPendentes).toBe(2);
    expect(result.current.kpis?.breakdownByOutcome.sem_resposta).toBe(2);
    expect(result.current.kpis?.breakdownByOutcome.fechado).toBe(1);
    expect(result.current.kpis?.expiredOfferTenants).toEqual([expiredTenant]);
    // most recent session first
    expect(result.current.kpis?.recentSessions.map(e => e.id)).toEqual([2, 3, 1]);
  });

  it("filters expired-tenant detection to the selected tenant", async () => {
    getFollowUpQueueGlobalMock.mockResolvedValue({ ok: true, status: 200, data: { entries: [] } });
    listFollowUpTenantsMock.mockResolvedValue({ ok: true, status: 200, data: [expiredTenant, activeTenant] });

    const { result } = renderHook(() => useFollowUpDashboardKPIs());

    await act(async () => {
      await result.current.fetchKPIs("outra");
    });

    expect(getFollowUpQueueGlobalMock).toHaveBeenCalledWith("outra");
    expect(result.current.kpis?.expiredOfferTenants).toEqual([]);
  });

  it("surfaces a queue failure without crashing on the tenants call", async () => {
    getFollowUpQueueGlobalMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      retryable: true,
    });
    listFollowUpTenantsMock.mockResolvedValue({ ok: true, status: 200, data: [] });

    const { result } = renderHook(() => useFollowUpDashboardKPIs());

    await act(async () => {
      await result.current.fetchKPIs();
    });

    expect(result.current.error).toBe("Erro interno do servidor. Tente novamente.");
    expect(result.current.kpis).toBeNull();
  });
});
