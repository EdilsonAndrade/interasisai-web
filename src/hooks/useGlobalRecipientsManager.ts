// ============================================================================
// useGlobalRecipientsManager — Hook: CRUD dos e-mails internos da InterasisAI
// que recebem todo alerta de bloqueio (100%) de qualquer tenant
// (/global-notification-recipients/), para a tela de Configurações Globais (EDI-63).
// ============================================================================

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createGlobalRecipient,
  deleteGlobalRecipient,
  listGlobalRecipients,
  updateGlobalRecipient,
} from "@/services/pythonBackend";
import type { GlobalRecipient } from "@/services/pythonBackend.types";

type UseGlobalRecipientsManagerReturn = {
  recipients: GlobalRecipient[];
  loading: boolean;
  error: string | null;
  list: () => Promise<void>;
  create: (email: string) => Promise<GlobalRecipient>;
  update: (id: number, active: boolean) => Promise<GlobalRecipient>;
  remove: (id: number) => Promise<void>;
};

export function useGlobalRecipientsManager(): UseGlobalRecipientsManagerReturn {
  const [recipients, setRecipients] = useState<GlobalRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listGlobalRecipients();
    setLoading(false);
    if (result.ok) {
      setRecipients(result.items);
      return;
    }
    setError(result.message);
  }, []);

  useEffect(() => {
    list();
  }, [list]);

  const create = useCallback(async (email: string): Promise<GlobalRecipient> => {
    const result = await createGlobalRecipient(email);
    if (!result.ok) throw result;
    setRecipients((current) => [...current, result.recipient]);
    return result.recipient;
  }, []);

  const update = useCallback(async (id: number, active: boolean): Promise<GlobalRecipient> => {
    const result = await updateGlobalRecipient(id, active);
    if (!result.ok) throw result;
    setRecipients((current) =>
      current.map((item) => (item.id === id ? result.recipient : item)),
    );
    return result.recipient;
  }, []);

  const remove = useCallback(async (id: number): Promise<void> => {
    const result = await deleteGlobalRecipient(id);
    if (!result.ok) throw result;
    setRecipients((current) => current.filter((item) => item.id !== id));
  }, []);

  return { recipients, loading, error, list, create, update, remove };
}
