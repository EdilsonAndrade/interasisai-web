import {
  createTenant,
  deleteTenant,
  getTenantById,
  updateTenant,
  getTenantUsage,
  getMessageLimitConfig,
  listGlobalRecipients,
  createGlobalRecipient,
  updateGlobalRecipient,
  deleteGlobalRecipient,
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
  monthly_message_limit: null,
  notification_emails: [],
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
      monthly_message_limit: null,
      notification_emails: [],
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
          monthly_message_limit: null,
          notification_emails: [],
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
      monthly_message_limit: 500,
      notification_emails: ["manager@buffet.com"],
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
          monthly_message_limit: 500,
          notification_emails: ["manager@buffet.com"],
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

describe("tenant usage API (EDI-63)", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("fetches usage for a tenant", async () => {
    const usage = {
      tenant_id: "tenant/one",
      monthly_message_limit: 500,
      current_month_calls: 156,
      percentage_used: 31.2,
      blocked: false,
    };
    fetchMock.mockResolvedValueOnce(response(200, usage));

    const result = await getTenantUsage("tenant/one");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/tenants/tenant%2Fone/usage",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result).toEqual({ ok: true, status: 200, data: usage });
  });

  it("returns failure on 404 for usage", async () => {
    fetchMock.mockResolvedValueOnce(response(404, { detail: "Tenant not found" }));

    await expect(getTenantUsage("missing")).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 404 }),
    );
  });

  it("returns a retryable failure on network error for usage", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    await expect(getTenantUsage("tenant/one")).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 0, retryable: true }),
    );
  });

  it("fetches the message-limit config", async () => {
    const config = { worst_case_calls_per_message: 3, average_calls_per_message: 3.0 };
    fetchMock.mockResolvedValueOnce(response(200, config));

    const result = await getMessageLimitConfig();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/tenants/message-limit-config",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result).toEqual({ ok: true, status: 200, data: config });
  });

  it("returns a retryable failure on network error for message-limit config", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    await expect(getMessageLimitConfig()).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 0, retryable: true }),
    );
  });
});

describe("global notification recipients API (EDI-63)", () => {
  const recipient = {
    id: 1,
    email: "alerts@interasisai.com.br",
    active: true,
    created_at: "2026-08-25T10:00:00Z",
  };

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("lists global recipients", async () => {
    fetchMock.mockResolvedValueOnce(response(200, [recipient]));

    const result = await listGlobalRecipients();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/global-notification-recipients/",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result).toEqual({ ok: true, status: 200, items: [recipient] });
  });

  it("creates a global recipient", async () => {
    fetchMock.mockResolvedValueOnce(response(201, recipient));

    const result = await createGlobalRecipient("alerts@interasisai.com.br");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/global-notification-recipients/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "alerts@interasisai.com.br" }),
      }),
    );
    expect(result).toEqual({ ok: true, status: 201, recipient });
  });

  it("surfaces a 409 duplicate email with a specific code", async () => {
    fetchMock.mockResolvedValueOnce(
      response(409, {
        detail: { code: "EMAIL_ALREADY_EXISTS", message: "E-mail já cadastrado." },
      }),
    );

    await expect(createGlobalRecipient("dup@interasisai.com.br")).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
      }),
    );
  });

  it("updates the active flag of a recipient", async () => {
    fetchMock.mockResolvedValueOnce(response(200, { ...recipient, active: false }));

    const result = await updateGlobalRecipient(1, false);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/global-notification-recipients/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ active: false }),
      }),
    );
    expect(result).toEqual({ ok: true, status: 200, recipient: { ...recipient, active: false } });
  });

  it("returns 404 when updating a missing recipient", async () => {
    fetchMock.mockResolvedValueOnce(response(404, {}));

    await expect(updateGlobalRecipient(999, true)).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 404 }),
    );
  });

  it("deletes a recipient", async () => {
    fetchMock.mockResolvedValueOnce(response(200, { id: 1, message: "deleted" }));

    await expect(deleteGlobalRecipient(1)).resolves.toEqual({ ok: true, status: 200 });
  });

  it("returns 404 when deleting a missing recipient", async () => {
    fetchMock.mockResolvedValueOnce(response(404, {}));

    await expect(deleteGlobalRecipient(999)).resolves.toEqual(
      expect.objectContaining({ ok: false, status: 404 }),
    );
  });
});