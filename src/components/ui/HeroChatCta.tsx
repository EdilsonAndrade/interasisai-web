"use client";

import { MessageCircle } from "lucide-react";

import { useChat } from "@/context/ChatContext";

export default function HeroChatCta() {
  const { open } = useChat();

  return (
    <button
      type="button"
      data-testid="hero-chat-cta"
      onClick={open}
      className="inline-flex items-center gap-2.5 rounded-button bg-brand-primary px-5 py-2.5 text-sm font-bold text-text-inverse shadow-floating ring-1 ring-white/20 transition-all hover:bg-brand-primary-hover hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span>Fale conosco 24/7</span>
    </button>
  );
}
