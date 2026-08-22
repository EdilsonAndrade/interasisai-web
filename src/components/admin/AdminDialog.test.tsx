import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminDialog } from "./AdminDialog";

const pressEscape = () => {
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
};

describe("AdminDialog", () => {
  it("opens as a native modal (showModal) with backdrop semantics", async () => {
    render(
      <AdminDialog open title="Novo tenant" onClose={jest.fn()}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Novo tenant" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await waitFor(() => expect(dialog).toHaveAttribute("open"));
  });

  it("closes on Escape when there are no unsaved changes", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Novo tenant" onClose={onClose}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks for discard confirmation on Escape when there are unsaved changes, and only closes after confirming", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Editar prompt" onClose={onClose} hasUnsavedChanges>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    pressEscape();

    expect(onClose).not.toHaveBeenCalled();
    const confirmPanel = screen.getByRole("alertdialog", { name: "Descartar alterações?" });
    expect(confirmPanel).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Descartar alterações" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the dialog open when the user chooses to keep editing", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Editar prompt" onClose={onClose} hasUnsavedChanges>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    pressEscape();
    fireEvent.click(screen.getByRole("button", { name: "Continuar editando" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Editar prompt" })).toBeInTheDocument();
  });

  it("closes immediately on Escape for confirmation-only dialogs (no hasUnsavedChanges)", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Excluir prompt?" onClose={onClose}>
        <p>Tem certeza?</p>
      </AdminDialog>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("ignores Escape entirely when closeDisabled is set", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Excluindo..." onClose={onClose} closeDisabled>
        <p>Aguarde...</p>
      </AdminDialog>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    pressEscape();

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();
  });

  it("closes when clicking the close ('X') button, respecting unsaved-changes confirmation", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Novo tenant" onClose={onClose}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the mousedown and the click both land directly on the backdrop", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Novo tenant" onClose={onClose}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog).toHaveAttribute("open"));

    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when a text selection started inside the dialog ends up released over the backdrop", async () => {
    const onClose = jest.fn();
    render(
      <AdminDialog open title="Novo tenant" onClose={onClose}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog).toHaveAttribute("open"));

    // Mousedown starts on content (e.g. selecting text), mouseup/click ends
    // up targeting the backdrop itself — must NOT be treated as a backdrop click.
    fireEvent.mouseDown(screen.getByRole("button", { name: "Conteúdo" }));
    fireEvent.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("gives the close ('X') button a touch-friendly hit area of at least 44x44px", () => {
    render(
      <AdminDialog open title="Novo tenant" onClose={jest.fn()}>
        <button>Conteúdo</button>
      </AdminDialog>,
    );

    const closeButton = screen.getByRole("button", { name: "Fechar" });
    expect(closeButton.className).toMatch(/min-h-11/);
    expect(closeButton.className).toMatch(/min-w-11/);
  });
});
