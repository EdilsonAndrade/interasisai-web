"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { GripVertical, Maximize2, Minus } from "lucide-react";
import { useOnboardingGuideContext } from "@/context/OnboardingGuideContext";
import { ONBOARDING_STEPS } from "./onboardingSteps";
import { OnboardingGuideItem } from "./OnboardingGuideItem";

export function OnboardingGuidePanel() {
  const {
    activeTenantId,
    completedSteps,
    isMinimized,
    minimizeGuide,
    maximizeGuide,
    toggleStepComplete,
    disableGuide,
  } = useOnboardingGuideContext();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  if (!activeTenantId) return null;

  return (
    <div ref={constraintsRef} className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="onboarding-guide-bar"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={constraintsRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto fixed right-4 top-20 flex items-center gap-1 rounded-full border border-brand-primary/30 bg-surface-base/95 py-2 pl-2 pr-3 shadow-2xl backdrop-blur-xl"
          >
            <button
              type="button"
              onPointerDown={(event) => dragControls.start(event)}
              aria-label="Arrastar guia"
              className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center text-text-weak active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={maximizeGuide}
              className="flex items-center gap-2 text-xs font-semibold text-text-strong"
            >
              Guia de configuração
              <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[11px] font-bold text-brand-primary">
                {completedSteps.length}/{ONBOARDING_STEPS.length}
              </span>
            </button>
            <button
              type="button"
              onClick={maximizeGuide}
              aria-label="Maximizar guia"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-body hover:bg-surface-subtle"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        ) : (
          <motion.aside
            key="onboarding-guide-panel"
            aria-label="Guia de configuração do tenant"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={constraintsRef}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto fixed right-4 top-20 w-80 max-w-[calc(100vw-2rem)] space-y-4 rounded-card border border-brand-primary/30 bg-surface-base/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            <header className="flex items-start justify-between gap-2">
              <button
                type="button"
                onPointerDown={(event) => dragControls.start(event)}
                aria-label="Arrastar guia"
                className="flex flex-1 cursor-grab items-start gap-2 text-left active:cursor-grabbing"
              >
                <GripVertical
                  className="mt-0.5 h-4 w-4 shrink-0 text-text-weak"
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-sm font-bold text-text-strong">
                    Guia de configuração
                  </span>
                  <span className="block text-xs text-text-weak">
                    Complete os passos para deixar o tenant pronto.
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={minimizeGuide}
                  aria-label="Minimizar guia"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-body hover:bg-surface-subtle"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </header>

            <ul className="space-y-2">
              {ONBOARDING_STEPS.map((step) => (
                <OnboardingGuideItem
                  key={step.id}
                  label={step.label}
                  completed={completedSteps.includes(step.id)}
                  onToggle={() => toggleStepComplete(step.id)}
                />
              ))}
            </ul>

            <button
              type="button"
              onClick={disableGuide}
              className="w-full text-center text-xs font-semibold text-text-weak underline-offset-2 hover:text-text-body hover:underline"
            >
              Já conheço os passos — desativar guia
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
