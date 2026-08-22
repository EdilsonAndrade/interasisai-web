import { fireEvent, render, screen } from "@testing-library/react";
import { TenantDetails } from "./TenantDetails";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const tenant = {
  id: "tenant-1",
  name: "Tenant One",
  google_calendar_id: "calendar",
  allowed_domains: ["example.com"],
  created_at: "2026-08-08T10:00:00Z",
  updated_at: "2026-08-08T11:00:00Z",
  deleted_at: null,
};

const bindingProps = {
  bindingState: "linked" as const,
  bindingDetail: {
    tenant_id: "tenant-1",
    node_type: "operational" as const,
    prompt_id: "prompt-1",
    is_active: true,
    custom_content_override: null,
    prompt_titulo: "Atendimento Padrão",
    prompt_conteudo: "...",
    is_default_prompt: false,
    guardrails_associados: [],
  },
  bindingError: null,
  bindingLinking: false,
  operationalPrompts: [],
  onLinkPrompt: jest.fn().mockResolvedValue(true),
  institutionalPrompt: { state: "idle" as const, detail: null, error: null },
  chitchatPrompt: { state: "idle" as const, detail: null, error: null },
};

describe("TenantDetails", () => {
  beforeEach(() => jest.clearAllMocks());

  it("navigates to the WhatsApp instances screen with Tenant ID and Nome pre-filled", () => {
    render(
      <TenantDetails tenant={tenant} onEdit={jest.fn()} onDelete={jest.fn()} {...bindingProps} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));

    expect(push).toHaveBeenCalledWith("/admin/whatsapp?tenantId=tenant-1&instanceName=Tenant+One");
  });

  it("renders tenant data and active actions", () => {
    render(
      <TenantDetails tenant={tenant} onEdit={jest.fn()} onDelete={jest.fn()} {...bindingProps} />,
    );

    expect(screen.getByRole("heading", { name: "Tenant One" })).toBeInTheDocument();
    expect(screen.getByText("tenant-1")).toBeInTheDocument();
    expect(screen.getByText("calendar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("triggers onDelete when the discreet DeleteAction is clicked", () => {
    const onDelete = jest.fn();
    render(
      <TenantDetails tenant={tenant} onEdit={jest.fn()} onDelete={onDelete} {...bindingProps} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows 'Nunca atualizado' instead of the literal 'Não informado' when updated_at is empty", () => {
    render(
      <TenantDetails
        tenant={{ ...tenant, updated_at: null }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        {...bindingProps}
      />,
    );

    expect(screen.getByText("Nunca atualizado")).toBeInTheDocument();
    expect(screen.queryByText("Não informado")).not.toBeInTheDocument();
  });

  it("hides mutation actions and the prompt binding card for a deleted tenant", () => {
    render(
      <TenantDetails
        tenant={{ ...tenant, deleted_at: "2026-08-08T12:00:00Z" }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        {...bindingProps}
      />,
    );
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.getByText("Tenant excluído")).toBeInTheDocument();
    expect(screen.queryByText("Atendimento Padrão")).not.toBeInTheDocument();
  });

  it("shows the broken-configuration alert and links the chosen prompt", async () => {
    const onLinkPrompt = jest.fn().mockResolvedValue(true);
    render(
      <TenantDetails
        tenant={tenant}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        {...bindingProps}
        bindingState="missing"
        bindingDetail={{
          ...bindingProps.bindingDetail,
          is_default_prompt: true,
          prompt_titulo: "Atendimento Padrão (não é o vigente)",
        }}
        operationalPrompts={[
          {
            id: "prompt-2",
            titulo: "Atendimento Clínica",
            conteudo: "...",
            is_default: false,
            node_type: "operational",
            guardrail_ids: [],
          },
        ]}
        onLinkPrompt={onLinkPrompt}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/não tem prompt vinculado/i);
    expect(screen.queryByText("Atendimento Padrão (não é o vigente)")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Vincular prompt"), {
      target: { value: "prompt-2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Vincular prompt" }));

    expect(onLinkPrompt).toHaveBeenCalledWith("prompt-2");
  });

  it("labels institutional and chitchat prompts, and shows a neutral message when unbound", () => {
    render(
      <TenantDetails
        tenant={tenant}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        {...bindingProps}
        institutionalPrompt={{
          state: "linked",
          detail: {
            tenant_id: "tenant-1",
            node_type: "institutional",
            prompt_id: "prompt-inst",
            is_active: true,
            custom_content_override: null,
            prompt_titulo: "Prompt Institucional",
            prompt_conteudo: "...",
            is_default_prompt: false,
            guardrails_associados: [{ id: "g1", titulo: "Guardrail Global", conteudo: "...", is_global: true }],
          },
          error: null,
        }}
        chitchatPrompt={{ state: "missing", detail: null, error: null }}
      />,
    );

    expect(screen.getByText("Institucional")).toBeInTheDocument();
    expect(screen.getByText("Prompt Institucional")).toBeInTheDocument();
    expect(screen.getByText("Guardrail Global")).toBeInTheDocument();
    expect(screen.getByText("Global")).toBeInTheDocument();

    expect(screen.getByText("Chitchat")).toBeInTheDocument();
    expect(screen.getByText("Nenhum prompt vinculado (usa o padrão da plataforma).")).toBeInTheDocument();
  });
});
