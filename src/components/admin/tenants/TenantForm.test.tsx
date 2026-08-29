import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

// Evita chamada de rede real (sem NEXT_PUBLIC_PYTHON_BACKEND_URL neste teste)
// e torna a dica de estimativa determinística (EDI-63).
jest.mock("@/hooks/useMessageLimitConfig", () => ({
  useMessageLimitConfig: () => ({
    config: { worst_case_calls_per_message: 3, average_calls_per_message: 3 },
    loading: false,
    error: null,
  }),
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
          monthly_message_limit: null,
          notification_emails: [],
        },
        { mode: "existing", prompt_id: "p-clinica" },
      ),
    );
  });

  it("shows the prerequisite reminder in create mode, and it never blocks submission", async () => {
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

    expect(
      screen.getByText(/o prompt inicial e a base de conhecimento deste cliente já existem/i),
    ).toBeInTheDocument();

    fillBaseFields();
    fireEvent.click(screen.getByRole("radio", { name: /Atendimento Clínica/i }));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalled());
  });

  it("does not render the prerequisite reminder in edit mode", () => {
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

    expect(
      screen.queryByText(/o prompt inicial e a base de conhecimento deste cliente já existem/i),
    ).not.toBeInTheDocument();
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
        monthly_message_limit: null,
        notification_emails: [],
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

  it("creates a new prompt from a template with every required placeholder, and submits the new intent", async () => {
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

    const conteudoCompleto =
      "{guardrails} {tenant_id} {contexto_formatado} {tabela_calendario_str} {hora_atual_str} {data_hoje_iso}";

    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
    fireEvent.change(screen.getByLabelText("Modelo de prompt"), {
      target: { value: "p-clinica" },
    });
    fireEvent.change(screen.getByLabelText("Título do novo prompt"), {
      target: { value: "Atendimento Clínica (cópia)" },
    });
    fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), {
      target: { value: conteudoCompleto },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(expect.anything(), {
        mode: "new",
        prompt: {
          titulo: "Atendimento Clínica (cópia)",
          conteudo: conteudoCompleto,
          is_default: false,
          node_type: "operational",
          guardrail_ids: [],
        },
      }),
    );
  });

  describe("026 — validação de placeholders obrigatórios no rascunho de novo prompt", () => {
    function startNewPromptDraft(conteudo: string) {
      fireEvent.click(screen.getByRole("button", { name: /Criar novo a partir de um modelo/i }));
      fireEvent.change(screen.getByLabelText("Modelo de prompt"), {
        target: { value: "p-clinica" },
      });
      fireEvent.change(screen.getByLabelText("Título do novo prompt"), {
        target: { value: "Atendimento Clínica (cópia)" },
      });
      fireEvent.change(screen.getByLabelText("Conteúdo (Markdown)"), {
        target: { value: conteudo },
      });
    }

    it("blocks the create and lists the missing tokens when the draft lacks required placeholders", async () => {
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
      startNewPromptDraft("{guardrails} conteúdo sem os demais marcadores.");
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

      const alert = await screen.findByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" });
      expect(within(alert).getByText("{tenant_id}")).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("'Corrigir' closes the alert and preserves the tenant fields and the draft", async () => {
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
      startNewPromptDraft("{guardrails} conteúdo sem os demais marcadores.");
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));
      await screen.findByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" });

      fireEvent.click(screen.getByRole("button", { name: "Corrigir" }));

      expect(screen.queryByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" })).not.toBeInTheDocument();
      expect(screen.getByLabelText("ID do tenant")).toHaveValue("tenant-1");
      expect(screen.getByLabelText("Título do novo prompt")).toHaveValue("Atendimento Clínica (cópia)");
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("'Salvar mesmo assim' proceeds with onCreate using the pending draft", async () => {
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
      startNewPromptDraft("{guardrails} conteúdo sem os demais marcadores.");
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));
      await screen.findByRole("alertdialog", { name: "Placeholders obrigatórios ausentes" });

      fireEvent.click(screen.getByRole("button", { name: "Salvar mesmo assim" }));

      await waitFor(() =>
        expect(onCreate).toHaveBeenCalledWith(expect.anything(), {
          mode: "new",
          prompt: expect.objectContaining({ conteudo: "{guardrails} conteúdo sem os demais marcadores." }),
        }),
      );
    });
  });

  describe("EDI-63 — limite mensal e e-mails de notificação", () => {
    it("submits monthly_message_limit and notification_emails filled in by the admin", async () => {
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
      fireEvent.change(screen.getByLabelText(/Limite mensal de chamadas de LLM/i), {
        target: { value: "500" },
      });
      const emailInput = screen.getByLabelText(/E-mails de aviso de consumo/i);
      fireEvent.change(emailInput, { target: { value: "manager@buffet.com" } });
      fireEvent.keyDown(emailInput, { key: "Enter" });
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

      await waitFor(() =>
        expect(onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            monthly_message_limit: 500,
            notification_emails: ["manager@buffet.com"],
          }),
          expect.anything(),
        ),
      );
    });

    it("shows an estimate hint next to the limit field once a value is entered", () => {
      render(
        <TenantForm
          mode="create"
          operationalPrompts={prompts}
          isLoading={false}
          onCancel={jest.fn()}
          onCreate={jest.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText(/Limite mensal de chamadas de LLM/i), {
        target: { value: "1000" },
      });

      expect(screen.getByText(/≈ 334 mensagens reais/i)).toBeInTheDocument();
    });

    it("maps server-side field errors for the new fields onto the form", () => {
      render(
        <TenantForm
          mode="create"
          operationalPrompts={prompts}
          isLoading={false}
          fieldErrors={{
            monthly_message_limit: "Deve ser maior que zero.",
            notification_emails: "Um dos e-mails é inválido.",
          }}
          onCancel={jest.fn()}
          onCreate={jest.fn()}
        />,
      );

      expect(screen.getByText("Deve ser maior que zero.")).toBeInTheDocument();
      expect(screen.getByText("Um dos e-mails é inválido.")).toBeInTheDocument();
    });

    it("allows saving without any notification e-mail (optional field)", async () => {
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
          expect.objectContaining({ notification_emails: [] }),
          expect.anything(),
        ),
      );
    });
  });
});
