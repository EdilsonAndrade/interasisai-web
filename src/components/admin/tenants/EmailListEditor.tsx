"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { notificationEmailSchema } from "@/lib/tenantSchemas";

const MAX_EMAILS = 10;

type EmailListEditorProps = {
  id: string;
  label: string;
  value: string[];
  onChange: (emails: string[]) => void;
  disabled?: boolean;
  error?: string;
};

export function EmailListEditor({ id, label, value, onChange, disabled, error }: EmailListEditorProps) {
  const [input, setInput] = useState("");
  const [localError, setLocalError] = useState<string>();

  const addEmail = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (value.length >= MAX_EMAILS) {
      setLocalError(`Máximo de ${MAX_EMAILS} e-mails.`);
      return;
    }

    const parsed = notificationEmailSchema.safeParse(trimmed);
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? "E-mail inválido.");
      return;
    }

    if (value.includes(parsed.data)) {
      setLocalError("Este e-mail já foi adicionado.");
      return;
    }

    onChange([...value, parsed.data]);
    setInput("");
    setLocalError(undefined);
  };

  const removeEmail = (email: string) => {
    onChange(value.filter((item) => item !== email));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addEmail();
  };

  const describedBy = localError || error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-text-body">
        {label}
      </label>
      <input
        id={id}
        type="email"
        value={input}
        disabled={disabled}
        onChange={(event) => { setInput(event.target.value); setLocalError(undefined); }}
        onKeyDown={handleKeyDown}
        onBlur={addEmail}
        placeholder="responsavel@empresa.com.br"
        aria-invalid={Boolean(localError || error)}
        aria-describedby={describedBy}
        className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={`${label} adicionados`}>
          {value.map((email) => (
            <li
              key={email}
              className="inline-flex max-w-full items-center gap-2 rounded-card border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-text-strong"
            >
              <span className="break-all">{email}</span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                disabled={disabled}
                aria-label={`Remover e-mail ${email}`}
                className="shrink-0 rounded-full p-0.5 text-text-muted hover:bg-surface-subtle hover:text-text-strong disabled:opacity-60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {(localError || error) && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-300">
          {localError ?? error}
        </p>
      )}
    </div>
  );
}
