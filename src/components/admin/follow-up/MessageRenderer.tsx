"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { ConversationMessage } from "@/services/followUpApi.types";
import { formatDate } from "@/lib/followUpFormatters";

interface MessageRendererProps {
  message: ConversationMessage;
}

export function MessageRenderer({ message }: MessageRendererProps) {
  const isHuman = message.role === "human";

  return (
    <div className={`flex ${isHuman ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-card px-4 py-2 ${
          isHuman ? "bg-surface-subtle text-text-strong" : "bg-brand-primary text-text-inverse"
        }`}
      >
        <p className={`text-xs font-medium mb-1 ${isHuman ? "text-text-body/70" : "text-white/70"}`}>
          {isHuman ? "Cliente" : "Atendente"} · {formatDate(message.created_at)}
        </p>
        <div className="text-sm [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
