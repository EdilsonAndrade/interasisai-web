"use client";

import { useState, useCallback } from "react";
import { getFollowUpQueue, getFollowUpQueueGlobal } from "@/services/followUpApi";
import type { FollowUpQueueEntry, FollowUpStatus, SessionOutcome } from "@/services/followUpApi.types";

interface UseFollowUpQueueResult {
  data: FollowUpQueueEntry[];
  loading: boolean;
  error: string | null;
  fetchQueue: (tenantId: string, status?: FollowUpStatus, outcome?: SessionOutcome) => Promise<void>;
  fetchQueueGlobal: (tenantId?: string, status?: FollowUpStatus, outcome?: SessionOutcome) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useFollowUpQueue(): UseFollowUpQueueResult {
  const [data, setData] = useState<FollowUpQueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState("");
  const [currentStatus, setCurrentStatus] = useState<FollowUpStatus | undefined>();
  const [currentOutcome, setCurrentOutcome] = useState<SessionOutcome | undefined>();
  const [isGlobal, setIsGlobal] = useState(false);

  const fetchQueue = useCallback(async (tenantId: string, status?: FollowUpStatus, outcome?: SessionOutcome) => {
    setLoading(true);
    setError(null);
    setCurrentTenantId(tenantId);
    setCurrentStatus(status);
    setCurrentOutcome(outcome);
    setIsGlobal(false);

    const result = await getFollowUpQueue(tenantId, status, outcome);
    if (result.ok) {
      setData(result.data.entries);
    } else {
      setError(result.message);
      setData([]);
    }
    setLoading(false);
  }, []);

  const fetchQueueGlobal = useCallback(
    async (tenantId?: string, status?: FollowUpStatus, outcome?: SessionOutcome) => {
      setLoading(true);
      setError(null);
      setCurrentTenantId(tenantId || "");
      setCurrentStatus(status);
      setCurrentOutcome(outcome);
      setIsGlobal(true);

      const result = await getFollowUpQueueGlobal(tenantId, status, outcome);
      if (result.ok) {
        setData(result.data.entries);
      } else {
        setError(result.message);
        setData([]);
      }
      setLoading(false);
    },
    []
  );

  const refetch = useCallback(() => {
    if (isGlobal) return fetchQueueGlobal(currentTenantId || undefined, currentStatus, currentOutcome);
    if (currentTenantId) return fetchQueue(currentTenantId, currentStatus, currentOutcome);
    return Promise.resolve();
  }, [fetchQueue, fetchQueueGlobal, currentTenantId, currentStatus, currentOutcome, isGlobal]);

  return { data, loading, error, fetchQueue, fetchQueueGlobal, refetch };
}
