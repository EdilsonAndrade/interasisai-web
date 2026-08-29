import { fireEvent, render, screen } from "@testing-library/react";
import { PromptSelectField } from "./PromptSelectField";
import type { Prompt } from "@/services/promptManager.types";

// react-markdown é ESM-only e não é necessário para estes testes; substitui
// por um textarea simples equivalente (mesmo padrão de PromptFormModal.test.tsx).
jest.mock("@/components/admin/prompt-manager/MarkdownEditorCustom", () => ({
  MarkdownEditorCustom: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    label?: string;
  }) => (
    <textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

const prompts: Prompt[] = [
  {
    id: "p-default",
    titulo: "Atendimento Padrão",
    conteudo: "Você é um assistente.\n\n{guardrails}",
    is_default: true,
    node_type: "operational",
    guardrail_ids: [],
  },
  {
    id: "p-clinica",
    titulo: "Atendimento Clínica",
    conteudo: "Você atende uma clínica.\n\n{guardrails}",
    is_default: false,
    node_type: "operational",
    guardrail_ids: ["g1"],
  },
];

describe("PromptSelectField", () => {
  it("starts with no option selected, labeling the platform default without selecting it", () => {
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId=""
        newPromptDraft={null}
        onSelectExisting={jest.fn()}
        onNewPromptDraftChange={jest.fn()}
      />,
    );

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-checked", "false");
    }
    expect(screen.getByText("Padrão")).toBeInTheDocument();
  });

  it("calls onSelectExisting when an existing prompt is chosen", () => {
    const onSelectExisting = jest.fn();
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId=""
        newPromptDraft={null}
        onSelectExisting={onSelectExisting}
        onNewPromptDraftChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /Atendimento Clínica/i }));
    expect(onSelectExisting).toHaveBeenCalledWith("p-clinica");
  });

  it("reflects the currently selected prompt", () => {
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId="p-clinica"
        newPromptDraft={null}
        onSelectExisting={jest.fn()}
        onNewPromptDraftChange={jest.fn()}
      />,
    );

    expect(screen.getByRole("radio", { name: /Atendimento Clínica/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("switches to the 'a partir de modelo' mode and copies the template content verbatim", () => {
    const onNewPromptDraftChange = jest.fn();
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId=""
        newPromptDraft={null}
        onSelectExisting={jest.fn()}
        onNewPromptDraftChange={onNewPromptDraftChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
    fireEvent.change(screen.getByLabelText("Modelo de prompt"), {
      target: { value: "p-clinica" },
    });

    expect(screen.getByDisplayValue("Atendimento Clínica")).toBeInTheDocument();
    expect(onNewPromptDraftChange).toHaveBeenLastCalledWith({
      titulo: "Atendimento Clínica",
      conteudo: "Você atende uma clínica.\n\n{guardrails}",
      is_default: false,
      node_type: "operational",
      guardrail_ids: ["g1"],
    });
  });

  it("warns, without blocking, listing every missing required placeholder for the copied content", () => {
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId=""
        newPromptDraft={null}
        onSelectExisting={jest.fn()}
        onNewPromptDraftChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
    fireEvent.change(screen.getByLabelText("Modelo de prompt"), {
      target: { value: "p-clinica" },
    });

    // Template content only has {guardrails} — the other 5 required operational
    // placeholders are missing, so the (non-blocking) warning already shows.
    expect(screen.getByRole("alert")).toHaveTextContent("{tenant_id}");
    expect(screen.getByRole("alert")).toHaveTextContent("{contexto_formatado}");

    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), {
      target: { value: "Você atende uma clínica, sem nenhum marcador." },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("{guardrails}");
    expect(screen.getByRole("alert")).toHaveTextContent(/deixarão de funcionar/i);
  });

  it("shows no warning once every required operational placeholder is present", () => {
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId=""
        newPromptDraft={null}
        onSelectExisting={jest.fn()}
        onNewPromptDraftChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
    fireEvent.change(screen.getByLabelText("Modelo de prompt"), {
      target: { value: "p-clinica" },
    });
    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), {
      target: {
        value:
          "{guardrails} {tenant_id} {contexto_formatado} {tabela_calendario_str} {hora_atual_str} {data_hoje_iso}",
      },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("cancels the new-prompt flow and clears the draft", () => {
    const onNewPromptDraftChange = jest.fn();
    render(
      <PromptSelectField
        prompts={prompts}
        selectedPromptId=""
        newPromptDraft={null}
        onSelectExisting={jest.fn()}
        onNewPromptDraftChange={onNewPromptDraftChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
    fireEvent.click(screen.getByRole("button", { name: /Cancelar criação de novo prompt/i }));

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(onNewPromptDraftChange).toHaveBeenCalledWith(null);
  });
});
