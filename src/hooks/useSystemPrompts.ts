// ============================================================================
// useSystemPrompts — Hook: list, select, save and rollback system prompts
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchSystemPrompts,
  rollbackSystemPrompt,
  updateSystemPrompt,
} from "@/services/systemPrompts";
import type { SystemPrompt } from "@/services/systemPrompts.types";

type ListState = "idle" | "loading" | "success" | "error";

interface UseSystemPromptsReturn {
  prompts: SystemPrompt[];
  state: ListState;
  error: string | null;
  selectedPromptKey: string | null;
  selectPrompt: (promptKey: string) => void;
  refresh: () => Promise<void>;
  savingKey: string | null;
  rollingBackKey: string | null;
  savePrompt: (promptKey: string, conteudo: string) => Promise<boolean>;
  rollbackPrompt: (promptKey: string) => Promise<boolean>;
}

export function useSystemPrompts(): UseSystemPromptsReturn {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [state, setState] = useState<ListState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedPromptKey, setSelectedPromptKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [rollingBackKey, setRollingBackKey] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("loading");
    setError(null);

    const result = await fetchSystemPrompts(controller.signal);
    if (controller.signal.aborted) return;

    if (result.ok) {
      setPrompts(result.data);
      setState("success");
      setSelectedPromptKey((current) => current ?? result.data[0]?.prompt_key ?? null);
    } else {
      setError(result.message);
      setState("error");
    }
  }, []);

  const selectPrompt = useCallback((promptKey: string) => {
    setSelectedPromptKey(promptKey);
  }, []);

  const savePrompt = useCallback(
    async (promptKey: string, conteudo: string): Promise<boolean> => {
      const trimmed = conteudo.trim();
      if (!trimmed) {
        toast.error("O conteúdo do prompt não pode ficar vazio.");
        return false;
      }
      if (savingKey) return false;

      setSavingKey(promptKey);
      const result = await updateSystemPrompt(promptKey, { conteudo: trimmed });
      setSavingKey(null);

      if (result.ok) {
        setPrompts((current) =>
          current.map((p) => (p.prompt_key === promptKey ? result.data : p)),
        );
        toast.success("Prompt salvo com sucesso.");
        return true;
      }
      toast.error(result.message);
      return false;
    },
    [savingKey],
  );

  const rollbackPrompt = useCallback(
    async (promptKey: string): Promise<boolean> => {
      if (rollingBackKey) return false;

      setRollingBackKey(promptKey);
      const result = await rollbackSystemPrompt(promptKey);
      setRollingBackKey(null);

      if (result.ok) {
        setPrompts((current) =>
          current.map((p) => (p.prompt_key === promptKey ? result.data : p)),
        );
        toast.success("Prompt revertido para a versão anterior.");
        return true;
      }
      toast.error(result.message);
      return false;
    },
    [rollingBackKey],
  );

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return {
    prompts,
    state,
    error,
    selectedPromptKey,
    selectPrompt,
    refresh,
    savingKey,
    rollingBackKey,
    savePrompt,
    rollbackPrompt,
  };
}
