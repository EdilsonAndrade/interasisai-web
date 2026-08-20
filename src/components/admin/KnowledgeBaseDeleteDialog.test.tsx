import { fireEvent, render, screen } from "@testing-library/react";
import { KnowledgeBaseDeleteDialog } from "./KnowledgeBaseDeleteDialog";

describe("KnowledgeBaseDeleteDialog", () => {
  it("identifies the tenant and requires explicit confirmation", () => {
    const onConfirm = jest.fn();
    render(
      <KnowledgeBaseDeleteDialog
        open
        tenantId="1234"
        isLoading={false}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Excluir base de conhecimento?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tenant: 1234")).toBeInTheDocument();
    expect(screen.getByText("Esta ação não poderá ser desfeita.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancel does not confirm and returns focus via AdminDialog", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(
      <KnowledgeBaseDeleteDialog
        open
        tenantId="1234"
        isLoading={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables both actions while loading", () => {
    render(
      <KnowledgeBaseDeleteDialog
        open
        tenantId="1234"
        isLoading
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluindo" })).toBeDisabled();
  });
});
