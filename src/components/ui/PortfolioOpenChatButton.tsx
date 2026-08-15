"use client";

import { MessageSquareCode } from "lucide-react";
import { useChat } from "@/context/ChatContext";

type PortfolioOpenChatButtonProps = {
  label: string;
  className?: string;
};

export default function PortfolioOpenChatButton({
  label,
  className = "",
}: PortfolioOpenChatButtonProps) {
  const { open } = useChat();

  return (
    <button
      type="button"
      data-testid="portfolio-chat-demo-btn"
      onClick={open}
      className={`inline-flex items-center justify-center gap-2 rounded-button bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/60 active:scale-[0.98] ${className}`}
    >
      <MessageSquareCode className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
