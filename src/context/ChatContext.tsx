"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// T004 — ChatMessage type
export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
};

// T005 — ChatContext
type ChatContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <ChatContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
