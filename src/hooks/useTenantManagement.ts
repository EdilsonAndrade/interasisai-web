"use client";

import { useEffect, useRef, useState } from "react";
import {
  createTenant,
  deleteTenant,
  getTenantById,
  updateTenant,
  type Tenant,
  type TenantCreateInput,
  type TenantFieldErrors,
  type TenantOperationFailure,
  type TenantWriteInput,
} from "@/services";

export type TenantOperation = "create" | "lookup" | "update" | "delete";

export function useTenantManagement() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [operation, setOperation] = useState<TenantOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TenantFieldErrors>();
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

  const create = async (input: TenantCreateInput) => {
    const request = begin("create");
    if (!request) return false;
    const result = await createTenant(input, request.signal);
    if (!result.ok) return fail(request.id, result);
    const refreshed = await getTenantById(result.tenant.id, request.signal);
    if (!finish(request.id)) return false;
    setTenant(refreshed.ok ? refreshed.tenant : result.tenant);
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
    create,
    lookup,
    update,
    remove,
    clearFeedback,
  };
}