import type { ReactNode } from "react";

export type VerticalScenarioId = "buffet" | "clinica" | "escola" | "imob" | "rh";

export type VerticalScenario = {
  id: VerticalScenarioId;
  tabLabel: string;
  customerQuestion: string;
  followUpQuestion: string;
  commonReply1: string;
  commonReply2: string;
  connectReply1: string;
  connectReply2: string;
  commonVerdict: string;
  connectVerdict: string;
};

export type ConnectComparisonTableRow = {
  label: string;
  common: string;
  connect: string;
};

export type ConnectStep = {
  title: string;
  description: string;
};

export type IntegrationCategoryId = "crm" | "database" | "api" | "mcp" | "hr" | "others";

export type IntegrationCategory = {
  id: IntegrationCategoryId;
  label: string;
  description: string;
};

export type ConnectIntegrationsContent = {
  title: string;
  description: string;
  closedScope: string;
  categories: IntegrationCategory[];
  diagram: {
    nucleusLabel: string;
    ariaLabel: string;
    caption: string;
  };
};

export type ConnectPageContent = {
  metadata: {
    title: string;
    description: string;
    breadcrumbHomeLabel: string;
  };
  eyebrow: string;
  /** Rendered via `t.rich` from an i18n string with `<em>` segments — see ConnectPage's h1. */
  title: ReactNode;
  lead: string;
  comparisonLabels: {
    common: string;
    connect: string;
  };
  comparisonBadges: {
    common: string;
    connect: string;
  };
  architecture: {
    title: string;
    description: string;
    analogy: string;
    highlight: string;
  };
  comparisonTable: {
    title: string;
    rows: ConnectComparisonTableRow[];
  };
  steps: {
    title: string;
    items: ConnectStep[];
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  verticals: VerticalScenario[];
  integrations: ConnectIntegrationsContent;
};
