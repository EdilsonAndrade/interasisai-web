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
     className="inline-flex items-center  gap-2.5 justify-center rounded-button bg-brand-primary px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-brand-primary-hover"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span>Fale conosco 24/7</span>
    </button>
  );
}
