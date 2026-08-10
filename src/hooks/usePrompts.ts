// ============================================================================
// usePrompts — Hook: CRUD operations for prompts + guardrails for N:N selector
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchPrompts,
  createPrompt as createPromptApi,
  updatePrompt as updatePromptApi,
  deletePrompt as deletePromptApi,
  fetchGuardrails,
} from "@/services/promptManager";
import type { Guardrail, Prompt, PromptCreateInput, PromptUpdateInput } from "@/services/promptManager.types";

type ListState = "idle" | "loading" | "success" | "error" | "empty";

interface UsePromptsReturn {
  prompts: Prompt[];
  guardrails: Guardrail[];
  state: ListState;
  error: string | null;
  refreshPrompts: () => Promise<void>;
  addPrompt: (input: PromptCreateInput) => Promise<boolean>;
  editPrompt: (id: string, input: PromptUpdateInput) => Promise<boolean>;
  removePrompt: (id: string) => Promise<boolean>;
}

export function usePrompts(): UsePromptsReturn {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [state, setState] = useState<ListState>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadGuardrails = useCallback(async () => {
    const result = await fetchGuardrails();
    if (result.ok) {
      setGuardrails(result.data);
    }
  }, []);

  const refreshPrompts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("loading");
    setError(null);

    const result = await fetchPrompts(controller.signal);

    if (controller.signal.aborted) return;

    if (result.ok) {
      setPrompts(result.data);
      setState(result.data.length === 0 ? "empty" : "success");
    } else {
      setError(result.message);
      setState("error");
    }
  }, []);

  const addPrompt = useCallback(
    async (input: PromptCreateInput): Promise<boolean> => {
      const result = await createPromptApi(input);
      if (result.ok) {
        toast.success("Prompt criado com sucesso");
        await refreshPrompts();
        return true;
      }
      toast.error(result.message);
      return false;
    },
    [refreshPrompts],
  );

  const editPrompt = useCallback(
    async (id: string, input: PromptUpdateInput): Promise<boolean> => {
      const result = await updatePromptApi(id, input);
      if (result.ok) {
        toast.success("Prompt atualizado com sucesso");
        await refreshPrompts();
        return true;
      }
      toast.error(result.message);
      return false;
    },
    [refreshPrompts],
  );

  const removePrompt = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await deletePromptApi(id);
      if (result.ok) {
        toast.success("Prompt excluído com sucesso");
        await refreshPrompts();
        return true;
      }
      if (result.status === 409) {
        toast.error("Operação conflitante. Verifique os vínculos.");
      } else {
        toast.error(result.message);
      }
      return false;
    },
    [refreshPrompts],
  );

  useEffect(() => {
    refreshPrompts();
    loadGuardrails();
    return () => abortRef.current?.abort();
  }, [refreshPrompts, loadGuardrails]);

  return {
    prompts,
    guardrails,
    state,
    error,
    refreshPrompts,
    addPrompt,
    editPrompt,
    removePrompt,
  };
}
