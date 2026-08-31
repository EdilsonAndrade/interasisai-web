import { fireEvent, render, screen } from "@testing-library/react";
import type { SystemPrompt } from "@/services/systemPrompts.types";
import { SystemPromptList } from "./SystemPromptList";

const prompts: SystemPrompt[] = [
  {
    id: "1",
    prompt_key: "routing_agent",
    titulo: "routing_agent",
    current_version: "a",
    last_version: "a",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    prompt_key: "groundedness_rule",
    titulo: "GROUNDEDNESS_RULE",
    current_version: "b",
    last_version: "b",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "3",
    prompt_key: "chitchat_no_knowledge_rule",
    titulo: "CHITCHAT_NO_KNOWLEDGE_RULE",
    current_version: "c",
    last_version: "c",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "4",
    prompt_key: "booking_integrity_rule",
    titulo: "BOOKING_INTEGRITY_RULE",
    current_version: "d",
    last_version: "d",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("SystemPromptList", () => {
  it("shows a loading indicator while fetching", () => {
    render(
      <SystemPromptList
        prompts={[]}
        selectedPromptKey={null}
        loading
        error={null}
        onRefresh={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText("Carregando prompts...")).toBeInTheDocument();
  });

  it("shows an error message with a retry action on failure", () => {
    const onRefresh = jest.fn();
    render(
      <SystemPromptList
        prompts={[]}
        selectedPromptKey={null}
        loading={false}
        error="Erro interno do servidor. Tente novamente."
        onRefresh={onRefresh}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText("Erro interno do servidor. Tente novamente.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("lists all 4 system prompts with their origin titles", () => {
    render(
      <SystemPromptList
        prompts={prompts}
        selectedPromptKey="routing_agent"
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "routing_agent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GROUNDEDNESS_RULE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CHITCHAT_NO_KNOWLEDGE_RULE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BOOKING_INTEGRITY_RULE" })).toBeInTheDocument();
  });

  it("calls onSelect with the prompt_key when a prompt is clicked", () => {
    const onSelect = jest.fn();
    render(
      <SystemPromptList
        prompts={prompts}
        selectedPromptKey={null}
        loading={false}
        error={null}
        onRefresh={jest.fn()}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "GROUNDEDNESS_RULE" }));
    expect(onSelect).toHaveBeenCalledWith("groundedness_rule");
  });
});
