"use client";

import { Loader2, Trash2 } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";

type TenantDeleteDialogProps = {
  open: boolean;
  tenantName: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function TenantDeleteDialog({ open, tenantName, isLoading, onCancel, onConfirm }: TenantDeleteDialogProps) {
  return (
    <AdminDialog open={open} title="Excluir tenant?" onClose={onCancel} closeDisabled={isLoading}>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="break-words font-semibold text-text-strong">{tenantName}</p>
          <p className="text-sm text-text-body">Esta ação não poderá ser desfeita.</p>
        </div>
        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={isLoading} onClick={onCancel} className="rounded-card border border-border-subtle px-4 py-3 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-60">Cancelar</button>
          <button type="button" disabled={isLoading} onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-card bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
            {isLoading ? "Excluindo" : "Excluir"}
          </button>
        </footer>
      </div>
    </AdminDialog>
  );
}