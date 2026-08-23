import { Info } from "lucide-react";

/**
 * Non-blocking reminder shown before creating a tenant — never intercepts or
 * disables the submit action (US2, spec.md).
 */
export function OnboardingPrerequisiteNotice() {
  return (
    <p className="flex items-start gap-2 rounded-card border border-brand-primary/20 bg-brand-primary/5 px-3 py-2.5 text-xs text-text-weak">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
      Antes de continuar: o prompt inicial e a base de conhecimento deste cliente já
      existem? A base de conhecimento só pode ser cadastrada depois de o tenant ter ao
      menos um prompt.
    </p>
  );
}
