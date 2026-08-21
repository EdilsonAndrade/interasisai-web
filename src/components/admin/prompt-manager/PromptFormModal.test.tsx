import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PromptFormModal } from "./PromptFormModal";
import type { Guardrail, Prompt } from "@/services/promptManager.types";

// react-markdown é ESM-only e não é necessário para estes testes (foco no
// seletor de node_type); substitui por um textarea simples equivalente.
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

describe("PromptFormModal — Nó de Destino", () => {
  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Prompt de teste" },
    });
    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), {
      target: { value: "# Conteúdo" },
    });
  };

  const submit = (label: string) => {
    fireEvent.click(screen.getByRole("button", { name: label }));
  };

  it("defaults node_type to operational when creating a prompt", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[]}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText("Nó de Destino")).toHaveValue("operational");

    fillRequiredFields();
    submit("Criar Prompt");

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ node_type: "operational" });
  });

  it("submits node_type: institutional when selected", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[]}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("Nó de Destino"), {
      target: { value: "institutional" },
    });
    submit("Criar Prompt");

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ node_type: "institutional" });
  });

  it("pre-loads node_type when editing an existing prompt", () => {
    const prompt: Prompt = {
      id: "p1",
      titulo: "Chitchat Padrão",
      conteudo: "conteúdo",
      is_default: true,
      node_type: "chitchat",
      guardrail_ids: [],
    };

    render(
      <PromptFormModal
        open
        mode="edit"
        initial={prompt}
        availableGuardrails={[]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Nó de Destino")).toHaveValue("chitchat");
  });
});

describe("PromptFormModal — fechamento com alterações não salvas", () => {
  const pressEscape = () => fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

  it("closes immediately on Escape when the form has no changes", async () => {
    const onClose = jest.fn();
    render(
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[]}
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
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[]}
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

  it("shows the standardized GuardrailScopeBadge next to global guardrails in the selector", () => {
    const globalGuardrail: Guardrail = {
      id: "g1",
      titulo: "Guardrail Global",
      conteudo: "conteúdo",
      is_global: true,
    };

    render(
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[globalGuardrail]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText("Global")).toBeInTheDocument();
  });
});
