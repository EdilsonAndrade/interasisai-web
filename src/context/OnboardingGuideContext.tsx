"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useOnboardingGuide } from "@/hooks/useOnboardingGuide";

type OnboardingGuideContextValue = ReturnType<typeof useOnboardingGuide>;

const OnboardingGuideContext = createContext<OnboardingGuideContextValue | null>(null);

export function OnboardingGuideProvider({ children }: { children: ReactNode }) {
  const guide = useOnboardingGuide();
  return (
    <OnboardingGuideContext.Provider value={guide}>{children}</OnboardingGuideContext.Provider>
  );
}

export function useOnboardingGuideContext(): OnboardingGuideContextValue {
  const context = useContext(OnboardingGuideContext);
  if (!context) {
    throw new Error("useOnboardingGuideContext must be used within OnboardingGuideProvider");
  }
  return context;
}
