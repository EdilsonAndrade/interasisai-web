// ============================================================================
// demoTenants — mapeia o slug da rota /demo/[slug] para o tenant de demonstração
// correspondente. O tenant precisa existir no painel admin com allowed_domains
// incluindo o domínio onde a demo é servida (ex.: interasisai.com.br).
// ============================================================================

import type { LucideIcon } from "lucide-react";
import { Building2, GraduationCap, Stethoscope, UsersRound, UtensilsCrossed } from "lucide-react";

export interface DemoTenant {
  tenantId: string;
  nicho: string;
  headline: string;
  subheadline: string;
  Icon: LucideIcon;
}

// Chaves alinhadas com VerticalScenarioId (src/components/connect/types.ts) —
// é o que liga o botão "experimente agora" de cada aba da página
// interasisai-connect à respectiva demo em /demo/[slug].
export const DEMO_TENANTS: Record<string, DemoTenant> = {
  buffet: {
    tenantId: "demo-buffet",
    nicho: "Buffet",
    headline: "Atendimento automático para o seu buffet",
    subheadline:
      "Veja como a Interasis AI responde dúvidas sobre pacotes, datas disponíveis e orçamentos em tempo real.",
    Icon: UtensilsCrossed,
  },
  clinica: {
    tenantId: "demo-clinica",
    nicho: "Clínica",
    headline: "Atendimento automático para a sua clínica",
    subheadline:
      "Veja como a Interasis AI responde dúvidas sobre convênios, agendamentos e horários em tempo real.",
    Icon: Stethoscope,
  },
  escola: {
    tenantId: "demo-escola",
    nicho: "Escola",
    headline: "Atendimento automático para a sua escola",
    subheadline:
      "Veja como a Interasis AI responde dúvidas de matrícula, mensalidades e horários em tempo real.",
    Icon: GraduationCap,
  },
  imob: {
    tenantId: "demo-imob",
    nicho: "Imobiliária",
    headline: "Atendimento automático para a sua imobiliária",
    subheadline:
      "Veja como a Interasis AI responde dúvidas sobre imóveis, condições e visitas em tempo real.",
    Icon: Building2,
  },
  rh: {
    tenantId: "demo-rh",
    nicho: "RH",
    headline: "Atendimento automático para o seu RH",
    subheadline:
      "Veja como a Interasis AI responde dúvidas sobre férias, benefícios e holerite em tempo real.",
    Icon: UsersRound,
  },
};

export function getDemoTenant(slug: string): DemoTenant | undefined {
  return DEMO_TENANTS[slug];
}
