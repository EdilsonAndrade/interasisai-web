import { fireEvent, render, screen } from "@testing-library/react";
import { AdminDialog } from "./AdminDialog";

describe("AdminDialog", () => {
  it("exposes modal semantics and closes with Escape", () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Novo tenant" onClose={onClose}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Novo tenant" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});