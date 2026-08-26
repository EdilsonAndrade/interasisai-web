"use client";

import { Loader2 } from "lucide-react";
import type { ConversationMessage } from "@/services/followUpApi.types";
import { MessageRenderer } from "./MessageRenderer";

interface ConversationTimelineProps {
  messages: ConversationMessage[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ConversationTimeline({ messages, loading, hasMore, onLoadMore }: ConversationTimelineProps) {
  if (messages.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-body">Nenhuma mensagem encontrada</p>
      </div>
    );
  }

  return (
    <div>
      {hasMore && !loading && (
        <div className="text-center mb-4">
          <button
            onClick={onLoadMore}
            className="rounded-card border border-border-subtle px-4 py-2 text-sm font-medium text-text-body hover:bg-surface-subtle transition-colors"
          >
            Carregar mensagens anteriores
          </button>
        </div>
      )}

      {loading && messages.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-3 text-text-body">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando mensagens anteriores...</span>
        </div>
      )}

      <div>
        {messages.map((message, index) => (
          <MessageRenderer key={`${message.created_at}-${index}`} message={message} />
        ))}
      </div>
    </div>
  );
}
