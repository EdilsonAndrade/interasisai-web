"use client";

import { AlertCircle, Loader2, Mail, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useGlobalRecipientsManager } from "@/hooks/useGlobalRecipientsManager";
import { globalRecipientCreateSchema } from "@/lib/globalRecipientsSchemas";

const FALLBACK_EMAIL = "contato@interasisai.com.br";

export function GlobalNotificationRecipients() {
  const { recipients, loading, error, create, update, remove } = useGlobalRecipientsManager();
  const [emailInput, setEmailInput] = useState("");
  const [createError, setCreateError] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = globalRecipientCreateSchema.safeParse({ email: emailInput.trim() });
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? "E-mail inválido.");
      return;
    }

    setCreating(true);
    setCreateError(undefined);
    try {
      await create(parsed.data.email);
      setEmailInput("");
    } catch (err) {
      const message =
        err && typeof err === "object" && "code" in err && err.code === "EMAIL_ALREADY_EXISTS"
          ? `O e-mail "${parsed.data.email}" já está cadastrado.`
          : "Não foi possível adicionar este e-mail. Tente novamente.";
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: number, active: boolean) => {
    setBusyId(id);
    try {
      await update(id, active);
    } catch {
      // Erro pontual de uma linha — não interrompe o restante da tela.
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (id: number) => {
    setBusyId(id);
    try {
      await remove(id);
    } catch {
      // Erro pontual de uma linha — não interrompe o restante da tela.
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section aria-labelledby="global-recipients-heading" className="space-y-6 rounded-card border border-brand-primary/20 bg-surface-base/60 p-5 backdrop-blur-xl sm:p-7">
      <div>
        <h2 id="global-recipients-heading" className="text-lg font-bold text-text-strong">
          Configurações Globais — Destinatários de alerta
        </h2>
        <p className="mt-1 text-sm text-text-weak">
          E-mails internos da InterasisAI que recebem todo alerta de bloqueio (100%) de qualquer tenant.
        </p>
      </div>

      <form onSubmit={submitCreate} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-2">
          <label htmlFor="global-recipient-email" className="sr-only">
            Novo e-mail
          </label>
          <input
            id="global-recipient-email"
            type="text"
            inputMode="email"
            value={emailInput}
            disabled={creating}
            onChange={(event) => { setEmailInput(event.target.value); setCreateError(undefined); }}
            placeholder="alerts@interasisai.com.br"
            aria-invalid={Boolean(createError)}
            aria-describedby={createError ? "global-recipient-email-error" : undefined}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
          />
          {createError && (
            <p id="global-recipient-email-error" role="alert" className="text-sm text-red-300">
              {createError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse disabled:opacity-60"
        >
          {creating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Adicionar
        </button>
      </form>

      {loading && <p className="text-sm text-text-weak">Carregando destinatários…</p>}

      {error && !loading && (
        <p role="alert" className="flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {!loading && !error && recipients.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-text-weak">
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          Nenhum e-mail cadastrado. Usando o fallback padrão: {FALLBACK_EMAIL}.
        </p>
      )}

      {!loading && recipients.length > 0 && (
        <ul className="space-y-2">
          {recipients.map((recipient) => (
            <li
              key={recipient.id}
              className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="break-all text-sm text-text-strong">{recipient.email}</span>
                {!recipient.active && (
                  <span className="shrink-0 rounded-pill bg-surface-base px-2 py-0.5 text-xs uppercase text-text-weak">
                    Inativo
                  </span>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busyId === recipient.id}
                  onClick={() => toggleActive(recipient.id, !recipient.active)}
                  className="rounded-card border border-border-subtle px-3 py-2 text-xs font-semibold text-text-body hover:bg-surface-base disabled:opacity-60"
                >
                  {recipient.active ? "Desativar" : "Ativar"}
                </button>
                <button
                  type="button"
                  disabled={busyId === recipient.id}
                  onClick={() => handleRemove(recipient.id)}
                  aria-label={`Remover e-mail ${recipient.email}`}
                  className="inline-flex items-center gap-1 rounded-card border border-border-subtle px-3 py-2 text-xs font-semibold text-red-300 hover:bg-surface-base disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
