import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TenantForm } from "./TenantForm";
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
    guardrail_ids: [],
  },
];

function fillBaseFields() {
  fireEvent.change(screen.getByLabelText("ID do tenant"), { target: { value: "tenant-1" } });
  fireEvent.change(screen.getByLabelText("Nome do tenant"), { target: { value: "Tenant One" } });
  fireEvent.change(screen.getByLabelText("ID do Google Calendar"), { target: { value: "calendar" } });
  fireEvent.change(screen.getByLabelText("Domínios permitidos"), { target: { value: "example.com" } });
  fireEvent.keyDown(screen.getByLabelText("Domínios permitidos"), { key: "Enter" });
}

describe("TenantForm", () => {
  it("blocks submission without a chosen prompt, with an explanatory message", async () => {
    const onCreate = jest.fn().mockResolvedValue(true);
    render(
      <TenantForm
        mode="create"
        operationalPrompts={prompts}
        isLoading={false}
        onCancel={jest.fn()}
        onCreate={onCreate}
      />,
    );

    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() =>
      expect(screen.getByText(/Selecione o prompt/i)).toBeInTheDocument(),
    );
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("never pre-selects a prompt, and labels the platform default without selecting it", () => {
    render(
      <TenantForm
        mode="create"
        operationalPrompts={prompts}
        isLoading={false}
        onCancel={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    const defaultOption = screen.getByRole("radio", { name: /Atendimento Padrão/i });
    expect(defaultOption).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Padrão")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Atendimento Clínica/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("submits the create intent for an existing prompt once selected", async () => {
    const onCreate = jest.fn().mockResolvedValue(true);
    render(
      <TenantForm
        mode="create"
        operationalPrompts={prompts}
        isLoading={false}
        onCancel={jest.fn()}
        onCreate={onCreate}
      />,
    );

    fillBaseFields();
    fireEvent.click(screen.getByRole("radio", { name: /Atendimento Clínica/i }));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(
        {
          tenant_id: "tenant-1",
          name: "Tenant One",
          google_calendar_id: "calendar",
          allowed_domains: ["example.com"],
          scheduling_enabled: true,
        },
        { mode: "existing", prompt_id: "p-clinica" },
      ),
    );
  });

  it("does not render a prompt field in edit mode", () => {
    render(
      <TenantForm
        mode="edit"
        initialValues={{
          tenant_id: "tenant-1",
          name: "One",
          google_calendar_id: "calendar",
          allowed_domains: ["example.com"],
        }}
        isLoading={false}
        onCancel={jest.fn()}
        onEdit={jest.fn().mockResolvedValue(true)}
      />,
    );

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByText("Prompt")).not.toBeInTheDocument();
  });

  it("shows loading and server field errors in edit mode", () => {
    render(
      <TenantForm
        mode="edit"
        initialValues={{
          tenant_id: "tenant-1",
          name: "One",
          google_calendar_id: "calendar",
          allowed_domains: ["example.com"],
        }}
        isLoading
        fieldErrors={{ name: "Nome já utilizado" }}
        onCancel={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Nome já utilizado");
    expect(screen.getByRole("button", { name: "Salvando" })).toBeDisabled();
  });

  it("submits edit mode with only the writable fields", async () => {
    const onEdit = jest.fn().mockResolvedValue(true);
    render(
      <TenantForm
        mode="edit"
        initialValues={{
          tenant_id: "tenant-1",
          name: "One",
          google_calendar_id: "calendar",
          allowed_domains: ["example.com"],
        }}
        isLoading={false}
        onCancel={jest.fn()}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith({
        name: "One",
        google_calendar_id: "calendar",
        allowed_domains: ["example.com"],
        scheduling_enabled: true,
      }),
    );
  });

  it("reports dirty state changes via onDirtyChange", () => {
    const onDirtyChange = jest.fn();
    render(
      <TenantForm
        mode="create"
        operationalPrompts={prompts}
        isLoading={false}
        onCancel={jest.fn()}
        onCreate={jest.fn()}
        onDirtyChange={onDirtyChange}
      />,
    );

    expect(onDirtyChange).toHaveBeenLastCalledWith(false);

    fireEvent.change(screen.getByLabelText("Nome do tenant"), {
      target: { value: "Tenant One" },
    });

    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it("creates a new prompt from a template, preserving the {guardrails} placeholder, and submits the new intent", async () => {
    const onCreate = jest.fn().mockResolvedValue(true);
    render(
      <TenantForm
        mode="create"
        operationalPrompts={prompts}
        isLoading={false}
        onCancel={jest.fn()}
        onCreate={onCreate}
      />,
    );

    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
    fireEvent.change(screen.getByLabelText("Modelo de prompt"), {
      target: { value: "p-clinica" },
    });
    fireEvent.change(screen.getByLabelText("Título do novo prompt"), {
      target: { value: "Atendimento Clínica (cópia)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(expect.anything(), {
        mode: "new",
        prompt: {
          titulo: "Atendimento Clínica (cópia)",
          conteudo: "Você atende uma clínica.\n\n{guardrails}",
          is_default: false,
          node_type: "operational",
          guardrail_ids: [],
        },
      }),
    );
  });
});
