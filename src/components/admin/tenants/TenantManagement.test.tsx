import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useOnboardingGuideContext } from "@/context/OnboardingGuideContext";
import { useTenantManagement } from "@/hooks/useTenantManagement";
import { usePrompts } from "@/hooks/usePrompts";
import { useTenantGrid } from "@/hooks/useTenantGrid";
import { TenantManagement } from "./TenantManagement";

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

jest.mock("@/hooks/useTenantManagement", () => ({
  useTenantManagement: jest.fn(),
}));

jest.mock("@/hooks/usePrompts", () => ({
  usePrompts: jest.fn(),
}));

jest.mock("@/hooks/useTenantGrid", () => ({
  useTenantGrid: jest.fn(),
}));

jest.mock("@/context/OnboardingGuideContext", () => ({
  useOnboardingGuideContext: jest.fn(),
}));

const useTenantMock = jest.mocked(useTenantManagement);
const usePromptsMock = jest.mocked(usePrompts);
const useTenantGridMock = jest.mocked(useTenantGrid);
const useGuideMock = jest.mocked(useOnboardingGuideContext);
const guideActions = {
  isEnabled: true,
  activeTenantId: null,
  completedSteps: [],
  isMinimized: false,
  openGuide: jest.fn(),
  closeGuide: jest.fn(),
  minimizeGuide: jest.fn(),
  maximizeGuide: jest.fn(),
  toggleStepComplete: jest.fn(),
  disableGuide: jest.fn(),
  reEnableGuide: jest.fn(),
};
const gridActions = {
  fetchPage: jest.fn().mockResolvedValue(undefined),
  goToPrevious: jest.fn(),
  goToNext: jest.fn(),
};
const actions = {
  create: jest.fn().mockResolvedValue(true),
  lookup: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(true),
  clearFeedback: jest.fn(),
};

describe("TenantManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTenantMock.mockReturnValue({
      tenant: null,
      operation: null,
      isLoading: false,
      error: null,
      feedback: null,
      fieldErrors: undefined,
      pendingPromptId: null,
      ...actions,
    });
    usePromptsMock.mockReturnValue({
      prompts: [],
      guardrails: [],
      state: "success",
      error: null,
      refreshPrompts: jest.fn(),
      addPrompt: jest.fn().mockResolvedValue(true),
      editPrompt: jest.fn().mockResolvedValue(true),
      removePrompt: jest.fn().mockResolvedValue(true),
    });
    useTenantGridMock.mockReturnValue({
      items: [{ id: "tenant-1", name: "Tenant One" }] as never,
      total: 1,
      offset: 0,
      limit: 20,
      loading: false,
      error: null,
      hasPrevious: false,
      hasNext: false,
      ...gridActions,
    });
    useGuideMock.mockReturnValue({ ...guideActions });
  });

  it("renders the tenant grid alongside the ID lookup", () => {
    render(<TenantManagement />);

    expect(screen.getByRole("heading", { name: "Tenants" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo tenant" })).toBeInTheDocument();
    expect(screen.getByLabelText("ID do tenant")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tenant-1/ })).toBeInTheDocument();
  });

  it("looks up the clicked tenant row, same as a manual search", () => {
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole("button", { name: /tenant-1/ }));

    expect(actions.lookup).toHaveBeenCalledWith("tenant-1");
  });

  it("opens the create form", () => {
    render(<TenantManagement />);
    fireEvent.click(screen.getByRole("button", { name: "Novo tenant" }));
    expect(screen.getByRole("dialog", { name: "Novo tenant" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome do tenant")).toBeInTheDocument();
  });

  it("opens the onboarding guide for the created tenant after a successful create", async () => {
    usePromptsMock.mockReturnValue({
      prompts: [
        {
          id: "p-clinica",
          titulo: "Atendimento Clínica",
          conteudo: "Você atende uma clínica.\n\n{guardrails}",
          is_default: false,
          node_type: "operational",
          guardrail_ids: [],
        },
      ] as never,
      guardrails: [],
      state: "success",
      error: null,
      refreshPrompts: jest.fn(),
      addPrompt: jest.fn().mockResolvedValue(true),
      editPrompt: jest.fn().mockResolvedValue(true),
      removePrompt: jest.fn().mockResolvedValue(true),
    });
    render(<TenantManagement />);
    fireEvent.click(screen.getByRole("button", { name: "Novo tenant" }));
    fireEvent.change(screen.getByLabelText("ID do tenant"), { target: { value: "tenant-1" } });
    fireEvent.change(screen.getByLabelText("Nome do tenant"), { target: { value: "Tenant One" } });
    fireEvent.change(screen.getByLabelText("ID do Google Calendar"), { target: { value: "calendar" } });
    fireEvent.change(screen.getByLabelText("Domínios permitidos"), { target: { value: "example.com" } });
    fireEvent.keyDown(screen.getByLabelText("Domínios permitidos"), { key: "Enter" });
    fireEvent.click(screen.getByRole("radio", { name: /Atendimento Clínica/i }));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() => expect(actions.create).toHaveBeenCalled());
    expect(guideActions.openGuide).toHaveBeenCalledWith("tenant-1");
  });

  it("shows a control to re-enable the guide only when it has been disabled", () => {
    useGuideMock.mockReturnValue({ ...guideActions, isEnabled: false });
    render(<TenantManagement />);

    const reEnableButton = screen.getByRole("button", { name: "Reativar guia de configuração" });
    fireEvent.click(reEnableButton);

    expect(guideActions.reEnableGuide).toHaveBeenCalled();
  });

  it("does not show the re-enable control when the guide is already enabled", () => {
    render(<TenantManagement />);
    expect(
      screen.queryByRole("button", { name: "Reativar guia de configuração" }),
    ).not.toBeInTheDocument();
  });

  it("asks for discard confirmation when closing the create form with unsaved changes", () => {
    render(<TenantManagement />);
    fireEvent.click(screen.getByRole("button", { name: "Novo tenant" }));
    fireEvent.change(screen.getByLabelText("Nome do tenant"), {
      target: { value: "Tenant One" },
    });

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(screen.getByRole("alertdialog", { name: "Descartar alterações?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Descartar alterações" }));
    expect(screen.queryByRole("dialog", { name: "Novo tenant" })).not.toBeInTheDocument();
  });
});