import { act, renderHook } from "@testing-library/react";
import {
  createTenant,
  deleteTenant,
  getTenantById,
  updateTenant,
} from "@/services";
import { useTenantManagement } from "./useTenantManagement";

jest.mock("@/services", () => ({
  createTenant: jest.fn(),
  deleteTenant: jest.fn(),
  getTenantById: jest.fn(),
  updateTenant: jest.fn(),
}));

const createMock = jest.mocked(createTenant);
const getMock = jest.mocked(getTenantById);
const updateMock = jest.mocked(updateTenant);
const deleteMock = jest.mocked(deleteTenant);
const tenant = {
  id: "tenant-1",
  name: "Tenant One",
  google_calendar_id: "calendar",
  allowed_domains: ["example.com"],
  created_at: "2026-08-08T10:00:00Z",
  updated_at: "2026-08-08T10:00:00Z",
  deleted_at: null,
};

describe("useTenantManagement", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates and stores the returned tenant", async () => {
    createMock.mockResolvedValue({ ok: true, status: 201, tenant });
    getMock
      .mockResolvedValueOnce({ ok: true, status: 200, tenant })
      .mockResolvedValueOnce({ ok: true, status: 200, tenant: { ...tenant, name: "Updated" } });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => {
      await result.current.create({
        tenant_id: tenant.id,
        name: tenant.name,
        google_calendar_id: tenant.google_calendar_id,
        allowed_domains: tenant.allowed_domains,
      });
    });

    expect(result.current.tenant).toEqual(tenant);
    expect(result.current.feedback).toBe("Tenant cadastrado com sucesso");
  });

  it("blocks duplicate requests while one is pending", async () => {
    let resolveRequest: typeof createMock extends jest.MockedFunction<
      (...args: infer _Args) => Promise<infer Result>
    >
      ? (value: Result) => void
      : never = () => undefined;
    createMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRequest = resolve; }),
    );
    const { result } = renderHook(() => useTenantManagement());
    const input = {
      tenant_id: "tenant-1",
      name: "Tenant",
      google_calendar_id: "calendar",
      allowed_domains: ["example.com"],
    };

    let firstRequest: Promise<boolean> = Promise.resolve(false);
    act(() => {
      firstRequest = result.current.create(input);
    });
    await act(async () => {
      expect(await result.current.create(input)).toBe(false);
      resolveRequest({ ok: true, status: 201, tenant });
      getMock.mockResolvedValue({ ok: true, status: 200, tenant });
      await firstRequest;
    });

    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("looks up, updates and deletes the current tenant", async () => {
    getMock
      .mockResolvedValueOnce({ ok: true, status: 200, tenant })
      .mockResolvedValueOnce({ ok: true, status: 200, tenant: { ...tenant, name: "Updated" } });
    updateMock.mockResolvedValue({
      ok: true,
      status: 200,
      tenant: { ...tenant, name: "Updated" },
    });
    deleteMock.mockResolvedValue({ ok: true, status: 204 });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => { await result.current.lookup("tenant-1"); });
    await act(async () => {
      await result.current.update({ name: "Updated", google_calendar_id: "calendar", allowed_domains: ["example.com"] });
    });
    expect(result.current.tenant?.name).toBe("Updated");
    expect(result.current.feedback).toBe("Tenant atualizado com sucesso");

    await act(async () => { await result.current.remove(); });
    expect(result.current.tenant).toBeNull();
    expect(result.current.feedback).toBe("Tenant excluído com sucesso");
  });

  it("exposes field errors and keeps the current tenant on failure", async () => {
    getMock.mockResolvedValue({ ok: true, status: 200, tenant });
    updateMock.mockResolvedValue({
      ok: false,
      status: 422,
      message: "Revise os campos informados.",
      retryable: false,
      fieldErrors: { name: "Nome já utilizado" },
    });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => { await result.current.lookup("tenant-1"); });
    await act(async () => {
      await result.current.update({ name: "Existing", google_calendar_id: "calendar", allowed_domains: ["example.com"] });
    });

    expect(result.current.tenant).toEqual(tenant);
    expect(result.current.fieldErrors).toEqual({ name: "Nome já utilizado" });
    expect(result.current.error).toBe("Revise os campos informados.");
  });
});