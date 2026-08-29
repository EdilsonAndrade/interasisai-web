// ============================================================================
// MissingPlaceholdersAlert — overlay de confirmação exibido ao salvar um
// prompt (ou uma customização de conteúdo) sem algum placeholder obrigatório
// do node_type. Reutilizado por PromptFormModal e TenantLinkSection (026).
//
// `position: fixed` (não `absolute`) de propósito: o `<dialog>` do
// AdminDialog é internamente rolável (`overflow: auto` nativo) quando o
// formulário é mais alto que a viewport, e um `position: absolute; inset-0`
// ali dentro herda o tamanho/posição da CAIXA do diálogo (não do conteúdo
// rolado) — ao rolar, o overlay se desalinha do conteúdo visível e deixa
// UI de fundo (ex.: lista de guardrails) visível por baixo, quase ilegível.
// Fixed à viewport elimina essa dependência de scroll.
// ============================================================================

"use client";

import { useEffect, useRef } from "react";

interface MissingPlaceholdersAlertProps {
  missingTokens: string[];
  onFix: () => void;
  onSaveAnyway: () => void;
}

export function MissingPlaceholdersAlert({
  missingTokens,
  onFix,
  onSaveAnyway,
}: MissingPlaceholdersAlertProps) {
  const fixButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fixButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overscroll-contain bg-black/70 p-4">
      <div
        role="alertdialog"
        aria-label="Placeholders obrigatórios ausentes"
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto overscroll-contain rounded-card border border-brand-primary/30 bg-surface-base p-5 shadow-2xl sm:p-6"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm text-text-body">
            Este conteúdo não inclui os seguintes placeholders obrigatórios para o tipo de prompt selecionado:
          </p>
          <ul className="flex flex-col gap-1 rounded-card border border-brand-primary/30 bg-surface-subtle px-3 py-2">
            {missingTokens.map((token) => (
              <li key={token}>
                <code className="text-xs font-semibold text-brand-primary">{token}</code>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-3">
          <button
            ref={fixButtonRef}
            type="button"
            onClick={onFix}
            className="inline-flex min-h-10 items-center rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Corrigir
          </button>
          <button
            type="button"
            onClick={onSaveAnyway}
            className="inline-flex min-h-10 items-center rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Salvar mesmo assim
          </button>
        </div>
      </div>
    </div>
  );
}
