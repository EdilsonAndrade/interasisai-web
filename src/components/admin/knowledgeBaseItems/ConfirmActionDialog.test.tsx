import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmActionDialog } from "./ConfirmActionDialog";

describe("ConfirmActionDialog", () => {
  it("renders title and message when open", () => {
    render(
      <ConfirmActionDialog
        open
        title="Substituir todos os dados?"
        message="Esta ação apaga todos os itens existentes."
        confirmLabel="Substituir"
        confirmingLabel="Substituindo..."
        isLoading={false}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Substituir todos os dados?" })).toBeInTheDocument();
    expect(screen.getByText("Esta ação apaga todos os itens existentes.")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ConfirmActionDialog
        open={false}
        title="Excluir item?"
        message="Isso não pode ser desfeito."
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isLoading={false}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmActionDialog
        open
        title="Excluir item?"
        message="Isso não pode ser desfeito."
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isLoading={false}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <ConfirmActionDialog
        open
        title="Excluir item?"
        message="Isso não pode ser desfeito."
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isLoading={false}
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons and shows the confirming label while loading", () => {
    render(
      <ConfirmActionDialog
        open
        title="Excluir item?"
        message="Isso não pode ser desfeito."
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isLoading
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
