"use client";

import { Trash2 } from "lucide-react";

type DeleteActionProps = {
  onClick: () => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export function DeleteAction({ onClick, label = "Excluir", ariaLabel, disabled }: DeleteActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400/80 underline-offset-2 transition-colors hover:text-red-400 hover:underline disabled:pointer-events-none disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}
