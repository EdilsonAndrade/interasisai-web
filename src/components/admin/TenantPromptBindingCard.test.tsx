import { fireEvent, render, screen } from "@testing-library/react";
import { TenantPromptBindingCard } from "./TenantPromptBindingCard";
import type { Prompt } from "@/services/promptManager.types";

const guardrails = [
  { id: "g1", titulo: "Proteção A", conteudo: "...", is_global: true },
  { id: "g2", titulo: "Proteção B", conteudo: "...", is_global: false },
];

const linkedDetail = {
  tenant_id: "tenant-1",
  node_type: "operational" as const,
  prompt_id: "prompt-1",
  is_active: true,
  custom_content_override: null,
  prompt_titulo: "Atendimento Clínica",
  prompt_conteudo: "Conteúdo vigente",
  is_default_prompt: false,
  guardrails_associados: guardrails,
};

const missingDetail = {
  ...linkedDetail,
  prompt_titulo: "Atendimento Padrão",
  prompt_conteudo: "Conteúdo do padrão — não deveria aparecer",
  is_default_prompt: true,
};

const operationalPrompts: Prompt[] = [
  { id: "prompt-2", titulo: "Atendimento Clínica", conteudo: "...", is_default: false, node_type: "operational", guardrail_ids: [] },
];

describe("TenantPromptBindingCard", () => {
  it("shows only the prompt title, without an alert, when linked", () => {
    render(
      <TenantPromptBindingCard
        state="linked"
        detail={linkedDetail}
        error={null}
        linking={false}
        operationalPrompts={operationalPrompts}
        onLinkPrompt={jest.fn()}
      />,
    );

    expect(screen.getByText("Atendimento Clínica")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Proteção A")).toBeInTheDocument();
    expect(screen.getByText("Proteção B")).toBeInTheDocument();
  });

  it("shows the configuration-error alert and never renders the default prompt's content when missing", () => {
    render(
      <TenantPromptBindingCard
        state="missing"
        detail={missingDetail}
        error={null}
        linking={false}
        operationalPrompts={operationalPrompts}
        onLinkPrompt={jest.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/não tem prompt vinculado/i);
    expect(screen.queryByText("Atendimento Padrão")).not.toBeInTheDocument();
    expect(screen.queryByText(/Conteúdo do padrão/)).not.toBeInTheDocument();
  });

  it("keeps guardrails visible even when the binding is missing", () => {
    render(
      <TenantPromptBindingCard
        state="missing"
        detail={missingDetail}
        error={null}
        linking={false}
        operationalPrompts={operationalPrompts}
        onLinkPrompt={jest.fn()}
      />,
    );

    expect(screen.getByText("Proteção A")).toBeInTheDocument();
    expect(screen.getByText("Proteção B")).toBeInTheDocument();
  });

  it("fires the correction without navigating away", async () => {
    const onLinkPrompt = jest.fn().mockResolvedValue(true);
    render(
      <TenantPromptBindingCard
        state="missing"
        detail={missingDetail}
        error={null}
        linking={false}
        operationalPrompts={operationalPrompts}
        onLinkPrompt={onLinkPrompt}
      />,
    );

    fireEvent.change(screen.getByLabelText("Vincular prompt"), {
      target: { value: "prompt-2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Vincular prompt" }));

    expect(onLinkPrompt).toHaveBeenCalledWith("prompt-2");
  });

  it("disables the confirm action until a prompt is chosen", () => {
    render(
      <TenantPromptBindingCard
        state="missing"
        detail={missingDetail}
        error={null}
        linking={false}
        operationalPrompts={operationalPrompts}
        onLinkPrompt={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Vincular prompt" })).toBeDisabled();
  });
});
