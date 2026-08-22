import { fireEvent, render, screen } from "@testing-library/react";
import { useTenantManagement } from "@/hooks/useTenantManagement";
import { usePrompts } from "@/hooks/usePrompts";
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

const useTenantMock = jest.mocked(useTenantManagement);
const usePromptsMock = jest.mocked(usePrompts);
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
  });

  it("renders the first version without an invented listing", () => {
    render(<TenantManagement />);

    expect(screen.getByRole("heading", { name: "Tenants" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo tenant" })).toBeInTheDocument();
    expect(screen.getByLabelText("ID do tenant")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("opens the create form", () => {
    render(<TenantManagement />);
    fireEvent.click(screen.getByRole("button", { name: "Novo tenant" }));
    expect(screen.getByRole("dialog", { name: "Novo tenant" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome do tenant")).toBeInTheDocument();
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