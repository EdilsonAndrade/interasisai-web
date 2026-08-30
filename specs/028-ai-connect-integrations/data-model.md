# Data Model — InterasisAI Connect: Posicionamento de Integrações e Expansibilidade

**Feature**: `specs/028-ai-connect-integrations` | **Date**: 2026-08-30

Esta feature não cria dados persistentes nem chamadas de API — todo o "dado" é conteúdo estático localizado nos catálogos `next-intl` e tipado em `src/components/connect/types.ts`. As entidades abaixo descrevem a forma desse conteúdo.

## Entidades

### 1. Conteúdo de Posicionamento do Card (`portfolio.projects.chatAssistant`)

Origem: `src/i18n/locales/{pt-BR,en,es}/home.json` — atualização do que já existe.

| Campo | Tipo | Regras |
|---|---|---|
| `title` | string | Inalterado: "InterasisAI Connect" (marca, não traduzida) |
| `description` | string | Reescrito: comunica agendamento (base) + integração a CRMs/bases de dados/APIs e expansão sob projeto de escopo fechado; sem jargão técnico excessivo |
| `impactText` | string | Novo texto de posicionamento: "vai além do agendamento" + expansível à necessidade do cliente; sem marcas de terceiros |
| `highlights[]` | string[] | Ganha um 5º item sobre integração (CRM, base de dados, APIs) com projeto de escopo fechado; os 4 existentes permanecem, incluindo o de agendamento |
| `tags[]`, `category`, demais campos | — | Inalterados |

Regras de validação (FR-001 a FR-003, FR-013): todo texto traduzido nos 3 idiomas; "InterasisAI Connect" não traduzido; agendamento permanece mencionado; nenhuma marca de terceiros como parceira oficial; nenhum dado de cliente real.

### 2. Seção de Integrações (`connect.integrations`)

Origem: `src/i18n/locales/{pt-BR,en,es}/connect.json` — chave nova.

| Campo | Tipo | Regras |
|---|---|---|
| `title` | string | Título da seção (h2) |
| `description` | string | Apresenta as categorias integráveis em linguagem acessível ao não técnico |
| `closedScope` | string | Explica o modelo "projeto de escopo fechado, dimensionado à necessidade do cliente" |
| `categories[]` | IntegrationCategory[] | 6 itens fixos (ver entidade 3); ordem estável (ordem de exibição) |
| `diagram.nucleusLabel` | string | Rótulo do núcleo central (chat + agentes) |
| `diagram.ariaLabel` | string | Descrição textual do diagrama para leitores de tela |
| `diagram.caption` | string | Legenda visível opcional sob o diagrama |

### 3. Categoria de Integração (`IntegrationCategory`)

Tipo novo em `src/components/connect/types.ts`:

```ts
export type IntegrationCategoryId =
  | "crm"
  | "database"
  | "api"
  | "mcp"
  | "hr"
  | "others";

export type IntegrationCategory = {
  id: IntegrationCategoryId;
  label: string;       // ex.: "CRM", "Base de dados", "API", "MCP", "Sistemas de RH", "Outras integrações"
  description: string; // uma frase curta, linguagem acessível
};
```

| Regra | Detalhe |
|---|---|
| IDs | Fixos e estáveis (`crm`, `database`, `api`, `mcp`, `hr`, `others`) — usados como `key` de React e para posicionamento no diagrama |
| `label` | Siglas técnicas (API, MCP) mantidas em todos os idiomas; demais rótulos traduzidos |
| `description` | Traduzida; sem marcas de terceiros |

### 4. Diagrama de Integração (componente)

`ConnectIntegrationDiagram` (client component) — sem dados próprios além das props:

| Prop | Tipo | Regras |
|---|---|---|
| `categories` | `IntegrationCategory[]` | Renderiza 1 nó por categoria |
| `nucleusLabel` | string | Rótulo do nó central |
| `ariaLabel` | string | `role="img"` + `aria-label` |
| `caption` | string | Legenda opcional |

**Estados do componente** (transições controladas apenas pela preferência do usuário):

| Estado | Condição | Comportamento |
|---|---|---|
| Animado (default) | `useReducedMotion() === false/null` | Setas SVG (`motion.path`) animando `pathLength`/`strokeDashoffset` em loop (`repeat: Infinity`, easing linear) |
| Estático (fallback) | `useReducedMotion() === true` | Mesmo SVG com setas desenhadas completas, sem animação; todos os rótulos visíveis |

Em ambos os estados, a lista textual `sr-only` das categorias permanece no DOM (equivalência para leitores de tela).

### Relacionamentos

- `ConnectPageContent` (tipos existentes em `types.ts`) ganha o campo `integrations: ConnectIntegrationsContent` (agrupa `title`, `description`, `closedScope`, `categories`, `diagram`), montado na rota `page.tsx` via `getTranslations`/`t.raw` — mesmo fluxo das chaves atuais (`comparisonTable`, `steps`, `verticals`).
- O card (`PortfolioSection` → `PortfolioCard`) continua consumindo `portfolio.projects.chatAssistant.*`; a única mudança estrutural é o mapeamento de `highlights` via `t.raw(...)` (array dinâmico).
