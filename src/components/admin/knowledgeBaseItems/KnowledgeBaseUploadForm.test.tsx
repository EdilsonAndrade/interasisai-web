import { fireEvent, render, screen } from "@testing-library/react";
import { KnowledgeBaseUploadForm } from "./KnowledgeBaseUploadForm";

function makeFile(name: string, sizeBytes: number, type = "text/plain") {
  const file = new File(["x".repeat(Math.min(sizeBytes, 10))], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

describe("KnowledgeBaseUploadForm", () => {
  it("submits valid files, pasted text, and the selected mode", () => {
    const onSubmit = jest.fn();
    render(<KnowledgeBaseUploadForm submitting={false} onSubmit={onSubmit} />);

    const file = makeFile("precos.csv", 1024, "text/csv");
    fireEvent.change(screen.getByLabelText("Arquivos (PDF, XLS, XLSX ou CSV)"), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText("Ou cole um texto direto"), {
      target: { value: "texto institucional" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Substituir todos os dados existentes" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar arquivos/texto" }));

    expect(onSubmit).toHaveBeenCalledWith({
      files: [file],
      texts: ["texto institucional"],
      mode: "replace",
    });
  });

  it("rejects a file with an unsupported extension and excludes it from submission", () => {
    const onSubmit = jest.fn();
    render(<KnowledgeBaseUploadForm submitting={false} onSubmit={onSubmit} />);

    const badFile = makeFile("apresentacao.docx", 1024);
    fireEvent.change(screen.getByLabelText("Arquivos (PDF, XLS, XLSX ou CSV)"), {
      target: { files: [badFile] },
    });

    expect(screen.getByText(/Formato não suportado/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Ou cole um texto direto"), {
      target: { value: "texto válido" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar arquivos/texto" }));

    expect(onSubmit).toHaveBeenCalledWith({ files: [], texts: ["texto válido"], mode: "append" });
  });

  it("rejects a file larger than 10MB", () => {
    render(<KnowledgeBaseUploadForm submitting={false} onSubmit={jest.fn()} />);

    const bigFile = makeFile("planilha.csv", 11 * 1024 * 1024, "text/csv");
    fireEvent.change(screen.getByLabelText("Arquivos (PDF, XLS, XLSX ou CSV)"), {
      target: { files: [bigFile] },
    });

    expect(screen.getByText("O arquivo excede o limite máximo de 10MB.")).toBeInTheDocument();
  });

  it("blocks submission when nothing valid is selected", () => {
    const onSubmit = jest.fn();
    render(<KnowledgeBaseUploadForm submitting={false} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Enviar arquivos/texto" }));

    expect(
      screen.getByText("Selecione ao menos um arquivo válido ou cole um texto para enviar."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables inputs and shows the sending label while submitting", () => {
    render(<KnowledgeBaseUploadForm submitting onSubmit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(screen.getByLabelText("Arquivos (PDF, XLS, XLSX ou CSV)")).toBeDisabled();
    expect(screen.getByLabelText("Ou cole um texto direto")).toBeDisabled();
  });
});
