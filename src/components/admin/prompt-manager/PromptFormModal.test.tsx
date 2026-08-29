import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

// Superset de todos os placeholders obrigatórios dos 3 node_types — usado nos
// testes que focam no comportamento de troca/submit de node_type, não na
// validação de placeholders (coberta em "PromptFormModal — validação de
// placeholders obrigatórios" abaixo).
const ALL_PLACEHOLDERS_CONTENT =
  "{guardrails} {tenant_id} {contexto_formatado} {tabela_calendario_str} {hora_atual_str} {data_hoje_iso} {historico_texto} {pergunta_usuario}";

describe("PromptFormModal — Nó de Destino", () => {
  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Prompt de teste" },
    });
    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), {
      target: { value: ALL_PLACEHOLDERS_CONTENT },
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

  it("updates the placeholder help section when node_type changes (EDI-50)", () => {
    render(
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText("{tenant_id}")).toBeInTheDocument();
    expect(screen.queryByText("{historico_texto}")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nó de Destino"), {
      target: { value: "institutional" },
    });

    expect(screen.getByText("{historico_texto}")).toBeInTheDocument();
    expect(screen.queryByText("{tenant_id}")).not.toBeInTheDocument();
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

describe("PromptFormModal — validação de placeholders obrigatórios (026)", () => {
  const fillFor = (titulo: string, conteudo: string) => {
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: titulo } });
    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), { target: { value: conteudo } });
  };

  it("blocks submit and lists the missing tokens when required placeholders are absent", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PromptFormModal open mode="create" availableGuardrails={[]} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Nó de Destino"), { target: { value: "chitchat" } });
    fillFor("Chitchat de teste", "Converse de forma leve.");
    fireEvent.click(screen.getByRole("button", { name: "Criar Prompt" }));

    const alert = await screen.findByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" });
    expect(within(alert).getByText("{guardrails}")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("'Corrigir' closes the alert and keeps the form (título/conteúdo/tipo) intact", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PromptFormModal open mode="create" availableGuardrails={[]} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Nó de Destino"), { target: { value: "chitchat" } });
    fillFor("Chitchat de teste", "Converse de forma leve.");
    fireEvent.click(screen.getByRole("button", { name: "Criar Prompt" }));
    await screen.findByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" });

    fireEvent.click(screen.getByRole("button", { name: "Corrigir" }));

    expect(screen.queryByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Chitchat de teste");
    expect(screen.getByLabelText("Conteúdo (Markdown)")).toHaveValue("Converse de forma leve.");
    expect(screen.getByLabelText("Nó de Destino")).toHaveValue("chitchat");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("'Salvar mesmo assim' proceeds with the submit using the pending data", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    const onClose = jest.fn();
    render(
      <PromptFormModal open mode="create" availableGuardrails={[]} onClose={onClose} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Nó de Destino"), { target: { value: "chitchat" } });
    fillFor("Chitchat de teste", "Converse de forma leve.");
    fireEvent.click(screen.getByRole("button", { name: "Criar Prompt" }));
    await screen.findByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" });

    fireEvent.click(screen.getByRole("button", { name: "Salvar mesmo assim" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      titulo: "Chitchat de teste",
      conteudo: "Converse de forma leve.",
      node_type: "chitchat",
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

});

describe("PromptFormModal — refresh ao trocar o tipo (US3)", () => {
  it("keeps selected guardrails and the 'Global' badge when the node_type changes", async () => {
    const globalGuardrail: Guardrail = {
      id: "g1",
      titulo: "Guardrail Global",
      conteudo: "conteúdo",
      is_global: true,
    };
    const localGuardrail: Guardrail = {
      id: "g2",
      titulo: "Guardrail Local",
      conteudo: "conteúdo",
      is_global: false,
    };

    render(
      <PromptFormModal
        open
        mode="create"
        availableGuardrails={[globalGuardrail, localGuardrail]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Guardrail Local/ }));
    await waitFor(() => expect(screen.getByRole("checkbox", { name: /Guardrail Local/ })).toBeChecked());

    fireEvent.change(screen.getByLabelText("Nó de Destino"), { target: { value: "institutional" } });

    expect(screen.getByRole("checkbox", { name: /Guardrail Local/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Guardrail Global/ })).not.toBeChecked();
    expect(screen.getByText("Global")).toBeInTheDocument();
  });
});

describe("PromptFormModal — validação de placeholders obrigatórios (026), parte 2", () => {
  const fillFor = (titulo: string, conteudo: string) => {
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: titulo } });
    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), { target: { value: conteudo } });
  };

  it("does not show the alert when the content has every required placeholder", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PromptFormModal open mode="create" availableGuardrails={[]} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Nó de Destino"), { target: { value: "chitchat" } });
    fillFor("Chitchat de teste", "{guardrails}\nConverse de forma leve.");
    fireEvent.click(screen.getByRole("button", { name: "Criar Prompt" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" })).not.toBeInTheDocument();
  });
});
