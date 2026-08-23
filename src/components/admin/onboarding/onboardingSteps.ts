import type { OnboardingStepId } from "@/services/onboardingGuideStorage.types";

export type OnboardingStepDefinition = {
  id: OnboardingStepId;
  label: string;
};

/** Order matches spec.md FR-003 — a tenant needs at least one prompt before a knowledge base can exist, so that step comes last but one. */
export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  { id: "operational_prompt", label: "Cadastrar prompt operacional" },
  { id: "institutional_prompt", label: "Cadastrar prompt institucional" },
  { id: "chitchat_prompt", label: "Cadastrar prompt chitchat" },
  { id: "identity_guardrail", label: "Cadastrar guardrail de identidade" },
  { id: "adjust_guardrails", label: "Ajustar os prompts com os guardrails do tenant" },
  { id: "link_tenant_prompts", label: "Vincular o tenant a cada prompt existente" },
  { id: "knowledge_base", label: "Cadastrar a base de conhecimento" },
  { id: "client_site_test", label: "Testar no site do cliente" },
];
