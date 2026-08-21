import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { PromptList } from "./PromptList";
import type { Guardrail, Prompt } from "@/services/promptManager.types";

const promptA: Prompt = {
  id: "p1",
  titulo: "Agendamento Padrão",
  conteudo: "conteúdo A",
  is_default: true,
  node_type: "operational",
  guardrail_ids: [],
};

const promptB: Prompt = {
  id: "p2",
  titulo: "Assistente Comercial",
  conteudo: "conteúdo B",
  is_default: false,
  node_type: "institutional",
  guardrail_ids: [],
};

describe("PromptList", () => {
  it("renders the list of prompts", () => {
    render(
      <PromptList
        prompts={[promptA, promptB]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    expect(screen.getByText("Agendamento Padrão")).toBeInTheDocument();
    expect(screen.getByText("Assistente Comercial")).toBeInTheDocument();
  });

  it("opens the confirmation dialog via the discreet DeleteAction and only deletes after confirming", async () => {
    const onDelete = jest.fn().mockResolvedValue(true);
    render(
      <PromptList
        prompts={[promptA]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onNew={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir Agendamento Padrão" }));
    expect(onDelete).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog", { name: "Excluir prompt?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("p1"));
  });

  it("cancelling the confirmation dialog does not delete", () => {
    const onDelete = jest.fn();
    render(
      <PromptList
        prompts={[promptA]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onNew={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir Agendamento Padrão" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Excluir prompt?" })).not.toBeInTheDocument();
  });

  it("filters the list by title as the user types, case/accent-insensitively", () => {
    render(
      <PromptList
        prompts={[promptA, promptB]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Buscar prompt por título"), {
      target: { value: "agendamento" },
    });

    expect(screen.getByText("Agendamento Padrão")).toBeInTheDocument();
    expect(screen.queryByText("Assistente Comercial")).not.toBeInTheDocument();
  });

  it("shows a distinct message when the search has no matches, and clearing it restores the full list", () => {
    render(
      <PromptList
        prompts={[promptA, promptB]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    const search = screen.getByLabelText("Buscar prompt por título");
    fireEvent.change(search, { target: { value: "não existe" } });

    expect(
      screen.getByText((content) => content.startsWith("Nenhum prompt encontrado")),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nenhum prompt cadastrado.")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });

    expect(screen.getByText("Agendamento Padrão")).toBeInTheDocument();
    expect(screen.getByText("Assistente Comercial")).toBeInTheDocument();
  });

  it("distinguishes same-titled prompts on different nodes via the existing node badge alone", () => {
    const institutionalTwin: Prompt = { ...promptA, id: "p3", node_type: "institutional" };
    render(
      <PromptList
        prompts={[promptA, institutionalTwin]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    const titles = screen.getAllByText("Agendamento Padrão");
    expect(titles).toHaveLength(2);
    expect(screen.getByText("Operacional")).toBeInTheDocument();
    expect(screen.getByText("Institucional")).toBeInTheDocument();
    // Different nodes already disambiguate — no id tie-breaker needed.
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });

  it("adds an id tie-breaker when title AND node_type both collide", () => {
    const sameNodeTwin: Prompt = { ...promptA, id: "p3abcdef" };
    render(
      <PromptList
        prompts={[promptA, sameNodeTwin]}
        availableGuardrails={[]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    expect(screen.getByText(`#${promptA.id.slice(-6)}`)).toBeInTheDocument();
    expect(screen.getByText(`#${sameNodeTwin.id.slice(-6)}`)).toBeInTheDocument();
  });

  it("shows the standardized GuardrailScopeBadge for global guardrail chips", () => {
    const globalGuardrail: Guardrail = {
      id: "g1",
      titulo: "Guardrail Global",
      conteudo: "conteúdo",
      is_global: true,
    };
    const promptWithGuardrail: Prompt = { ...promptA, guardrails: [globalGuardrail] };

    render(
      <PromptList
        prompts={[promptWithGuardrail]}
        availableGuardrails={[globalGuardrail]}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onNew={jest.fn()}
      />,
    );

    expect(screen.getByText("Global")).toBeInTheDocument();
  });
});
