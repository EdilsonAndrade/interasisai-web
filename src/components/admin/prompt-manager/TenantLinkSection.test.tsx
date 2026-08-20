import { fireEvent, render, screen } from "@testing-library/react";
import { TenantLinkSection } from "./TenantLinkSection";
import type { Prompt } from "@/services/promptManager.types";

jest.mock("./MarkdownEditorCustom", () => ({
  MarkdownEditorCustom: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    label?: string;
  }) => (
    <textarea
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const prompts: Prompt[] = [
  {
    id: "op-1",
    titulo: "Operacional Padrão",
    conteudo: "conteúdo",
    is_default: true,
    node_type: "operational",
    guardrail_ids: [],
  },
  {
    id: "inst-1",
    titulo: "Institucional Padrão",
    conteudo: "conteúdo",
    is_default: true,
    node_type: "institutional",
    guardrail_ids: [],
  },
  {
    id: "chit-1",
    titulo: "Chitchat Padrão",
    conteudo: "conteúdo",
    is_default: true,
    node_type: "chitchat",
    guardrail_ids: [],
  },
];

function renderSection(overrides: Partial<React.ComponentProps<typeof TenantLinkSection>> = {}) {
  const onLink = jest.fn().mockResolvedValue(true);
  const onFetchDetail = jest.fn().mockResolvedValue(undefined);
  const onClearDetail = jest.fn();

  render(
    <TenantLinkSection
      prompts={prompts}
      loading={false}
      error={null}
      submitting={false}
      fetchingDetail={false}
      detailError={null}
      tenantNotFound={false}
      tenantDetail={null}
      onLink={onLink}
      onFetchDetail={onFetchDetail}
      onClearDetail={onClearDetail}
      {...overrides}
    />,
  );

  return { onLink, onFetchDetail, onClearDetail };
}

describe("TenantLinkSection — Nó de Destino", () => {
  it("defaults to the Operacional tab and only lists operational prompts", () => {
    renderSection();

    expect(screen.getByRole("button", { name: "Operacional" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("option", { name: "Operacional Padrão (Padrão)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Institucional Padrão/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Chitchat Padrão/ })).not.toBeInTheDocument();
  });

  it("switches the prompt list when a different node tab is selected", () => {
    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "Chitchat" }));

    expect(screen.getByRole("button", { name: "Chitchat" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("option", { name: "Chitchat Padrão (Padrão)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Operacional Padrão/ })).not.toBeInTheDocument();
  });

  it("passes the selected node_type when searching for a tenant", () => {
    const { onFetchDetail } = renderSection();

    fireEvent.click(screen.getByRole("button", { name: "Institucional" }));
    fireEvent.change(screen.getByLabelText("ID do Tenant"), { target: { value: "tenant-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onFetchDetail).toHaveBeenCalledWith("tenant-1", "institutional");
  });

  it("passes the selected node_type when linking a tenant to a prompt", async () => {
    const { onLink } = renderSection();

    fireEvent.change(screen.getByLabelText("ID do Tenant"), { target: { value: "tenant-1" } });
    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "op-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Vincular Tenant" }));

    await screen.findByRole("button", { name: "Vincular Tenant" });
    expect(onLink).toHaveBeenCalledWith(
      { tenant_id: "tenant-1", prompt_id: "op-1" },
      "operational",
    );
  });

  it("refetches the tenant detail for the new node when a tenant is already loaded", () => {
    const tenantDetail = {
      tenant_id: "tenant-1",
      node_type: "operational" as const,
      prompt_id: "op-1",
      is_active: true,
      custom_content_override: null,
      prompt_titulo: "Operacional Padrão",
      prompt_conteudo: "conteúdo",
      is_default_prompt: true,
      guardrails_associados: [],
    };
    const { onFetchDetail } = renderSection({ tenantDetail });

    fireEvent.click(screen.getByRole("button", { name: "Chitchat" }));

    expect(onFetchDetail).toHaveBeenCalledWith("tenant-1", "chitchat");
  });
});
