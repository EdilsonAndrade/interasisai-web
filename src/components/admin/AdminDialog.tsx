"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type AdminDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export function AdminDialog({ open, title, children, onClose, className }: AdminDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[autofocus], button, input")?.focus();
    return () => previousFocus.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      open
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-xl rounded-card border border-brand-primary/30 bg-surface-base/95 p-0 text-text-body shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm ${className ?? ""}`}
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h2 id={titleId} className="text-xl font-bold text-text-strong">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-full p-2 text-text-body hover:bg-surface-subtle hover:text-text-strong"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
      <section className="p-5 sm:p-6">{children}</section>
    </dialog>
  );
}