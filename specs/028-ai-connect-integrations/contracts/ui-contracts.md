# UI Contracts — InterasisAI Connect: Posicionamento de Integrações e Expansibilidade

**Feature**: `specs/028-ai-connect-integrations` | **Date**: 2026-08-30

Esta feature não expõe APIs ou interfaces externas; os contratos abaixo são os contratos de UI internos (props TypeScript + chaves i18n) que os componentes devem honrar. Seguem o mesmo formato do `contracts/ui-contracts.md` da spec 027.

## C1. `ConnectPageContent.integrations` (extensão de `src/components/connect/types.ts`)

```ts
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
  // ...campos existentes (metadata, eyebrow, title, lead, comparisonLabels,
  // comparisonBadges, architecture, comparisonTable, steps, cta, verticals)
  integrations: ConnectIntegrationsContent; // NOVO — obrigatório
};
```

Regras:
- `integrations` é **obrigatório** (não opcional) — a página sempre monta a seção; testes e tipos falham se ausente.
- `categories` tem exatamente 6 itens, ids fixos `crm | database | api | mcp | hr | others`, ordem estável (a ordem do array define a exibição).

## C2. `ConnectIntegrationDiagram` (novo componente)

```ts
type ConnectIntegrationDiagramProps = {
  categories: IntegrationCategory[];
  nucleusLabel: string;
  ariaLabel: string;
  caption: string;
};
```

Contrato de renderização:
- Wrapper com `role="img"` e `aria-label={ariaLabel}`.
- Núcleo central com `nucleusLabel`; um nó por categoria com `label` visível e `description` como texto auxiliar (title/legenda ou tooltip visual simples).
- Sempre presente no DOM (ambos os estados): lista `ul` com `sr-only` contendo `nucleusLabel` + todos os `label`s.
- Estado animado: setas (`motion.path`) em loop (`repeat: Infinity`, easing linear, duração ~2s); estado estático (quando `useReducedMotion() === true`): mesmas setas, desenhadas completas, sem animação.
- Responsivo: overlay SVG de setas visível apenas em `md:`+; abaixo disso, nós em grade (2 colunas) com conector vertical estático; sem rolagem horizontal.

## C3. Chaves i18n — `connect.json` (3 idiomas: pt-BR, en, es)

```jsonc
{
  // ...chaves existentes de 027
  "integrations": {
    "title": "…",            // h2 da seção
    "description": "…",      // parágrafo acessível
    "closedScope": "…",      // parágrafo do projeto de escopo fechado
    "categories": [
      { "id": "crm",      "label": "CRM",               "description": "…" },
      { "id": "database", "label": "Base de dados",     "description": "…" },
      { "id": "api",      "label": "API",               "description": "…" },
      { "id": "mcp",      "label": "MCP",               "description": "…" },
      { "id": "hr",       "label": "Sistemas de RH",    "description": "…" },
      { "id": "others",   "label": "Outras integrações","description": "…" }
    ],
    "diagram": {
      "nucleusLabel": "…",   // ex.: "InterasisAI Connect — chat e agentes"
      "ariaLabel": "…",      // descrição completa para leitores de tela
      "caption": "…"         // legenda visível
    }
  }
}
```

Regras: chaves presentes nos 3 idiomas (build quebra com `getTranslations` se faltar); siglas "API"/"MCP" iguais nos 3 idiomas; ids de categoria idênticos nos 3 arquivos (usados como `key` e posição).

## C4. Chaves i18n — `home.json` (card; 3 idiomas)

```jsonc
"chatAssistant": {
  "title": "InterasisAI Connect",          // inalterado
  "description": "…",                      // reescrito: agendamento (base) + integração + expansão
  "impactText": "…",                       // novo posicionamento
  "highlights": [ "…", "…", "…", "…", "…" ] // 4 existentes + 1 novo sobre integração
}
```

Regras: `title` permanece "InterasisAI Connect" nos 3 idiomas; 5 highlights em todos os idiomas; nenhuma marca de terceiros como parceira oficial; menção ao agendamento mantida.

## C5. Consumo pela rota (`src/app/[locale]/interasisai-connect/page.tsx`)

```ts
integrations: {
  title: t("integrations.title"),
  description: t("integrations.description"),
  closedScope: t("integrations.closedScope"),
  categories: t.raw("integrations.categories"),
  diagram: {
    nucleusLabel: t("integrations.diagram.nucleusLabel"),
    ariaLabel: t("integrations.diagram.ariaLabel"),
    caption: t("integrations.diagram.caption"),
  },
},
```

## C6. Consumo pelo card (`src/components/ui/PortfolioSection.tsx`)

- Substituir `t("portfolio.projects.chatAssistant.highlights.0")…(.3)` por `t.raw("portfolio.projects.chatAssistant.highlights")` (array), garantindo que o 5º highlight apareça sem mudança adicional no componente.
- `impactText`, `description`, `title`, `category` continuam lidos das mesmas chaves (apenas o texto muda nos JSONs).
