// ============================================================================
// PromptPlaceholderHelp — Lista somente-leitura dos placeholders aceitos e
// um exemplo de texto bem formado para o node_type selecionado no formulário.
// ============================================================================

import { promptPlaceholderHelp } from "@/lib/promptPlaceholders";
import type { NodeType } from "@/services/promptManager.types";

interface PromptPlaceholderHelpProps {
  nodeType: NodeType;
}

export function PromptPlaceholderHelp({ nodeType }: PromptPlaceholderHelpProps) {
  const entry = promptPlaceholderHelp[nodeType];
  const requiredPlaceholders = entry.placeholders.filter((p) => p.required);

  return (
    <section
      aria-label="Placeholders aceitos para este tipo de prompt"
      className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface-base p-4"
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-text-strong">Placeholders aceitos</h3>
        <p className="text-xs text-text-weak">
          O motor de renderização descarta em silêncio qualquer placeholder ausente — sem eles, funcionalidades
          inteiras somem sem erro visível.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {requiredPlaceholders.map((placeholder) => (
          <li key={placeholder.token} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-xs font-semibold text-brand-primary">
                {placeholder.token}
              </code>
              {placeholder.required && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-red-400">
                  Obrigatório
                </span>
              )}
            </div>
            <p className="text-xs text-text-weak">{placeholder.description}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5">
        <h4 className="text-xs font-semibold text-text-strong">Exemplo de texto bem formado</h4>
        <pre className="overflow-x-auto rounded-card border border-border-subtle bg-surface-subtle px-3 py-2 font-mono text-xs text-text-body">
          <code>{entry.example}</code>
        </pre>
      </div>
    </section>
  );
}
