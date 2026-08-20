import { render, screen } from "@testing-library/react";
import { TenantContextCard } from "./TenantContextCard";

const baseDetail = {
  tenant_id: "tenant-1",
  node_type: "operational" as const,
  prompt_id: "prompt-1",
  is_active: true,
  custom_content_override: null,
  prompt_titulo: "Atendimento Barbearia",
  prompt_conteudo: "conteúdo",
  is_default_prompt: false,
  guardrails_associados: [
    { id: "g1", titulo: "Confirmação de agenda", conteudo: "...", is_global: false },
    { id: "g2", titulo: "Guardrail Global", conteudo: "...", is_global: true },
  ],
};

describe("TenantContextCard", () => {
  it("shows a loading state", () => {
    render(<TenantContextCard detail={null} loading error={null} />);
    expect(screen.getByText("Carregando contexto do tenant...")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    render(<TenantContextCard detail={null} loading={false} error="Tenant não encontrado" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Tenant não encontrado");
  });

  it("renders nothing when there is no detail and no error/loading", () => {
    const { container } = render(<TenantContextCard detail={null} loading={false} error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the linked prompt and its guardrails, without a default badge", () => {
    render(<TenantContextCard detail={baseDetail} loading={false} error={null} />);

    expect(screen.getByText("Atendimento Barbearia")).toBeInTheDocument();
    expect(screen.queryByText("Padrão do Sistema")).not.toBeInTheDocument();
    expect(screen.getByText("Confirmação de agenda")).toBeInTheDocument();
    expect(screen.getByText("Guardrail Global")).toBeInTheDocument();
    expect(screen.getByText("Global")).toBeInTheDocument();
  });

  it("shows the default-prompt badge when is_default_prompt is true", () => {
    render(
      <TenantContextCard
        detail={{ ...baseDetail, is_default_prompt: true }}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("Padrão do Sistema")).toBeInTheDocument();
  });
});
