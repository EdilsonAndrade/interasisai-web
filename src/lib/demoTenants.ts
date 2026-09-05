// ============================================================================
// demoTenants — mapeia o slug da rota /demo/[slug] para o tenant de demonstração
// correspondente. O tenant precisa existir no painel admin com allowed_domains
// incluindo o domínio onde a demo é servida (ex.: interasisai.com.br). Os textos
// (nicho, headline, subheadline) ficam no namespace i18n "demo" — ver
// src/i18n/locales/*/demo.json — já que a página é servida nos 3 idiomas.
// ============================================================================

import type { LucideIcon } from "lucide-react";
import { Building2, GraduationCap, Stethoscope, UsersRound, UtensilsCrossed } from "lucide-react";

export interface DemoTenant {
  tenantId: string;
  Icon: LucideIcon;
}

// Chaves alinhadas com VerticalScenarioId (src/components/connect/types.ts) —
// é o que liga o botão "experimente agora" de cada aba da página
// interasisai-connect à respectiva demo em /demo/[slug].
export const DEMO_TENANTS: Record<string, DemoTenant> = {
  buffet: { tenantId: "demo-buffet", Icon: UtensilsCrossed },
  clinica: { tenantId: "demo-clinica", Icon: Stethoscope },
  escola: { tenantId: "demo-escola", Icon: GraduationCap },
  imob: { tenantId: "demo-imobiliaria", Icon: Building2 },
  rh: { tenantId: "demo-rh", Icon: UsersRound },
};

export function getDemoTenant(slug: string): DemoTenant | undefined {
  return DEMO_TENANTS[slug];
}
