// ============================================================================
// MarkdownEditorCustom — Custom Markdown editor with 3 modes
// Modes: edit (textarea), preview (react-markdown + rehype-sanitize), split (both)
// ============================================================================

"use client";

import { Code, Columns, Eye } from "lucide-react";
import { Children, isValidElement, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/cn";

export type EditorMode = "edit" | "preview" | "split";

interface MarkdownEditorCustomProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const MODES: { id: EditorMode; label: string; icon: typeof Code }[] = [
  { id: "edit", label: "Edição", icon: Code },
  { id: "preview", label: "Visualização", icon: Eye },
  { id: "split", label: "Lado a Lado", icon: Columns },
];

export function MarkdownEditorCustom({
  value,
  onChange,
  label,
  className,
}: MarkdownEditorCustomProps) {
  const [mode, setMode] = useState<EditorMode>("edit");
  const textareaId = useId();

  const showEditor = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Mode Toggle & Label */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-text-strong">
            {label}
          </label>
        )}
        <div
          className="flex gap-0.5 rounded-card border border-border-subtle bg-surface-subtle p-0.5"
          role="group"
          aria-label="Modo do editor"
        >
          {MODES.map(({ id, label: modeLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                mode === id
                  ? "bg-brand-primary text-text-inverse"
                  : "text-text-weak hover:text-text-body",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {modeLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview */}
      <div
        className={cn(
          "gap-3",
          mode === "split" ? "grid grid-cols-2" : "flex flex-col",
        )}
      >
        {showEditor && (
          <textarea
            id={textareaId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-[240px] w-full resize-y overflow-y-auto rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 font-mono text-sm text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
            placeholder="Digite o conteúdo em Markdown..."
            aria-label={label ?? "Conteúdo Markdown"}
          />
        )}

        {showPreview && (
          <div
            className={cn(
              "h-[240px] w-full overflow-x-auto overflow-y-auto rounded-card border border-border-subtle bg-surface-base px-4 py-3",
              mode === "split" ? "prose-sm" : "prose-sm max-w-none",
            )}
          >
            {value.trim() ? (
              <div className="prose prose-sm max-w-none prose-headings:text-text-strong prose-p:text-text-body prose-strong:text-text-strong prose-a:text-brand-primary prose-code:rounded prose-code:bg-surface-subtle prose-code:px-1 prose-code:text-sm prose-pre:bg-surface-subtle prose-pre:text-text-body">
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                    components={{
                      li: ({ children, ...props }) => {
                        const flat = Children.map(children, (child) =>
                          isValidElement(child) && child.type === "p" ? (child.props as Record<string, unknown>).children : child
                        ) as React.ReactNode[];
                        return <li {...props}>{flat}</li>;
                      },
                    }}
                  >
                    {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-text-weak italic">
                Nenhum conteúdo para exibir.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
