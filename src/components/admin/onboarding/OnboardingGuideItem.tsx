"use client";

import { Check } from "lucide-react";

type OnboardingGuideItemProps = {
  label: string;
  completed: boolean;
  onToggle: () => void;
};

export function OnboardingGuideItem({ label, completed, onToggle }: OnboardingGuideItemProps) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-card border px-3 py-2.5 text-left text-sm transition-colors ${
          completed
            ? "border-border-subtle bg-surface-subtle text-text-weak hover:bg-surface-subtle/70"
            : "border-brand-primary/40 bg-brand-primary/5 text-text-body hover:bg-brand-primary/10"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            completed
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
              : "animate-pulse border-brand-primary/60"
          }`}
        >
          {completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
        <span className={completed ? "line-through" : ""}>{label}</span>
      </button>
    </li>
  );
}
