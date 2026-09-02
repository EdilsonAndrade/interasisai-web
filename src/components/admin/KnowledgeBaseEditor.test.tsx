import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useKnowledgeBaseItems } from "@/hooks/useKnowledgeBaseItems";
import { KnowledgeBaseEditor } from "./KnowledgeBaseEditor";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/hooks/useKnowledgeBase", () => ({
  useKnowledgeBase: jest.fn(),
}));

jest.mock("@/hooks/useKnowledgeBaseItems", () => ({
  useKnowledgeBaseItems: jest.fn(),
}));

const useKnowledgeBaseMock = jest.mocked(useKnowledgeBase);
const useKnowledgeBaseItemsMock = jest.mocked(useKnowledgeBaseItems);

function mockHook(overrides: Partial<ReturnType<typeof useKnowledgeBase>> = {}) {
  const save = jest.fn().mockResolvedValue(true);
  const remove = jest.fn().mockResolvedValue(true);
  const refresh = jest.fn().mockResolvedValue(undefined);
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
    refresh,
    ...overrides,
  });
  return { save, remove, refresh };
}

const item1 = {
  id: "item-1",
  tenant_id: "1234",
  source_type: "file" as const,
  filename: "precos.xlsx",
  content_preview: "prévia de preços",
  content_length: 100,
  created_at: "2026-09-01T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
};

function mockItemsHook(overrides: Partial<ReturnType<typeof useKnowledgeBaseItems>> = {}) {
  const uploadItems = jest.fn().mockResolvedValue(true);
  const resolveDuplicatesAndRetry = jest.fn().mockResolvedValue(true);
  const clearConflicts = jest.fn();
  const getItemDetail = jest.fn();
  const clearSelectedItem = jest.fn();
  const replaceItemFile = jest.fn().mockResolvedValue(true);
  const deleteItem = jest.fn().mockResolvedValue(true);
  const updateItemContent = jest.fn().mockResolvedValue(true);
  const refresh = jest.fn().mockResolvedValue(undefined);

  useKnowledgeBaseItemsMock.mockReturnValue({
    items: [],
    loading: false,
    error: null,
    refresh,
    uploading: false,
    uploadError: null,
    conflicts: null,
    uploadItems,
    resolveDuplicatesAndRetry,
    clearConflicts,
    selectedItem: null,
    detailLoading: false,
    detailError: null,
    getItemDetail,
    clearSelectedItem,
    replacingFile: false,
    replaceItemFile,
    deletingItem: false,
    deleteItem,
    savingContent: false,
    updateItemContent,
    ...overrides,
  });

  return {
    uploadItems,
    resolveDuplicatesAndRetry,
    clearConflicts,
    getItemDetail,
    clearSelectedItem,
    replaceItemFile,
    deleteItem,
    updateItemContent,
    refresh,
  };
}

describe("KnowledgeBaseEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockItemsHook();
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

  // -------------------------------------------------------------------
  // US1 — upload de múltiplos arquivos/texto (greenfield)
  // -------------------------------------------------------------------

  it("US1: uploads multiple files plus pasted text after confirmation and refreshes the preview", async () => {
    const { refresh: kbRefresh } = mockHook({ content: null });
    const { uploadItems } = mockItemsHook({ items: [] });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    const csvFile = new File(["a"], "precos.csv", { type: "text/csv" });
    fireEvent.change(screen.getByLabelText("Arquivos (PDF, XLS, XLSX ou CSV)"), {
      target: { files: [csvFile] },
    });
    fireEvent.change(screen.getByLabelText("Ou cole um texto direto"), {
      target: { value: "texto institucional" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar arquivos/texto" }));

    const confirmDialog = screen.getByRole("dialog", { name: "Adicionar à ingestão existente?" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Adicionar" }));

    await waitFor(() =>
      expect(uploadItems).toHaveBeenCalledWith({
        files: [csvFile],
        texts: ["texto institucional"],
        mode: "append",
      }),
    );
    await waitFor(() => expect(kbRefresh).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Ingestão atualizada com sucesso."));
  });

  // -------------------------------------------------------------------
  // US2 — substituir/adicionar com confirmação + duplicidade
  // -------------------------------------------------------------------

  it("US2: replace-all requires confirmation before calling uploadItems with mode=replace", async () => {
    mockHook({ content: "existente" });
    const { uploadItems } = mockItemsHook();
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.change(screen.getByLabelText("Ou cole um texto direto"), {
      target: { value: "novo texto" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Substituir todos os dados existentes" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar arquivos/texto" }));

    expect(uploadItems).not.toHaveBeenCalled();
    const confirmDialog = screen.getByRole("dialog", { name: "Substituir todos os dados de ingestão?" });

    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Substituir" }));

    await waitFor(() =>
      expect(uploadItems).toHaveBeenCalledWith({ files: [], texts: ["novo texto"], mode: "replace" }),
    );
  });

  it("US2: cancelling the upload confirmation does not call uploadItems", () => {
    mockHook({ content: "existente" });
    const { uploadItems } = mockItemsHook();
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.change(screen.getByLabelText("Ou cole um texto direto"), {
      target: { value: "novo texto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar arquivos/texto" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(uploadItems).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("dialog", { name: "Adicionar à ingestão existente?" }),
    ).not.toBeInTheDocument();
  });

  it("US2: a 409 duplicate-filename conflict opens the duplicate dialog and resolves per user choice", async () => {
    mockHook({ content: "existente" });
    const { resolveDuplicatesAndRetry } = mockItemsHook({
      conflicts: [{ filename: "precos.xlsx", existing_item_id: "item-1" }],
    });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    const duplicateDialog = screen.getByRole("dialog", {
      name: "Arquivos já existentes na base de conhecimento",
    });
    expect(within(duplicateDialog).getByText("precos.xlsx")).toBeInTheDocument();

    fireEvent.click(within(duplicateDialog).getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(resolveDuplicatesAndRetry).toHaveBeenCalledWith([
        { filename: "precos.xlsx", action: "keep_both", existing_item_id: "item-1" },
      ]),
    );
  });

  // -------------------------------------------------------------------
  // US3 — grid, detalhe, substituir arquivo e excluir item
  // -------------------------------------------------------------------

  it("US3: opens the item detail modal when a grid row is clicked", () => {
    mockHook({ content: "existente" });
    const { getItemDetail } = mockItemsHook({
      items: [item1],
      selectedItem: { ...item1, content: "conteúdo completo" },
    });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByText("precos.xlsx"));

    expect(getItemDetail).toHaveBeenCalledWith("item-1");
    expect(screen.getByRole("dialog", { name: "precos.xlsx" })).toBeInTheDocument();
  });

  it("US3: replacing an item's file requires confirmation before calling replaceItemFile", async () => {
    mockHook({ content: "existente" });
    const { replaceItemFile } = mockItemsHook({
      items: [item1],
      selectedItem: { ...item1, content: "conteúdo completo" },
    });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByText("precos.xlsx"));
    const newFile = new File(["x"], "precos-v2.xlsx");
    fireEvent.change(screen.getByLabelText("Substituir arquivo deste item"), {
      target: { files: [newFile] },
    });

    expect(replaceItemFile).not.toHaveBeenCalled();
    const confirmDialog = screen.getByRole("dialog", { name: "Substituir arquivo deste item?" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Substituir" }));

    await waitFor(() => expect(replaceItemFile).toHaveBeenCalledWith("item-1", newFile));
  });

  it("US3: deleting an item requires confirmation, then closes the detail modal", async () => {
    mockHook({ content: "existente" });
    const { deleteItem, clearSelectedItem } = mockItemsHook({
      items: [item1],
      selectedItem: { ...item1, content: "conteúdo completo" },
    });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByText("precos.xlsx"));
    fireEvent.click(screen.getByRole("button", { name: "Excluir este item" }));

    expect(deleteItem).not.toHaveBeenCalled();
    const confirmDialog = screen.getByRole("dialog", { name: "Excluir este item?" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(deleteItem).toHaveBeenCalledWith("item-1"));
    await waitFor(() => expect(clearSelectedItem).toHaveBeenCalled());
  });

  // -------------------------------------------------------------------
  // US4 — edição manual do conteúdo de um item
  // -------------------------------------------------------------------

  it("US4: saving edited item content refreshes the consolidated preview", async () => {
    const { refresh: kbRefresh } = mockHook({ content: "existente" });
    const { updateItemContent } = mockItemsHook({
      items: [item1],
      selectedItem: { ...item1, content: "conteúdo original" },
    });
    render(<KnowledgeBaseEditor tenantId="1234" />);

    fireEvent.click(screen.getByText("precos.xlsx"));
    fireEvent.change(screen.getByLabelText("Conteúdo completo"), {
      target: { value: "conteúdo editado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar conteúdo" }));

    await waitFor(() => expect(updateItemContent).toHaveBeenCalledWith("item-1", "conteúdo editado"));
    await waitFor(() => expect(kbRefresh).toHaveBeenCalled());
  });
});
