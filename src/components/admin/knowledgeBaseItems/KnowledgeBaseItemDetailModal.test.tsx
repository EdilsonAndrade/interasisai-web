import { fireEvent, render, screen } from "@testing-library/react";
import { KnowledgeBaseItemDetailModal } from "./KnowledgeBaseItemDetailModal";

const fileItem = {
  id: "item-1",
  tenant_id: "1234",
  source_type: "file" as const,
  filename: "precos.xlsx",
  content: "conteúdo completo do arquivo",
  created_at: "2026-09-01T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
};

const textItem = {
  ...fileItem,
  id: "item-2",
  source_type: "texto" as const,
  filename: null,
  content: "texto colado completo",
};

function baseProps(overrides: Partial<React.ComponentProps<typeof KnowledgeBaseItemDetailModal>> = {}) {
  return {
    open: true,
    item: fileItem,
    loading: false,
    saving: false,
    replacingFile: false,
    error: null,
    onClose: jest.fn(),
    onSaveContent: jest.fn(),
    onRequestReplaceFile: jest.fn(),
    onRequestDelete: jest.fn(),
    ...overrides,
  };
}

describe("KnowledgeBaseItemDetailModal", () => {
  it("shows a loading state while the item detail is being fetched", () => {
    render(<KnowledgeBaseItemDetailModal {...baseProps({ loading: true, item: null })} />);
    expect(screen.getByText("Carregando conteúdo...")).toBeInTheDocument();
  });

  it("renders the full content of the item", () => {
    render(<KnowledgeBaseItemDetailModal {...baseProps()} />);
    expect(screen.getByLabelText("Conteúdo completo")).toHaveValue("conteúdo completo do arquivo");
    expect(screen.getByRole("dialog", { name: "precos.xlsx" })).toBeInTheDocument();
  });

  it("labels the dialog 'Texto colado' for a pasted-text item", () => {
    render(<KnowledgeBaseItemDetailModal {...baseProps({ item: textItem })} />);
    expect(screen.getByRole("dialog", { name: "Texto colado" })).toBeInTheDocument();
  });

  it("only shows the file-replace input for file-sourced items", () => {
    const { rerender } = render(<KnowledgeBaseItemDetailModal {...baseProps()} />);
    expect(screen.getByLabelText("Substituir arquivo deste item")).toBeInTheDocument();

    rerender(<KnowledgeBaseItemDetailModal {...baseProps({ item: textItem })} />);
    expect(screen.queryByLabelText("Substituir arquivo deste item")).not.toBeInTheDocument();
  });

  it("edits and saves the content", () => {
    const onSaveContent = jest.fn();
    render(<KnowledgeBaseItemDetailModal {...baseProps({ onSaveContent })} />);

    fireEvent.change(screen.getByLabelText("Conteúdo completo"), {
      target: { value: "conteúdo editado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar conteúdo" }));

    expect(onSaveContent).toHaveBeenCalledWith("conteúdo editado");
  });

  it("blocks saving empty content", () => {
    const onSaveContent = jest.fn();
    render(<KnowledgeBaseItemDetailModal {...baseProps({ onSaveContent })} />);

    fireEvent.change(screen.getByLabelText("Conteúdo completo"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar conteúdo" }));

    expect(screen.getByRole("alert")).toHaveTextContent("O conteúdo não pode ficar vazio.");
    expect(onSaveContent).not.toHaveBeenCalled();
  });

  it("triggers the replace-file callback when a new file is selected", () => {
    const onRequestReplaceFile = jest.fn();
    render(<KnowledgeBaseItemDetailModal {...baseProps({ onRequestReplaceFile })} />);

    const newFile = new File(["x"], "precos-v2.xlsx");
    fireEvent.change(screen.getByLabelText("Substituir arquivo deste item"), {
      target: { files: [newFile] },
    });

    expect(onRequestReplaceFile).toHaveBeenCalledWith(newFile);
  });

  it("triggers the delete callback", () => {
    const onRequestDelete = jest.fn();
    render(<KnowledgeBaseItemDetailModal {...baseProps({ onRequestDelete })} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir este item" }));

    expect(onRequestDelete).toHaveBeenCalledTimes(1);
  });

  it("shows a hook-level error", () => {
    render(<KnowledgeBaseItemDetailModal {...baseProps({ error: "Item não encontrado." })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Item não encontrado.");
  });
});
