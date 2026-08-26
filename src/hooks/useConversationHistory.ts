"use client";

import { useState, useCallback } from "react";
import { getConversationHistory } from "@/services/followUpApi";
import type { ConversationMessage } from "@/services/followUpApi.types";

const DEFAULT_LIMIT = 200;

interface UseConversationHistoryResult {
  messages: ConversationMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchHistory: (tenantId: string, baseThreadId: string, limit?: number) => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useConversationHistory(): UseConversationHistoryResult {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState("");
  const [currentThreadId, setCurrentThreadId] = useState("");
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
  const [oldestMessageCreatedAt, setOldestMessageCreatedAt] = useState("");

  const fetchHistory = useCallback(async (tenantId: string, baseThreadId: string, limit = DEFAULT_LIMIT) => {
    setLoading(true);
    setError(null);
    setMessages([]);
    setCurrentTenantId(tenantId);
    setCurrentThreadId(baseThreadId);
    setCurrentLimit(limit);
    setOldestMessageCreatedAt("");
    setHasMore(false);

    const result = await getConversationHistory(tenantId, baseThreadId, limit);
    if (result.ok) {
      setMessages(result.data.messages);
      if (result.data.messages.length > 0) {
        setOldestMessageCreatedAt(result.data.messages[0].created_at);
      }
      setHasMore(result.data.messages.length === limit);
    } else {
      setError(result.message);
      setMessages([]);
    }
    setLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentTenantId || !currentThreadId || !oldestMessageCreatedAt) return;

    setLoading(true);
    const result = await getConversationHistory(currentTenantId, currentThreadId, currentLimit, oldestMessageCreatedAt);
    if (result.ok) {
      setMessages(prev => [...result.data.messages, ...prev]);
      if (result.data.messages.length > 0) {
        setOldestMessageCreatedAt(result.data.messages[0].created_at);
      }
      setHasMore(result.data.messages.length === currentLimit);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, [currentTenantId, currentThreadId, currentLimit, oldestMessageCreatedAt]);

  return { messages, loading, error, hasMore, fetchHistory, loadMore };
}
