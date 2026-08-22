import {
  createTenant,
  deleteTenant,
  getTenantById,
  updateTenant,
} from "./pythonBackend";

const tenant = {
  id: "tenant/one",
  name: "Tenant One",
  google_calendar_id: "agenda@group.calendar.google.com",
  allowed_domains: ["example.com"],
  scheduling_enabled: true,
  created_at: "2026-08-08T10:00:00Z",
  updated_at: "2026-08-08T10:00:00Z",
  deleted_at: null,
};

const fetchMock = jest.fn();
const response = (status: number, payload?: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});

describe("tenant API", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("creates a tenant with the exact payload", async () => {
    fetchMock.mockResolvedValueOnce(response(201, tenant));

    const result = await createTenant({
      tenant_id: tenant.id,
      name: tenant.name,
      google_calendar_id: tenant.google_calendar_id,
      allowed_domains: tenant.allowed_domains,
      scheduling_enabled: tenant.scheduling_enabled,
      prompt_id: "prompt-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/tenants/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant.id,
          name: tenant.name,
          google_calendar_id: tenant.google_calendar_id,
          allowed_domains: tenant.allowed_domains,
          scheduling_enabled: tenant.scheduling_enabled,
          prompt_id: "prompt-1",
        }),
      }),
    );
    expect(result).toEqual({ ok: true, status: 201, tenant });
  });

  it("gets a tenant by safely encoded id", async () => {
    fetchMock.mockResolvedValueOnce(response(200, tenant));

    await getTenantById("tenant/one");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/tenants/tenant%2Fone",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("updates a tenant with the exact payload", async () => {
    fetchMock.mockResolvedValueOnce(response(200, { ...tenant, name: "New" }));

    const result = await updateTenant("tenant/one", {
      name: "New",
      google_calendar_id: tenant.google_calendar_id,
      allowed_domains: tenant.allowed_domains,
      scheduling_enabled: tenant.scheduling_enabled,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/tenants/tenant%2Fone",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          name: "New",
          google_calendar_id: tenant.google_calendar_id,
          allowed_domains: tenant.allowed_domains,
          scheduling_enabled: tenant.scheduling_enabled,
        }),
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("accepts a bodyless successful deletion", async () => {
    fetchMock.mockResolvedValueOnce(response(204));

    await expect(deleteTenant("tenant/one")).resolves.toEqual({
      ok: true,
      status: 204,
    });
  });

  it("accepts a successful deletion body without depending on its shape", async () => {
    fetchMock.mockResolvedValueOnce(response(200, { message: "deleted" }));

    await expect(deleteTenant("tenant/one")).resolves.toEqual({
      ok: true,
      status: 200,
    });
  });

  it("normalizes deletion failures", async () => {
    fetchMock
      .mockResolvedValueOnce(response(404, { detail: "missing" }))
      .mockRejectedValueOnce(new Error("offline"));

    await expect(deleteTenant("missing")).resolves.toEqual(
      expect.objectContaining({ ok: false, message: "Tenant não encontrado" }),
    );
    await expect(deleteTenant("tenant/one")).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 0, retryable: true }),
    );
  });

  it("normalizes 404 and field validation errors", async () => {
    fetchMock
      .mockResolvedValueOnce(response(404, { detail: "missing" }))
      .mockResolvedValueOnce(
        response(422, {
          detail: [
            { loc: ["body", "name"], msg: "Nome já utilizado" },
          ],
        }),
      );

    await expect(getTenantById("missing")).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        status: 404,
        message: "Tenant não encontrado",
      }),
    );
    await expect(
      createTenant({
        tenant_id: "tenant-1",
        name: "Existing",
        google_calendar_id: "calendar",
        allowed_domains: ["example.com"],
        scheduling_enabled: true,
        prompt_id: "prompt-1",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        status: 422,
        fieldErrors: { name: "Nome já utilizado" },
      }),
    );
  });

  it("rejects an invalid success response", async () => {
    fetchMock.mockResolvedValueOnce(response(200, { id: "incomplete" }));

    await expect(getTenantById("incomplete")).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 502 }),
    );
  });

  it("returns a retryable network failure without logging tenant data", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    await expect(getTenantById("secret-id")).resolves.toEqual({
      ok: false,
      status: 0,
      code: undefined,
      message: "Não foi possível concluir a operação. Tente novamente.",
      blockers: [],
      fieldErrors: undefined,
      retryable: true,
    });
  });
});