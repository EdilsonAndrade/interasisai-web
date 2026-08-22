import { act, renderHook } from "@testing-library/react";
import {
  createTenant,
  deleteTenant,
  getTenantById,
  updateTenant,
} from "@/services";
import { createPrompt } from "@/services/promptManager";
import { useTenantManagement } from "./useTenantManagement";

jest.mock("@/services", () => ({
  createTenant: jest.fn(),
  deleteTenant: jest.fn(),
  getTenantById: jest.fn(),
  updateTenant: jest.fn(),
}));

jest.mock("@/services/promptManager", () => ({
  createPrompt: jest.fn(),
}));

const createMock = jest.mocked(createTenant);
const getMock = jest.mocked(getTenantById);
const updateMock = jest.mocked(updateTenant);
const deleteMock = jest.mocked(deleteTenant);
const createPromptMock = jest.mocked(createPrompt);

const tenant = {
  id: "tenant-1",
  name: "Tenant One",
  google_calendar_id: "calendar",
  allowed_domains: ["example.com"],
  created_at: "2026-08-08T10:00:00Z",
  updated_at: "2026-08-08T10:00:00Z",
  deleted_at: null,
};

const base = {
  tenant_id: tenant.id,
  name: tenant.name,
  google_calendar_id: tenant.google_calendar_id,
  allowed_domains: tenant.allowed_domains,
};

const newPromptDraft = {
  titulo: "Novo Prompt",
  conteudo: "Texto {guardrails}",
  is_default: false,
  node_type: "operational" as const,
  guardrail_ids: [],
};

const createdPrompt = {
  id: "prompt-1",
  titulo: newPromptDraft.titulo,
  conteudo: newPromptDraft.conteudo,
  is_default: false,
  node_type: "operational" as const,
  guardrail_ids: [],
};

describe("useTenantManagement", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates and stores the returned tenant (existing prompt intent)", async () => {
    createMock.mockResolvedValue({ ok: true, status: 201, tenant });
    getMock.mockResolvedValue({ ok: true, status: 200, tenant });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => {
      await result.current.create(base, { mode: "existing", prompt_id: "prompt-existing" });
    });

    expect(createMock).toHaveBeenCalledWith(
      { ...base, prompt_id: "prompt-existing" },
      expect.anything(),
    );
    expect(createPromptMock).not.toHaveBeenCalled();
    expect(result.current.tenant).toEqual(tenant);
    expect(result.current.feedback).toBe("Tenant cadastrado com sucesso");
  });

  it("creates the prompt first, then the tenant, in the new-prompt intent", async () => {
    createPromptMock.mockResolvedValue({ ok: true, status: 201, data: createdPrompt });
    createMock.mockResolvedValue({ ok: true, status: 201, tenant });
    getMock.mockResolvedValue({ ok: true, status: 200, tenant });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => {
      await result.current.create(base, { mode: "new", prompt: newPromptDraft });
    });

    expect(createPromptMock).toHaveBeenCalledWith(newPromptDraft, expect.anything());
    expect(createMock).toHaveBeenCalledWith(
      { ...base, prompt_id: "prompt-1" },
      expect.anything(),
    );
    expect(result.current.tenant).toEqual(tenant);
  });

  it("keeps the created prompt and does not create a second one when the tenant step fails and the retry reuses it", async () => {
    createPromptMock.mockResolvedValue({ ok: true, status: 201, data: createdPrompt });
    createMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      message: "ID já em uso.",
      blockers: [],
      retryable: false,
    });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => {
      await result.current.create(base, { mode: "new", prompt: newPromptDraft });
    });

    expect(createPromptMock).toHaveBeenCalledTimes(1);
    expect(result.current.error).toContain("disponível na biblioteca");
    expect(result.current.pendingPromptId).toBe("prompt-1");

    // Retentativa reaproveita o prompt já criado, no modo "existing".
    createMock.mockResolvedValueOnce({ ok: true, status: 201, tenant });
    getMock.mockResolvedValue({ ok: true, status: 200, tenant });
    await act(async () => {
      await result.current.create(base, { mode: "existing", prompt_id: "prompt-1" });
    });

    expect(createPromptMock).toHaveBeenCalledTimes(1);
    expect(result.current.tenant).toEqual(tenant);
  });

  it("does not create a tenant when the prompt step fails", async () => {
    createPromptMock.mockResolvedValue({
      ok: false,
      status: 422,
      message: "Título é obrigatório",
      blockers: [],
      retryable: false,
    });
    const { result } = renderHook(() => useTenantManagement());

    await act(async () => {
      await result.current.create(base, { mode: "new", prompt: newPromptDraft });
    });

    expect(createMock).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Título é obrigatório");
    expect(result.current.tenant).toBeNull();
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
    const intent = { mode: "existing" as const, prompt_id: "prompt-1" };

    let firstRequest: Promise<boolean> = Promise.resolve(false);
    act(() => {
      firstRequest = result.current.create(base, intent);
    });
    await act(async () => {
      expect(await result.current.create(base, intent)).toBe(false);
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
      blockers: [],
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
