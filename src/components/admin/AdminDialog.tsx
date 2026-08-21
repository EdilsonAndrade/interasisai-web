"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type AdminDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  /**
   * When true, an attempt to close the dialog (ESC, backdrop click or the
   * close button) first asks the user to confirm discarding unsaved changes
   * instead of closing immediately.
   */
  hasUnsavedChanges?: boolean;
  /**
   * When true, ESC/backdrop/close-button are ignored entirely (e.g. while a
   * submission is in flight), mirroring the existing disabled state of the
   * in-dialog action buttons.
   */
  closeDisabled?: boolean;
};

export function AdminDialog({
  open,
  title,
  children,
  onClose,
  className,
  hasUnsavedChanges = false,
  closeDisabled = false,
}: AdminDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const discardPanelRef = useRef<HTMLDivElement>(null);
  const [pendingDiscardConfirm, setPendingDiscardConfirm] = useState(false);

  // Reset any leftover discard-confirmation state when the dialog is freshly
  // (re)opened. Adjusted during render (React's documented pattern for state
  // that depends on a prop transition) rather than in an effect, since a
  // setState call in an effect body would trigger an avoidable extra render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && pendingDiscardConfirm) setPendingDiscardConfirm(false);
  }

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    previousFocus.current = document.activeElement as HTMLElement | null;
    dialog?.querySelector<HTMLElement>("[autofocus], button, input")?.focus();
    return () => {
      dialog?.close();
      previousFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!pendingDiscardConfirm) return;
    discardPanelRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [pendingDiscardConfirm]);

  if (!open) return null;

  const requestClose = () => {
    if (closeDisabled) return;
    if (hasUnsavedChanges) {
      setPendingDiscardConfirm(true);
      return;
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className={`fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-xl rounded-card border border-brand-primary/30 bg-surface-base/95 p-0 text-text-body shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm ${className ?? ""}`}
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h2 id={titleId} className="text-xl font-bold text-text-strong">{title}</h2>
        <button
          type="button"
          onClick={requestClose}
          disabled={closeDisabled}
          aria-label="Fechar"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-body hover:bg-surface-subtle hover:text-text-strong disabled:opacity-50"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
      <section className="p-5 sm:p-6">{children}</section>

      {pendingDiscardConfirm && (
        <div
          ref={discardPanelRef}
          role="alertdialog"
          aria-label="Descartar alterações?"
          className="absolute inset-0 z-10 flex flex-col justify-end gap-4 rounded-card bg-surface-base/98 p-5 backdrop-blur-sm sm:p-6"
        >
          <p className="text-sm text-text-body">
            Você tem alterações não salvas. Deseja descartá-las?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPendingDiscardConfirm(false)}
              className="inline-flex min-h-10 items-center rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle"
            >
              Continuar editando
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center rounded-card bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Descartar alterações
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
