"use client";

import { useCallback, useState } from "react";
import {
  readActiveTenantId,
  readGuideDisabled,
  readGuideMinimized,
  readProgress,
  writeActiveTenantId,
  writeGuideDisabled,
  writeGuideMinimized,
  writeProgress,
} from "@/services/onboardingGuideStorage";
import type { OnboardingStepId } from "@/services/onboardingGuideStorage.types";

/**
 * Stand-in "tenant" used when the guide has never been pointed at a real
 * tenant yet. Lets the floating icon (and its own checklist progress) show
 * up right away as a general reminder, instead of staying hidden until a
 * tenant happens to be created or selected.
 */
const GENERAL_TENANT_ID = "__general__";

function resolveActiveTenantId(): string | null {
  if (readGuideDisabled()) return null;
  return readActiveTenantId() ?? GENERAL_TENANT_ID;
}

export function useOnboardingGuide() {
  const [isEnabled, setIsEnabled] = useState(() => !readGuideDisabled());
  const [activeTenantId, setActiveTenantId] = useState<string | null>(resolveActiveTenantId);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStepId[]>(() => {
    const tenantId = resolveActiveTenantId();
    return tenantId ? readProgress(tenantId) : [];
  });
  const [isMinimized, setIsMinimized] = useState(() => readGuideMinimized());

  /**
   * Keeps the floating guide pointed at whichever tenant is currently in
   * view (selected, being edited, etc.) without forcing the panel open —
   * that's what lets the icon stay put across pages/tenants instead of
   * only appearing right after creating a tenant.
   */
  const setActiveTenant = useCallback(
    (tenantId: string) => {
      if (!isEnabled) return;
      setActiveTenantId(tenantId);
      writeActiveTenantId(tenantId);
      setCompletedSteps(readProgress(tenantId));
    },
    [isEnabled],
  );

  const openGuide = useCallback(
    (tenantId: string) => {
      if (!isEnabled) return;
      setActiveTenantId(tenantId);
      writeActiveTenantId(tenantId);
      setCompletedSteps(readProgress(tenantId));
      setIsMinimized(false);
      writeGuideMinimized(false);
    },
    [isEnabled],
  );

  const minimizeGuide = useCallback(() => {
    setIsMinimized(true);
    writeGuideMinimized(true);
  }, []);

  const maximizeGuide = useCallback(() => {
    setIsMinimized(false);
    writeGuideMinimized(false);
  }, []);

  const toggleStepComplete = useCallback(
    (stepId: OnboardingStepId) => {
      if (!activeTenantId) return;
      setCompletedSteps((current) => {
        const next = current.includes(stepId)
          ? current.filter((id) => id !== stepId)
          : [...current, stepId];
        writeProgress(activeTenantId, next);
        return next;
      });
    },
    [activeTenantId],
  );

  const disableGuide = useCallback(() => {
    writeGuideDisabled(true);
    setIsEnabled(false);
    setActiveTenantId(null);
    writeActiveTenantId(null);
    setIsMinimized(true);
    writeGuideMinimized(true);
  }, []);

  const reEnableGuide = useCallback(() => {
    writeGuideDisabled(false);
    setIsEnabled(true);
    const tenantId = readActiveTenantId() ?? GENERAL_TENANT_ID;
    setActiveTenantId(tenantId);
    setCompletedSteps(readProgress(tenantId));
  }, []);

  return {
    isEnabled,
    activeTenantId,
    completedSteps,
    isMinimized,
    openGuide,
    setActiveTenant,
    minimizeGuide,
    maximizeGuide,
    toggleStepComplete,
    disableGuide,
    reEnableGuide,
  };
}
