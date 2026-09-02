"use client";

import type { KnowledgeBaseItem } from "@/services/pythonBackend.types";

type KnowledgeBaseItemsGridProps = {
  items: KnowledgeBaseItem[];
  onSelectItem: (itemId: string) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function KnowledgeBaseItemsGrid({ items, onSelectItem }: KnowledgeBaseItemsGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-body/70">
        Nenhum item de ingestão cadastrado para este tenant ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border-subtle">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-subtle text-xs uppercase text-text-body/70">
          <tr>
            <th scope="col" className="px-4 py-3">Origem</th>
            <th scope="col" className="px-4 py-3">Prévia do conteúdo</th>
            <th scope="col" className="px-4 py-3">Atualizado em</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectItem(item.id);
                }
              }}
              className="cursor-pointer border-t border-border-subtle hover:bg-surface-subtle/60 focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
            >
              <td className="px-4 py-3 font-semibold text-text-strong">
                {item.filename ?? "Texto colado"}
              </td>
              <td className="max-w-md truncate px-4 py-3 text-text-body">{item.content_preview}</td>
              <td className="whitespace-nowrap px-4 py-3 text-text-body/70">
                {formatDate(item.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
