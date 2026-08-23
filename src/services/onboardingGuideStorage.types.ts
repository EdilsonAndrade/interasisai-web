// ============================================================================
// Onboarding Guide — shared types for the tenant onboarding checklist
// ============================================================================

export type OnboardingStepId =
  | "operational_prompt"
  | "institutional_prompt"
  | "chitchat_prompt"
  | "identity_guardrail"
  | "adjust_guardrails"
  | "link_tenant_prompts"
  | "knowledge_base"
  | "client_site_test";

/** Order matches spec.md FR-003. */
export const ONBOARDING_STEP_IDS: OnboardingStepId[] = [
  "operational_prompt",
  "institutional_prompt",
  "chitchat_prompt",
  "identity_guardrail",
  "adjust_guardrails",
  "link_tenant_prompts",
  "knowledge_base",
  "client_site_test",
];
