// ============================================================================
// useGuardrails — Hook: CRUD operations for guardrails
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchGuardrails,
  createGuardrail as createGuardrailApi,
  updateGuardrail as updateGuardrailApi,
  deleteGuardrail as deleteGuardrailApi,
} from "@/services/promptManager";
import type { Guardrail, GuardrailCreateInput, GuardrailUpdateInput } from "@/services/promptManager.types";

type ListState = "idle" | "loading" | "success" | "error" | "empty";

interface UseGuardrailsReturn {
  guardrails: Guardrail[];
  state: ListState;
  error: string | null;
  refreshGuardrails: () => Promise<void>;
  addGuardrail: (input: GuardrailCreateInput) => Promise<boolean>;
  editGuardrail: (id: string, input: GuardrailUpdateInput) => Promise<boolean>;
  removeGuardrail: (id: string) => Promise<boolean>;
}

export function useGuardrails(): UseGuardrailsReturn {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [state, setState] = useState<ListState>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refreshGuardrails = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("loading");
    setError(null);

    const result = await fetchGuardrails(controller.signal);

    if (controller.signal.aborted) return;

    if (result.ok) {
      setGuardrails(result.data);
      setState(result.data.length === 0 ? "empty" : "success");
    } else {
      setError(result.message);
      setState("error");
    }
  }, []);

  const addGuardrail = useCallback(
    async (input: GuardrailCreateInput): Promise<boolean> => {
      const result = await createGuardrailApi(input);
      if (result.ok) {
        toast.success("Guardrail criado com sucesso");
        await refreshGuardrails();
        return true;
      }
      if (result.status === 409) {
        toast.error("Este guardrail está vinculado a prompts ativos. Remova os vínculos antes de excluir.");
      } else {
        toast.error(result.message);
      }
      return false;
    },
    [refreshGuardrails],
  );

  const editGuardrail = useCallback(
    async (id: string, input: GuardrailUpdateInput): Promise<boolean> => {
      const result = await updateGuardrailApi(id, input);
      if (result.ok) {
        toast.success("Guardrail atualizado com sucesso");
        await refreshGuardrails();
        return true;
      }
      toast.error(result.message);
      return false;
    },
    [refreshGuardrails],
  );

  const removeGuardrail = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await deleteGuardrailApi(id);
      if (result.ok) {
        toast.success("Guardrail excluído com sucesso");
        await refreshGuardrails();
        return true;
      }
      if (result.status === 409) {
        toast.error("Este guardrail está vinculado a prompts ativos. Remova os vínculos antes de excluir.");
      } else {
        toast.error(result.message);
      }
      return false;
    },
    [refreshGuardrails],
  );

  useEffect(() => {
    refreshGuardrails();
    return () => abortRef.current?.abort();
  }, [refreshGuardrails]);

  return {
    guardrails,
    state,
    error,
    refreshGuardrails,
    addGuardrail,
    editGuardrail,
    removeGuardrail,
  };
}
