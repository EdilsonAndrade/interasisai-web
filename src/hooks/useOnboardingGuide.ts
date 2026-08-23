"use client";

import { useCallback, useState } from "react";
import {
  readGuideDisabled,
  readProgress,
  writeGuideDisabled,
  writeProgress,
} from "@/services/onboardingGuideStorage";
import type { OnboardingStepId } from "@/services/onboardingGuideStorage.types";

export function useOnboardingGuide() {
  const [isEnabled, setIsEnabled] = useState(() => !readGuideDisabled());
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStepId[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const openGuide = useCallback(
    (tenantId: string) => {
      if (!isEnabled) return;
      setActiveTenantId(tenantId);
      setCompletedSteps(readProgress(tenantId));
      setIsMinimized(false);
    },
    [isEnabled],
  );

  const closeGuide = useCallback(() => {
    setActiveTenantId(null);
    setIsMinimized(false);
  }, []);

  const minimizeGuide = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeGuide = useCallback(() => {
    setIsMinimized(false);
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
    setIsMinimized(false);
  }, []);

  const reEnableGuide = useCallback(() => {
    writeGuideDisabled(false);
    setIsEnabled(true);
  }, []);

  return {
    isEnabled,
    activeTenantId,
    completedSteps,
    isMinimized,
    openGuide,
    closeGuide,
    minimizeGuide,
    maximizeGuide,
    toggleStepComplete,
    disableGuide,
    reEnableGuide,
  };
}
