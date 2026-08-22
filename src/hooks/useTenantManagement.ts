"use client";

import { useEffect, useRef, useState } from "react";
import {
  createTenant,
  deleteTenant,
  getTenantById,
  updateTenant,
  type Tenant,
  type TenantFieldErrors,
  type TenantOperationFailure,
  type TenantWriteInput,
} from "@/services";
import { createPrompt } from "@/services/promptManager";
import type { PromptCreateInput } from "@/services/promptManager.types";

export type TenantOperation = "create" | "lookup" | "update" | "delete";

export type TenantCreateBase = TenantWriteInput & { tenant_id: string };

export type TenantCreateIntent =
  | { mode: "existing"; prompt_id: string }
  | { mode: "new"; prompt: PromptCreateInput };

export function useTenantManagement() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [operation, setOperation] = useState<TenantOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TenantFieldErrors>();
  const [pendingPromptId, setPendingPromptId] = useState<string | null>(null);
  const active = useRef(false);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const begin = (nextOperation: TenantOperation) => {
    if (active.current) return null;
    active.current = true;
    controller.current = new AbortController();
    requestId.current += 1;
    setOperation(nextOperation);
    setError(null);
    setFeedback(null);
    setFieldErrors(undefined);
    return { id: requestId.current, signal: controller.current.signal };
  };

  const finish = (id: number) => {
    if (id !== requestId.current) return false;
    active.current = false;
    setOperation(null);
    return true;
  };

  const fail = (id: number, result: TenantOperationFailure) => {
    if (!finish(id)) return false;
    setError(result.message);
    setFieldErrors(result.fieldErrors);
    return false;
  };

  const create = async (base: TenantCreateBase, intent: TenantCreateIntent) => {
    const request = begin("create");
    if (!request) return false;
    setPendingPromptId(null);

    let promptId: string;
    if (intent.mode === "new") {
      const promptResult = await createPrompt(intent.prompt, request.signal);
      if (!promptResult.ok) {
        if (!finish(request.id)) return false;
        setError(promptResult.message);
        return false;
      }
      promptId = promptResult.data.id;
      // Passo 1 concluído: guarda o id para que uma nova tentativa (após falha
      // do passo 2) reaproveite este prompt em vez de criar um segundo (FR-010).
      setPendingPromptId(promptId);
    } else {
      promptId = intent.prompt_id;
    }

    const result = await createTenant({ ...base, prompt_id: promptId }, request.signal);
    if (!result.ok) {
      if (!finish(request.id)) return false;
      setError(
        intent.mode === "new"
          ? `${result.message} O prompt criado permanece disponível na biblioteca para a nova tentativa.`
          : result.message,
      );
      setFieldErrors(result.fieldErrors);
      return false;
    }

    const refreshed = await getTenantById(result.tenant.id, request.signal);
    if (!finish(request.id)) return false;
    setTenant(refreshed.ok ? refreshed.tenant : result.tenant);
    setPendingPromptId(null);
    setFeedback("Tenant cadastrado com sucesso");
    return true;
  };

  const lookup = async (tenantId: string) => {
    const request = begin("lookup");
    if (!request) return false;
    const result = await getTenantById(tenantId, request.signal);
    if (!result.ok) {
      if (finish(request.id)) setTenant(null);
      setError(result.message);
      return false;
    }
    if (!finish(request.id)) return false;
    setTenant(result.tenant);
    return true;
  };

  const update = async (input: TenantWriteInput) => {
    if (!tenant) return false;
    const request = begin("update");
    if (!request) return false;
    const result = await updateTenant(tenant.id, input, request.signal);
    if (!result.ok) return fail(request.id, result);
    const refreshed = await getTenantById(result.tenant.id, request.signal);
    if (!finish(request.id)) return false;
    setTenant(refreshed.ok ? refreshed.tenant : result.tenant);
    setFeedback("Tenant atualizado com sucesso");
    return true;
  };

  const remove = async () => {
    if (!tenant) return false;
    const request = begin("delete");
    if (!request) return false;
    const result = await deleteTenant(tenant.id, request.signal);
    if (!result.ok) return fail(request.id, result);
    if (!finish(request.id)) return false;
    setTenant(null);
    setFeedback("Tenant excluído com sucesso");
    return true;
  };

  const clearFeedback = () => {
    setError(null);
    setFeedback(null);
    setFieldErrors(undefined);
  };

  return {
    tenant,
    operation,
    isLoading: operation !== null,
    error,
    feedback,
    fieldErrors,
    pendingPromptId,
    create,
    lookup,
    update,
    remove,
    clearFeedback,
  };
}