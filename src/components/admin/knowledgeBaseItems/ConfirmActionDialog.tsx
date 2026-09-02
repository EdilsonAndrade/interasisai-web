"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { AdminDialog } from "@/components/admin/AdminDialog";

type ConfirmActionDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  confirmingLabel: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Generic confirmation dialog reused by every destructive/irreversible
 * knowledge-base-items action (replace all, append, replace item file,
 * delete item) — FR-004.
 */
export function ConfirmActionDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmingLabel,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <AdminDialog open={open} title={title} onClose={onCancel} closeDisabled={isLoading}>
      <div className="space-y-5">
        <div className="text-sm text-text-body">{message}</div>
        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-card border border-border-subtle px-4 py-3 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoading ? confirmingLabel : confirmLabel}
          </button>
        </footer>
      </div>
    </AdminDialog>
  );
}
