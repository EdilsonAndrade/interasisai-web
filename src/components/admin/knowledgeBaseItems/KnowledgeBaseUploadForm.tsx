"use client";

import { useId, useState, type FormEvent } from "react";
import { UploadCloud } from "lucide-react";
import {
  KNOWLEDGE_BASE_ACCEPTED_EXTENSIONS,
  knowledgeBasePastedTextSchema,
  validateKnowledgeBaseFiles,
} from "@/lib/knowledgeBaseItemSchemas";
import type { KnowledgeBaseUploadMode } from "@/services/pythonBackend.types";

type PendingFile = {
  file: File;
  error: string | null;
};

type KnowledgeBaseUploadFormProps = {
  submitting: boolean;
  onSubmit: (input: { files: File[]; texts: string[]; mode: KnowledgeBaseUploadMode }) => void;
};

const ACCEPT_ATTR = KNOWLEDGE_BASE_ACCEPTED_EXTENSIONS.join(",");

export function KnowledgeBaseUploadForm({ submitting, onSubmit }: KnowledgeBaseUploadFormProps) {
  const fileInputId = useId();
  const textInputId = useId();
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [mode, setMode] = useState<KnowledgeBaseUploadMode>("append");
  const [formError, setFormError] = useState<string | null>(null);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setPendingFiles(validateKnowledgeBaseFiles(selected));
    setFormError(null);
    event.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const validFiles = pendingFiles.filter((p) => p.error === null).map((p) => p.file);
    const textResult = pastedText.trim() ? knowledgeBasePastedTextSchema.safeParse(pastedText) : null;
    const texts = textResult?.success ? [textResult.data] : [];

    if (validFiles.length === 0 && texts.length === 0) {
      setFormError("Selecione ao menos um arquivo válido ou cole um texto para enviar.");
      return;
    }

    setFormError(null);
    onSubmit({ files: validFiles, texts, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={fileInputId} className="block text-sm font-medium text-text-body">
          Arquivos (PDF, XLS, XLSX ou CSV)
        </label>
        <input
          id={fileInputId}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          disabled={submitting}
          onChange={handleFilesChange}
          className="block w-full text-sm text-text-body file:mr-4 file:rounded-card file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-text-inverse hover:file:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        />
        {pendingFiles.length > 0 && (
          <ul className="space-y-1 text-sm">
            {pendingFiles.map((pending, index) => (
              <li
                key={`${pending.file.name}-${index}`}
                className="flex items-center justify-between gap-2 rounded-card border border-border-subtle px-3 py-2"
              >
                <span className="truncate text-text-body">{pending.file.name}</span>
                {pending.error ? (
                  <span role="alert" className="shrink-0 text-red-300">
                    {pending.error}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="shrink-0 text-xs text-text-body/70 hover:text-text-strong"
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={textInputId} className="block text-sm font-medium text-text-body">
          Ou cole um texto direto
        </label>
        <textarea
          id={textInputId}
          value={pastedText}
          onChange={(e) => {
            setPastedText(e.target.value);
            setFormError(null);
          }}
          rows={4}
          disabled={submitting}
          placeholder="Cole aqui um texto institucional, regras de negócio, horários, preços, etc..."
          className="w-full resize-y rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-text-body">Ao enviar, esta ingestão deve</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="knowledge-base-upload-mode"
              value="append"
              checked={mode === "append"}
              disabled={submitting}
              onChange={() => setMode("append")}
            />
            Adicionar aos dados existentes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="knowledge-base-upload-mode"
              value="replace"
              checked={mode === "replace"}
              disabled={submitting}
              onChange={() => setMode("replace")}
            />
            Substituir todos os dados existentes
          </label>
        </div>
      </fieldset>

      {formError && (
        <p role="alert" className="text-sm text-red-300">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-card bg-brand-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        {submitting ? "Enviando..." : "Enviar arquivos/texto"}
      </button>
    </form>
  );
}
