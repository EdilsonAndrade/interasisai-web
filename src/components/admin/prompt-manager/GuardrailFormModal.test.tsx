import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GuardrailFormModal } from "./GuardrailFormModal";

// react-markdown é ESM-only e não é necessário para estes testes (foco no
// fechamento do modal); substitui por um textarea simples equivalente.
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

describe("GuardrailFormModal — fechamento com alterações não salvas", () => {
  const pressEscape = () => fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

  it("closes immediately on Escape when the form has no changes", async () => {
    const onClose = jest.fn();
    render(
      <GuardrailFormModal
        open
        mode="create"
        onClose={onClose}
        onSubmit={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks for discard confirmation on Escape once a field has been edited", async () => {
    const onClose = jest.fn();
    render(
      <GuardrailFormModal
        open
        mode="create"
        onClose={onClose}
        onSubmit={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("open"));
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Rascunho não salvo" },
    });
    pressEscape();

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog", { name: "Descartar alterações?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Descartar alterações" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
