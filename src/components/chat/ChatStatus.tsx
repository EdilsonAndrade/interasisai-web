"use client";

import { useState, useEffect } from "react";

const STATUS_MESSAGES = [
  "Analisando sua empresa...",
  "Consultando especialistas...",
  "Preparando sua resposta...",
] as const;

export default function ChatStatus() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-card rounded-bl-sm bg-surface-subtle px-4 py-2">
      <span
        className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-primary animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="text-sm text-text-body">{STATUS_MESSAGES[index]}</span>
    </div>
  );
}
