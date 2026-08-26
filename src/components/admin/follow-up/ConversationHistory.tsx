"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { ConversationTimeline } from "./ConversationTimeline";

interface ConversationHistoryProps {
  defaultTenantId?: string;
}

const inputClass =
  "w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong outline-none focus:border-brand-primary placeholder:text-text-body/50";

export function ConversationHistory({ defaultTenantId = "" }: ConversationHistoryProps) {
  const [tenantId, setTenantId] = useState(defaultTenantId);
  const [baseThreadId, setBaseThreadId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { messages, loading, error, hasMore, fetchHistory, loadMore } = useConversationHistory();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId.trim() || !baseThreadId.trim()) return;
    setHasSearched(true);
    fetchHistory(tenantId.trim(), baseThreadId.trim());
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="rounded-card border border-border-subtle bg-surface-base/60 p-4 mb-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label htmlFor="history-tenant-id" className="block text-sm font-medium text-text-body mb-1">
              Tenant ID
            </label>
            <input
              id="history-tenant-id"
              type="text"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              placeholder="e.g., acme"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="history-thread-id" className="block text-sm font-medium text-text-body mb-1">
              Base Thread ID
            </label>
            <input
              id="history-thread-id"
              type="text"
              value={baseThreadId}
              onChange={e => setBaseThreadId(e.target.value)}
              placeholder="e.g., acme:5511999999999"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={!tenantId.trim() || !baseThreadId.trim()}
            className="rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buscar
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 rounded-card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading && messages.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-8 text-text-body">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando histórico...</span>
        </div>
      )}

      {hasSearched && !loading && messages.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-text-body">Nenhuma mensagem encontrada para essa thread</p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="rounded-card border border-border-subtle bg-surface-base/60 p-4 backdrop-blur-xl">
          <ConversationTimeline messages={messages} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
        </div>
      )}
    </div>
  );
}
