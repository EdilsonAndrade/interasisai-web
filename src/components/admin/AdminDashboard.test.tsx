import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { searchTenants, getKnowledgeBase } from "@/services/pythonBackend";
import { fetchTenantPromptDetail } from "@/services/promptManager";
import type { TenantPromptDetailResult } from "@/services/promptManager.types";
import { AdminDashboard } from "./AdminDashboard";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

jest.mock("@/services/pythonBackend", () => ({
  searchTenants: jest.fn(),
  getKnowledgeBase: jest.fn(),
  saveKnowledgeBase: jest.fn(),
  deleteKnowledgeBase: jest.fn(),
}));

jest.mock("@/services/promptManager", () => ({
  fetchTenantPromptDetail: jest.fn(),
}));

const searchTenantsMock = jest.mocked(searchTenants);
const getKnowledgeBaseMock = jest.mocked(getKnowledgeBase);
const fetchTenantPromptDetailMock = jest.mocked(fetchTenantPromptDetail);

const tenantOne = {
  id: "1",
  name: "Tenant Um",
  google_calendar_id: "a@group.calendar.google.com",
  allowed_domains: ["um.com"],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  deleted_at: null,
};

const tenantTwo = { ...tenantOne, id: "2", name: "Tenant Dois" };

const detailFor = (tenantId: string) => ({
  tenant_id: tenantId,
  node_type: "operational" as const,
  prompt_id: "prompt-1",
  is_active: true,
  custom_content_override: null,
  prompt_titulo: `Prompt de ${tenantId}`,
  prompt_conteudo: "conteúdo",
  is_default_prompt: false,
  guardrails_associados: [],
});

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getKnowledgeBaseMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { tenant_id: "1", content: null, updated_at: null },
    });
  });

  it("searches for a tenant and shows selectable results", async () => {
    searchTenantsMock.mockResolvedValue({ ok: true, status: 200, tenants: [tenantOne] });
    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText("Buscar tenant"), { target: { value: "Tenant" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => expect(searchTenantsMock).toHaveBeenCalledWith("Tenant"));
    expect(await screen.findByText("Tenant Um")).toBeInTheDocument();
  });

  it("selecting a tenant loads its context and knowledge base", async () => {
    searchTenantsMock.mockResolvedValue({ ok: true, status: 200, tenants: [tenantOne] });
    fetchTenantPromptDetailMock.mockResolvedValue({ ok: true, status: 200, data: detailFor("1") });
    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText("Buscar tenant"), { target: { value: "Tenant" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    fireEvent.click(await screen.findByRole("button", { name: /Tenant Um/ }));

    expect(await screen.findByText("Prompt de 1")).toBeInTheDocument();
    expect(await screen.findByLabelText("Base de Conhecimento")).toBeInTheDocument();
    expect(fetchTenantPromptDetailMock).toHaveBeenCalledWith("1");
    expect(getKnowledgeBaseMock).toHaveBeenCalledWith("1");
  });

  it("switching to a different tenant before the previous context resolves does not show stale data (SC-007)", async () => {
    searchTenantsMock.mockResolvedValue({
      ok: true,
      status: 200,
      tenants: [tenantOne, tenantTwo],
    });

    let resolveFirst!: (value: TenantPromptDetailResult) => void;
    const firstPromise = new Promise<TenantPromptDetailResult>((resolve) => {
      resolveFirst = resolve;
    });
    fetchTenantPromptDetailMock
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ ok: true, status: 200, data: detailFor("2") });

    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText("Buscar tenant"), { target: { value: "Tenant" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    fireEvent.click(await screen.findByRole("button", { name: /Tenant Um/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Tenant Dois/ }));

    expect(await screen.findByText("Prompt de 2")).toBeInTheDocument();

    await act(async () => {
      resolveFirst({ ok: true, status: 200, data: detailFor("1") });
    });

    // The stale response for tenant 1 must not overwrite tenant 2's context.
    expect(screen.getByText("Prompt de 2")).toBeInTheDocument();
    expect(screen.queryByText("Prompt de 1")).not.toBeInTheDocument();
  });
});
