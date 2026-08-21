import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { GuardrailList } from "./GuardrailList";
import type { Guardrail } from "@/services/promptManager.types";

const guardrailA: Guardrail = {
  id: "g1",
  titulo: "Proibido falar sobre política",
  conteudo: "conteúdo A",
  is_global: false,
};

describe("GuardrailList", () => {
  it("renders the list of guardrails", () => {
    render(
      <GuardrailList
        guardrails={[guardrailA]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    expect(screen.getByText("Proibido falar sobre política")).toBeInTheDocument();
  });

  it("opens the confirmation dialog via the discreet DeleteAction and only deletes after confirming", async () => {
    const onDelete = jest.fn().mockResolvedValue(true);
    render(
      <GuardrailList
        guardrails={[guardrailA]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onNew={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir Proibido falar sobre política" }));
    expect(onDelete).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog", { name: "Excluir guardrail?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("g1"));
  });

  it("cancelling the confirmation dialog does not delete", () => {
    const onDelete = jest.fn();
    render(
      <GuardrailList
        guardrails={[guardrailA]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onNew={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir Proibido falar sobre política" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Excluir guardrail?" })).not.toBeInTheDocument();
  });

  it("shows the standardized GuardrailScopeBadge only for global guardrails", () => {
    const globalGuardrail: Guardrail = { ...guardrailA, id: "g2", is_global: true };

    render(
      <GuardrailList
        guardrails={[guardrailA, globalGuardrail]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    expect(screen.getAllByText("Global")).toHaveLength(1);
  });
});
