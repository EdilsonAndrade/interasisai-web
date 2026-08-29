import { render, screen } from "@testing-library/react";
import { PromptPlaceholderHelp } from "./PromptPlaceholderHelp";

describe("PromptPlaceholderHelp", () => {
  it("lists all required placeholders and the example for node_type=operational", () => {
    render(<PromptPlaceholderHelp nodeType="operational" />);

    expect(screen.getByText("{guardrails}")).toBeInTheDocument();
    expect(screen.getByText("{tenant_id}")).toBeInTheDocument();
    expect(screen.getByText("{contexto_formatado}")).toBeInTheDocument();
    expect(screen.getByText("{tabela_calendario_str}")).toBeInTheDocument();
    expect(screen.getByText("{hora_atual_str}")).toBeInTheDocument();
    expect(screen.getByText("{data_hoje_iso}")).toBeInTheDocument();
    expect(screen.getAllByText("Obrigatório")).toHaveLength(6);
    expect(screen.queryByText("{pergunta_usuario}")).not.toBeInTheDocument();
    expect(screen.queryByText("{historico_texto}")).not.toBeInTheDocument();

    const example = screen.getByText((_, element) => element?.tagName === "CODE" && element.closest("pre") !== null);
    expect(example.textContent).toContain("{tenant_id}");
  });

  it("lists all required placeholders and the example for node_type=institutional", () => {
    render(<PromptPlaceholderHelp nodeType="institutional" />);

    expect(screen.getByText("{guardrails}")).toBeInTheDocument();
    expect(screen.getByText("{historico_texto}")).toBeInTheDocument();
    expect(screen.getByText("{contexto_formatado}")).toBeInTheDocument();
    expect(screen.getByText("{pergunta_usuario}")).toBeInTheDocument();
    expect(screen.getAllByText("Obrigatório")).toHaveLength(4);

    const example = screen.getByText((_, element) => element?.tagName === "CODE" && element.closest("pre") !== null);
    expect(example.textContent).toContain("CONVERSATION HISTORY");
    expect(example.textContent).toContain("CONTEXT FROM KNOWLEDGE BASE");
  });

  it("lists only {guardrails} for node_type=chitchat and never mentions RAG/history placeholders", () => {
    render(<PromptPlaceholderHelp nodeType="chitchat" />);

    expect(screen.getByText("{guardrails}")).toBeInTheDocument();
    expect(screen.getAllByText("Obrigatório")).toHaveLength(1);
    expect(screen.queryByText("{contexto_formatado}")).not.toBeInTheDocument();
    expect(screen.queryByText("{historico_texto}")).not.toBeInTheDocument();
    expect(screen.queryByText("{pergunta_usuario}")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Placeholders aceitos para este tipo de prompt" }).textContent).not.toContain(
      "contexto_formatado",
    );
  });
});
