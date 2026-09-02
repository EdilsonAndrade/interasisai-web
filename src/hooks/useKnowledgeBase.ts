// ============================================================================
// useKnowledgeBase — Hook: view/create/edit a tenant's knowledge base
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deleteKnowledgeBase, getKnowledgeBase, saveKnowledgeBase } from "@/services/pythonBackend";

type UseKnowledgeBaseReturn = {
  content: string | null;
  updatedAt: string | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  fieldErrors?: { content?: string };
  save: (content: string) => Promise<boolean>;
  remove: () => Promise<boolean>;
  refresh: () => Promise<void>;
};

export function useKnowledgeBase(tenantId: string): UseKnowledgeBaseReturn {
  const [content, setContent] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ content?: string } | undefined>(undefined);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    // Invalidate any in-flight request from a previous tenant/call (FR-023).
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    setFieldErrors(undefined);

    const result = await getKnowledgeBase(tenantId);
    if (requestIdRef.current !== requestId) return; // stale — superseded by a newer call

    setLoading(false);

    if (result.ok) {
      setContent(result.data.content);
      setUpdatedAt(result.data.updated_at);
      return;
    }

    setContent(null);
    setUpdatedAt(null);
    setError(result.message);
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (draft: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setFieldErrors(undefined);

      const result = await saveKnowledgeBase(tenantId, draft);

      setSaving(false);

      if (result.ok) {
        setContent(result.data.content);
        setUpdatedAt(result.data.updated_at);
        return true;
      }

      setError(result.message);
      setFieldErrors(result.fieldErrors);
      return false;
    },
    [tenantId],
  );

  const remove = useCallback(async (): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    setFieldErrors(undefined);

    const result = await deleteKnowledgeBase(tenantId);

    setDeleting(false);

    if (result.ok) {
      setContent(null);
      setUpdatedAt(null);
      return true;
    }

    setError(result.message);
    return false;
  }, [tenantId]);

  return { content, updatedAt, loading, saving, deleting, error, fieldErrors, save, remove, refresh: load };
}
