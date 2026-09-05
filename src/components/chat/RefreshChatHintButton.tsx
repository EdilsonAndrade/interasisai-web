"use client";

import { RefreshCw } from "lucide-react";

type RefreshChatHintButtonProps = {
  label: string;
};

export default function RefreshChatHintButton({ label }: RefreshChatHintButtonProps) {
  return (
    <button
      type="button"
      data-testid="demo-refresh-chat-btn"
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 rounded-button border border-border-subtle/70 bg-surface-base/60 px-4 py-2 text-sm font-medium text-text-body transition hover:bg-surface-base focus:outline-none focus:ring-2 focus:ring-brand-primary/60 active:scale-[0.98]"
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
