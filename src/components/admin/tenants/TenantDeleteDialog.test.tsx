import { fireEvent, render, screen } from "@testing-library/react";
import { TenantDeleteDialog } from "./TenantDeleteDialog";

const impact = {
  tenant_id: "tenant-1",
  prompts_to_delete: [{ id: "p1", titulo: "Prompt Exclusivo", node_type: "operational" as const }],
  prompts_to_unlink_only: [{ id: "p2", titulo: "Prompt Compartilhado" }],
  guardrails_to_delete: [{ id: "g1", titulo: "Guardrail Exclusivo" }],
  guardrails_to_unlink_only: [{ id: "g2", titulo: "Guardrail Global", is_global: true }],
};

function renderDialog(overrides: Partial<React.ComponentProps<typeof TenantDeleteDialog>> = {}) {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const onConfirmTextChange = jest.fn();
  const onRetryImpact = jest.fn();

  const props: React.ComponentProps<typeof TenantDeleteDialog> = {
    open: true,
    tenantName: "Tenant One",
    isLoading: false,
    impactState: "loaded",
    impact,
    impactError: null,
    deleteError: null,
    confirmText: "",
    onConfirmTextChange,
    onRetryImpact,
    onCancel,
    onConfirm,
    ...overrides,
  };

  render(<TenantDeleteDialog {...props} />);
  return { onCancel, onConfirm, onConfirmTextChange, onRetryImpact };
}

describe("TenantDeleteDialog", () => {
  it("shows the four impact groups separately, with the global badge only on the global guardrail", () => {
    renderDialog();

    expect(screen.getByText("Prompt Exclusivo")).toBeInTheDocument();
    expect(screen.getByText("Prompt Compartilhado")).toBeInTheDocument();
    expect(screen.getByText("Guardrail Exclusivo")).toBeInTheDocument();
    expect(screen.getByText("Guardrail Global")).toBeInTheDocument();
    expect(screen.getByText("Global")).toBeInTheDocument();
    expect(screen.getByText(/1 prompt\(s\) serão deletados/)).toBeInTheDocument();
    expect(screen.getByText(/1 prompt\(s\) serão apenas desvinculados/)).toBeInTheDocument();
    expect(screen.getByText(/1 guardrail\(s\) serão deletados/)).toBeInTheDocument();
    expect(screen.getByText(/1 guardrail\(s\) serão apenas desvinculados/)).toBeInTheDocument();
    expect(screen.getByText("Operacional")).toBeInTheDocument();
  });

  it("distinguishes prompts with the identical title via the node_type tag", () => {
    renderDialog({
      impact: {
        ...impact,
        prompts_to_delete: [
          { id: "p1", titulo: "Agendamento Padrão e Assistente Comercial", node_type: "operational" },
          { id: "p2", titulo: "Agendamento Padrão e Assistente Comercial", node_type: "institutional" },
        ],
      },
    });

    expect(screen.getAllByText("Agendamento Padrão e Assistente Comercial")).toHaveLength(2);
    expect(screen.getByText("Operacional")).toBeInTheDocument();
    expect(screen.getByText("Institucional")).toBeInTheDocument();
  });

  it("keeps Confirmar disabled when nothing was typed", () => {
    renderDialog({ confirmText: "" });
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  });

  it("keeps Confirmar disabled when the typed name does not match", () => {
    renderDialog({ confirmText: "Tenant Two" });
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  });

  it("enables Confirmar once the exact name is typed (trimming surrounding whitespace)", () => {
    renderDialog({ confirmText: "  Tenant One  " });
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeEnabled();
  });

  it("calls onConfirm only when Confirmar is enabled and clicked", () => {
    const { onConfirm } = renderDialog({ confirmText: "Tenant One" });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel without touching confirmation state when Cancelar is clicked", () => {
    const { onCancel, onConfirm } = renderDialog({ confirmText: "Tenant One" });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows a loading indicator instead of the summary while the impact is being fetched, with Confirmar still disabled", () => {
    renderDialog({ impactState: "loading", impact: null, confirmText: "Tenant One" });
    expect(screen.getByText("Carregando resumo de impacto...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  });

  it("blocks the name-confirmation field when the impact fetch fails, and offers a retry", () => {
    const { onRetryImpact } = renderDialog({
      impactState: "error",
      impact: null,
      impactError: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      confirmText: "Tenant One",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível conectar ao servidor. Verifique sua conexão.",
    );
    expect(screen.queryByLabelText("Digite o nome do tenant para confirmar")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetryImpact).toHaveBeenCalledTimes(1);
  });

  it("surfaces the deletion failure itself, after a valid impact and confirmation attempt", () => {
    renderDialog({
      confirmText: "Tenant One",
      deleteError: "Não foi possível concluir a operação. Tente novamente.",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a operação. Tente novamente.",
    );
  });
});
