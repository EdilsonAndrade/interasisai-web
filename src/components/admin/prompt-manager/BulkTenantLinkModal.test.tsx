import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { searchTenants } from "@/services/pythonBackend";
import { fetchPromptTenants, linkTenantsBulk } from "@/services/promptManager";
import { BulkTenantLinkModal } from "./BulkTenantLinkModal";
import type { Prompt } from "@/services/promptManager.types";

jest.mock("@/services/pythonBackend", () => ({
  searchTenants: jest.fn(),
}));

jest.mock("@/services/promptManager", () => ({
  fetchPromptTenants: jest.fn(),
  linkTenantsBulk: jest.fn(),
}));

const searchMock = jest.mocked(searchTenants);
const fetchPromptTenantsMock = jest.mocked(fetchPromptTenants);
const linkBulkMock = jest.mocked(linkTenantsBulk);

const prompt: Prompt = {
  id: "prompt-1",
  titulo: "Atendimento Clínica",
  conteudo: "...",
  is_default: false,
  node_type: "operational",
  guardrail_ids: [],
};

const tenantAcme = {
  id: "acme",
  name: "Acme Ltda",
  google_calendar_id: "x@g.com",
  created_at: "2026-01-01",
  updated_at: null,
  deleted_at: null,
  allowed_domains: [],
};

const tenantBeta = { ...tenantAcme, id: "beta", name: "Beta S.A." };

describe("BulkTenantLinkModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchPromptTenantsMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { prompt_id: "prompt-1", node_type: "operational", tenants: [] },
    });
  });

  const selectTenant = async (tenant: typeof tenantAcme) => {
    searchMock.mockResolvedValue({ ok: true, status: 200, tenants: [tenant] });
    fireEvent.change(screen.getByLabelText("Buscar tenants"), { target: { value: tenant.name } });
    fireEvent.keyDown(screen.getByLabelText("Buscar tenants"), { key: "Enter" });
    await waitFor(() => screen.getByText(tenant.name));
    fireEvent.click(screen.getByText(tenant.name));
  };

  it("shows the substitution / all-or-nothing / other-nodes-unaffected warning", async () => {
    render(<BulkTenantLinkModal open prompt={prompt} onClose={jest.fn()} />);

    expect(screen.getByText(/substitui/i)).toBeInTheDocument();
    expect(screen.getByText(/tudo-ou-nada/i)).toBeInTheDocument();
    expect(screen.getByText(/outros nós não são afetados/i)).toBeInTheDocument();
  });

  it("blocks confirmation when no tenant is selected", async () => {
    render(<BulkTenantLinkModal open prompt={prompt} onClose={jest.fn()} />);

    expect(screen.getByRole("button", { name: /Aplicar/ })).toBeDisabled();
    expect(linkBulkMock).not.toHaveBeenCalled();
  });

  it("adds a searched tenant as a removable chip", async () => {
    render(<BulkTenantLinkModal open prompt={prompt} onClose={jest.fn()} />);

    await selectTenant(tenantAcme);

    expect(screen.getByLabelText("Tenants selecionados")).toHaveTextContent("Acme Ltda");
    fireEvent.click(screen.getByLabelText("Remover Acme Ltda"));
    expect(screen.queryByLabelText("Tenants selecionados")).not.toBeInTheDocument();
  });

  it("separates already-linked tenants from ones that will change", async () => {
    fetchPromptTenantsMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        prompt_id: "prompt-1",
        node_type: "operational",
        tenants: [{ id: "acme", name: "Acme Ltda" }],
      },
    });
    render(<BulkTenantLinkModal open prompt={prompt} onClose={jest.fn()} />);

    await waitFor(() => expect(fetchPromptTenantsMock).toHaveBeenCalledWith("prompt-1"));
    await selectTenant(tenantAcme);
    await selectTenant(tenantBeta);

    expect(screen.getByText("Já usam este prompt (1)")).toBeInTheDocument();
    expect(screen.getByText("Serão alterados (1)")).toBeInTheDocument();
  });

  it("shows the linked count on success", async () => {
    linkBulkMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { prompt_id: "prompt-1", node_type: "operational", linked_count: 1, tenant_ids: ["acme"] },
    });
    render(<BulkTenantLinkModal open prompt={prompt} onClose={jest.fn()} />);

    await selectTenant(tenantAcme);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Aplicar/ }));
    });

    expect(await screen.findByText(/1 tenant vinculado/)).toBeInTheDocument();
  });

  it("lists blockers and states nothing was applied on TENANT_NOT_FOUND", async () => {
    linkBulkMock.mockResolvedValue({
      ok: false,
      status: 404,
      code: "TENANT_NOT_FOUND",
      message: "1 tenant informado não existe. Nenhum vínculo foi aplicado.",
      blockers: [{ type: "tenant", id: "inexistente-1" }],
      retryable: false,
    });
    render(<BulkTenantLinkModal open prompt={prompt} onClose={jest.fn()} />);

    await selectTenant({ ...tenantAcme, id: "inexistente-1", name: "inexistente-1" });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Aplicar/ }));
    });

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText("1 tenant informado não existe. Nenhum vínculo foi aplicado."),
    ).toBeInTheDocument();
    expect(within(alert).getByText("inexistente-1")).toBeInTheDocument();
  });
});
