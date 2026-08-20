import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { KnowledgeBaseEditor } from "./KnowledgeBaseEditor";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/hooks/useKnowledgeBase", () => ({
  useKnowledgeBase: jest.fn(),
}));

const useKnowledgeBaseMock = jest.mocked(useKnowledgeBase);

function mockHook(overrides: Partial<ReturnType<typeof useKnowledgeBase>> = {}) {
  const save = jest.fn().mockResolvedValue(true);
  const remove = jest.fn().mockResolvedValue(true);
  useKnowledgeBaseMock.mockReturnValue({
    content: null,
    updatedAt: null,
    loading: false,
    saving: false,
    deleting: false,
    error: null,
    fieldErrors: undefined,
    save,
    remove,
    ...overrides,
  });
  return { save, remove };
}

describe("KnowledgeBaseEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows a loading state", () => {
    mockHook({ loading: true });
    render(<KnowledgeBaseEditor tenantId="1234" />);
    expect(screen.getByText("Carregando base de conhecimento...")).toBeInTheDocument();
  });

  it("shows the empty state and an empty textarea when there is no content", () => {
    mockHook({ content: null });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    expect(
      screen.getByText("Nenhuma base de conhecimento cadastrada para este tenant."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Base de Conhecimento")).toHaveValue("");
  });

  it("pre-fills the textarea with existing content", () => {
    mockHook({ content: "conteúdo existente" });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    expect(screen.getByLabelText("Base de Conhecimento")).toHaveValue("conteúdo existente");
  });

  it("blocks saving empty content and shows a required-field message", async () => {
    const { save } = mockHook({ content: "algo" });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.change(screen.getByLabelText("Base de Conhecimento"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Base de Conhecimento" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "O conteúdo da base de conhecimento é obrigatório.",
      ),
    );
    expect(save).not.toHaveBeenCalled();
  });

  it("saves trimmed content and shows a success toast", async () => {
    const { save } = mockHook({ content: "" });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.change(screen.getByLabelText("Base de Conhecimento"), {
      target: { value: "  novo texto  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Base de Conhecimento" }));

    await waitFor(() => expect(save).toHaveBeenCalledWith("novo texto"));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("shows a field error returned by the service", () => {
    mockHook({ content: "x", fieldErrors: { content: "content não pode estar vazio" } });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    expect(screen.getByRole("alert")).toHaveTextContent("content não pode estar vazio");
  });

  it("toasts a general error from the hook", () => {
    mockHook({ error: "Não foi possível conectar ao servidor. Verifique sua conexão." });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível conectar ao servidor. Verifique sua conexão.",
    );
  });

  it("disables the save button while saving", () => {
    mockHook({ content: "x", saving: true });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
  });

  it("does not show a delete button when there is no content", () => {
    mockHook({ content: null });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
  });

  it("opens the delete dialog and deletes on confirmation", async () => {
    const { remove } = mockHook({ content: "conteúdo existente" });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    const dialog = screen.getByRole("dialog", { name: "Excluir base de conhecimento?" });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(
      "Base de conhecimento excluída com sucesso",
    ));
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Excluir base de conhecimento?" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("cancelling the dialog does not delete", () => {
    const { remove } = mockHook({ content: "conteúdo existente" });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(remove).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("dialog", { name: "Excluir base de conhecimento?" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the dialog open and preserves content when deletion fails", async () => {
    const { remove } = mockHook({ content: "conteúdo existente" });
    remove.mockResolvedValue(false);
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    const dialog = screen.getByRole("dialog", { name: "Excluir base de conhecimento?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole("dialog", { name: "Excluir base de conhecimento?" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Base de Conhecimento")).toHaveValue("conteúdo existente");
  });
});
