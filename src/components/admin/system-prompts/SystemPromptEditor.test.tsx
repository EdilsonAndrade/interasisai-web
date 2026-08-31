import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { SystemPrompt } from "@/services/systemPrompts.types";
import { SystemPromptEditor } from "./SystemPromptEditor";

const prompt: SystemPrompt = {
  id: "1",
  prompt_key: "routing_agent",
  titulo: "routing_agent",
  current_version: "conteúdo atual",
  last_version: "conteúdo anterior",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("SystemPromptEditor — save (US2)", () => {
  it("shows the current_version content in the textarea", () => {
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={jest.fn().mockResolvedValue(true)}
      />,
    );

    expect(screen.getByLabelText("Conteúdo vigente")).toHaveValue("conteúdo atual");
  });

  it("blocks saving empty content without calling onSave", () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={onSave}
        onRollback={jest.fn().mockResolvedValue(true)}
      />,
    );

    fireEvent.change(screen.getByLabelText("Conteúdo vigente"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByRole("alert")).toHaveTextContent("O conteúdo é obrigatório.");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onSave with the edited content", async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={onSave}
        onRollback={jest.fn().mockResolvedValue(true)}
      />,
    );

    fireEvent.change(screen.getByLabelText("Conteúdo vigente"), {
      target: { value: "novo texto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("novo texto"));
  });

  it("disables save/rollback buttons and the textarea while saving is in progress", () => {
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={jest.fn().mockResolvedValue(true)}
      />,
    );

    expect(screen.getByRole("button", { name: /Salvar/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Reverter para versão anterior/ })).toBeDisabled();
    expect(screen.getByLabelText("Conteúdo vigente")).toBeDisabled();
  });

  it("resets the draft when a different prompt is selected", () => {
    const { rerender } = render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={jest.fn().mockResolvedValue(true)}
      />,
    );

    fireEvent.change(screen.getByLabelText("Conteúdo vigente"), { target: { value: "rascunho" } });

    const otherPrompt: SystemPrompt = {
      ...prompt,
      prompt_key: "groundedness_rule",
      titulo: "GROUNDEDNESS_RULE",
      current_version: "outro conteúdo",
    };
    rerender(
      <SystemPromptEditor
        prompt={otherPrompt}
        saving={false}
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={jest.fn().mockResolvedValue(true)}
      />,
    );

    expect(screen.getByLabelText("Conteúdo vigente")).toHaveValue("outro conteúdo");
  });
});

describe("SystemPromptEditor — rollback (US3)", () => {
  it("asks for confirmation before rolling back", () => {
    const onRollback = jest.fn().mockResolvedValue(true);
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={onRollback}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Reverter para versão anterior/ }));

    expect(screen.getByRole("heading", { name: "Reverter para versão anterior?" })).toBeInTheDocument();
    expect(onRollback).not.toHaveBeenCalled();
  });

  it("calls onRollback only after the confirmation is accepted", async () => {
    const onRollback = jest.fn().mockResolvedValue(true);
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={onRollback}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Reverter para versão anterior/ }));
    fireEvent.click(screen.getByRole("button", { name: "Reverter" }));

    await waitFor(() => expect(onRollback).toHaveBeenCalledTimes(1));
  });

  it("does not call onRollback when the confirmation is cancelled", () => {
    const onRollback = jest.fn().mockResolvedValue(true);
    render(
      <SystemPromptEditor
        prompt={prompt}
        saving={false}
        rollingBack={false}
        onSave={jest.fn().mockResolvedValue(true)}
        onRollback={onRollback}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Reverter para versão anterior/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onRollback).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Reverter para versão anterior?" }),
    ).not.toBeInTheDocument();
  });
});
