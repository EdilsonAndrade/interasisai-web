// ============================================================================
// useKnowledgeBaseItems — Hook: list/upload/edit/replace/delete knowledge
// base items for a tenant (EDI-39 — ingestão por múltiplos arquivos)
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteKnowledgeBaseItem,
  getKnowledgeBaseItem,
  listKnowledgeBaseItems,
  replaceKnowledgeBaseItemFile,
  updateKnowledgeBaseItemContent,
  uploadKnowledgeBaseItems,
} from "@/services/pythonBackend";
import type {
  KnowledgeBaseDuplicateResolution,
  KnowledgeBaseItem,
  KnowledgeBaseItemDetail,
  KnowledgeBaseUploadConflict,
  KnowledgeBaseUploadMode,
} from "@/services/pythonBackend.types";

type UseKnowledgeBaseItemsReturn = {
  items: KnowledgeBaseItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  uploading: boolean;
  uploadError: string | null;
  conflicts: KnowledgeBaseUploadConflict[] | null;
  uploadItems: (input: {
    files?: File[];
    texts?: string[];
    mode: KnowledgeBaseUploadMode;
  }) => Promise<boolean>;
  resolveDuplicatesAndRetry: (
    resolutions: KnowledgeBaseDuplicateResolution[],
  ) => Promise<boolean>;
  clearConflicts: () => void;

  selectedItem: KnowledgeBaseItemDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  getItemDetail: (itemId: string) => Promise<void>;
  clearSelectedItem: () => void;

  replacingFile: boolean;
  replaceItemFile: (itemId: string, file: File) => Promise<boolean>;

  deletingItem: boolean;
  deleteItem: (itemId: string) => Promise<boolean>;

  savingContent: boolean;
  updateItemContent: (itemId: string, content: string) => Promise<boolean>;
};

export function useKnowledgeBaseItems(tenantId: string): UseKnowledgeBaseItemsReturn {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<KnowledgeBaseUploadConflict[] | null>(null);
  const lastUploadRef = useRef<{ files?: File[]; texts?: string[]; mode: KnowledgeBaseUploadMode } | null>(
    null,
  );

  const [selectedItem, setSelectedItem] = useState<KnowledgeBaseItemDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [replacingFile, setReplacingFile] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const result = await listKnowledgeBaseItems(tenantId);
    if (requestIdRef.current !== requestId) return; // stale — tenant changed

    setLoading(false);
    if (result.ok) {
      setItems(result.data);
      return;
    }
    setError(result.message);
  }, [tenantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadItems = useCallback(
    async (input: { files?: File[]; texts?: string[]; mode: KnowledgeBaseUploadMode }): Promise<boolean> => {
      setUploading(true);
      setUploadError(null);
      setConflicts(null);
      lastUploadRef.current = input;

      const result = await uploadKnowledgeBaseItems(tenantId, input);
      setUploading(false);

      if (result.ok) {
        lastUploadRef.current = null;
        await refresh();
        return true;
      }

      if ("conflicts" in result) {
        setConflicts(result.conflicts);
        return false;
      }

      setUploadError(result.message);
      return false;
    },
    [tenantId, refresh],
  );

  const resolveDuplicatesAndRetry = useCallback(
    async (resolutions: KnowledgeBaseDuplicateResolution[]): Promise<boolean> => {
      const pending = lastUploadRef.current;
      if (!pending) return false;

      setUploading(true);
      setUploadError(null);

      const result = await uploadKnowledgeBaseItems(tenantId, {
        ...pending,
        duplicateResolutions: resolutions,
      });
      setUploading(false);

      if (result.ok) {
        lastUploadRef.current = null;
        setConflicts(null);
        await refresh();
        return true;
      }

      if ("conflicts" in result) {
        setConflicts(result.conflicts);
        return false;
      }

      setUploadError(result.message);
      return false;
    },
    [tenantId, refresh],
  );

  const clearConflicts = useCallback(() => {
    setConflicts(null);
    lastUploadRef.current = null;
  }, []);

  const getItemDetail = useCallback(
    async (itemId: string) => {
      setDetailLoading(true);
      setDetailError(null);

      const result = await getKnowledgeBaseItem(tenantId, itemId);
      setDetailLoading(false);

      if (result.ok) {
        setSelectedItem(result.data);
        return;
      }
      setDetailError(result.message);
    },
    [tenantId],
  );

  const clearSelectedItem = useCallback(() => {
    setSelectedItem(null);
    setDetailError(null);
  }, []);

  const replaceItemFile = useCallback(
    async (itemId: string, file: File): Promise<boolean> => {
      setReplacingFile(true);
      setDetailError(null);

      const result = await replaceKnowledgeBaseItemFile(tenantId, itemId, file);
      setReplacingFile(false);

      if (result.ok) {
        setSelectedItem(result.data);
        setItems((current) =>
          current.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  filename: result.data.filename,
                  content_preview: result.data.content.slice(0, 1000),
                  content_length: result.data.content.length,
                  updated_at: result.data.updated_at,
                }
              : item,
          ),
        );
        return true;
      }

      setDetailError(result.message);
      return false;
    },
    [tenantId],
  );

  const deleteItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      setDeletingItem(true);
      setDetailError(null);

      const result = await deleteKnowledgeBaseItem(tenantId, itemId);
      setDeletingItem(false);

      if (result.ok) {
        setItems((current) => current.filter((item) => item.id !== itemId));
        setSelectedItem((current) => (current?.id === itemId ? null : current));
        return true;
      }

      setDetailError(result.message);
      return false;
    },
    [tenantId],
  );

  const updateItemContent = useCallback(
    async (itemId: string, content: string): Promise<boolean> => {
      setSavingContent(true);
      setDetailError(null);

      const result = await updateKnowledgeBaseItemContent(tenantId, itemId, content);
      setSavingContent(false);

      if (result.ok) {
        setSelectedItem(result.data);
        setItems((current) =>
          current.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  content_preview: result.data.content.slice(0, 1000),
                  content_length: result.data.content.length,
                  updated_at: result.data.updated_at,
                }
              : item,
          ),
        );
        return true;
      }

      setDetailError(result.message);
      return false;
    },
    [tenantId],
  );

  return {
    items,
    loading,
    error,
    refresh,
    uploading,
    uploadError,
    conflicts,
    uploadItems,
    resolveDuplicatesAndRetry,
    clearConflicts,
    selectedItem,
    detailLoading,
    detailError,
    getItemDetail,
    clearSelectedItem,
    replacingFile,
    replaceItemFile,
    deletingItem,
    deleteItem,
    savingContent,
    updateItemContent,
  };
}
