# Research: Administração de Prompts e Guardrails

**Feature**: 015-admin-prompt-guardrails
**Date**: 2026-08-10
**Status**: Complete

## Research Tasks & Decisions

### R1: Markdown Editor — Estratégia de Implementação

**Context**: A spec requer editor Markdown com 3 modos (edição, preview, split) com preview em tempo real e sanitização XSS. O projeto NÃO possui biblioteca de editor Markdown instalada — apenas `react-markdown` para renderização.

**Options Evaluated**:

| Opção | Pros | Cons |
|-------|------|------|
| `@uiw/react-md-editor` | Editor completo, toolbar, split nativo | ~500KB bundle, dependência pesada, visual não customizável para glassmorphism |
| `monaco-editor` | Editor profissional, syntax highlighting | ~5MB bundle, overkill para Markdown, complexo de integrar |
| Custom (textarea + react-markdown) | Leve (~0KB extra), 100% customizável aos design tokens, zero dependências novas | Sem toolbar de formatação, precisa implementar split manualmente |

**Decision**: **Custom Markdown Editor** (`MarkdownEditorCustom.tsx`)

**Rationale**:
- `react-markdown` já está instalado (v10.1.0)
- `rehype-sanitize` cobre sanitização XSS (constituição VIII)
- Bundle size mínimo — sem impacto no Lighthouse
- Visual 100% alinhado ao glassmorphism e design tokens do projeto
- Toolbar de formatação Markdown NÃO é requisito da spec (apenas preview é mandatório)
- Editor custom pode ser reutilizado em PromptFormModal, GuardrailFormModal e TenantLinkSection

**Implementation Approach**:
- Textarea estilizada com design tokens para modo "Edição"
- `react-markdown` + `rehype-sanitize` para modo "Visualização"
- Flexbox lado a lado para modo "Split"
- Alternância via 3 botões toggle (Code, Eye, Columns icons do lucide-react)
- Estado local `editorMode: "edit" | "preview" | "split"` via `useState`
- Atualização em tempo real — sem debounce necessário (textarea onChange → re-render react-markdown)

---

### R2: Toast Notifications — Escolha da Biblioteca

**Context**: A spec exige feedback visual via toast para sucesso/erro (FR-032, FR-033). O projeto NÃO possui biblioteca de toast — usa `aria-live` regions inline.

**Options Evaluated**:

| Opção | Pros | Cons |
|-------|------|------|
| `sonner` | Leve (~2KB), API declarativa, temas dark/light, animações built-in, amplamente adotado com Next.js | Dependência nova |
| `react-hot-toast` | Popular, customizável | API mais verbosa, bundle maior que sonner |
| Custom (aria-live inline) | Zero deps, já usado no projeto | Sem animações, posicionamento fixo difícil, menos atrativo visualmente |

**Decision**: **`sonner`** (v2.x)

**Rationale**:
- API mínima: `toast.success("mensagem")`, `toast.error("mensagem")`
- Suporte nativo a temas (compatível com dark/light/tech-glow do projeto)
- Bundle < 2KB gzipped
- Animações suaves compatíveis com framer-motion
- Amplamente adotado na comunidade Next.js
- `Toaster` component pode ser colocado no `PromptManagerPage` (client component root)

**Installation**: `npm install sonner`

---

### R3: Tabs Component — Implementação

**Context**: A spec requer 3 abas (Prompts Base, Guardrails, Vincular Tenant). Não há shadcn/ui ou biblioteca de tabs no projeto.

**Decision**: **Custom Tabs Component** (`Tabs.tsx`)

**Rationale**:
- Componente simples (~50 linhas) — não justifica dependência externa
- Padrão visual consistente com AdminNavigation (já usa tabs visuais no nav)
- Implementação: array de `{ id, label, icon }` + estado `activeTab` + botões com underline animado

**Implementation Approach**:
- `TabsProps`: `{ tabs: { id: string; label: string; icon: LucideIcon }[]; activeTab: string; onTabChange: (id: string) => void }`
- Cada tab: botão com `text-text-weak`, quando ativo: `text-brand-primary` + borda inferior `border-brand-primary`
- Animação de transição via framer-motion `layoutId` na underline
- Responsivo: tabs horizontais em desktop, com scroll horizontal em mobile

---

### R4: Multi-select Checkbox para Guardrails N:N

**Context**: PromptFormModal precisa de seleção N:N de guardrails via checkboxes. Não há componente Checkbox no projeto.

**Decision**: **Custom Checkbox via Tailwind**

**Rationale**:
- Checkbox é um componente HTML nativo estilizável com Tailwind
- Não necessita de biblioteca externa
- Estado gerenciado via `useForm` do react-hook-form com array de strings

**Implementation Approach**:
- Mapear `guardrails[]` para lista de checkboxes
- Cada checkbox: `<input type="checkbox">` estilizado com `accent-brand-primary` + label com título do guardrail + badge "Global" se `is_global`
- Valor: `guardrail.id`; estado: array `guardrail_ids: string[]` via `setValue` / `watch` do react-hook-form

---

### R5: PUT/DELETE Endpoints para Guardrails e Prompts

**Context**: A spec assume endpoints `PUT /prompt-manager/guardrails/{id}`, `DELETE /prompt-manager/guardrails/{id}`, `PUT /prompt-manager/prompts/{id}`, `DELETE /prompt-manager/prompts/{id}` por convenção REST. O backend pode não tê-los implementados ainda.

**Decision**: **Camada de serviço preparada, UI condicional**

**Rationale**:
- Serviço implementa funções `updateGuardrail`, `deleteGuardrail`, `updatePrompt`, `deletePrompt` com union types
- Se o endpoint retornar 404/405, o erro é capturado e exibido via toast
- Botões de editar/excluir são sempre visíveis — o tratamento de erro cobre endpoints ausentes
- Não há como saber a priori quais endpoints existem sem consultar o backend

**Implementation**: Seguir padrão `requestTenant` de `pythonBackend.ts`:
```ts
async function requestPromptManager<T>(path: string, init: RequestInit, validate: (data: unknown) => data is T): Promise<PromptManagerResult<T>> {
  // try/catch fetch → parse JSON → validate response → union type
}
```

---

### R6: Zod v4 — Compatibilidade com @hookform/resolvers

**Context**: O projeto usa Zod v4.4.3 (não v3). A API de validação mudou em v4.

**Decision**: **Usar API Zod v4 com `@hookform/resolvers` v5.7**

**Rationale**:
- `@hookform/resolvers` v5.7 já suporta Zod v4
- `.min(1, "mensagem")` substitui `.nonempty("mensagem")` da v3
- `.required()` em objetos ainda funciona igual
- Schemas seguirão padrão existente em `src/lib/tenantSchemas.ts`

**Schema Example**:
```ts
import { z } from "zod";

export const guardrailCreateSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório"),
  is_global: z.boolean(),
});
```

---

### R7: Admin Navigation — Adicionar Item

**Context**: FR-001 requer item "Prompts & Guardrails" na navegação admin.

**Decision**: **Adicionar ao array de itens em `AdminNavigation.tsx`**

**Rationale**:
- `AdminNavigation` já tem um array de itens com `href`, `label`, `icon`
- Basta adicionar novo item: `{ href: "/admin/prompt-manager", label: "Prompts & Guardrails", icon: ShieldCheck }` (ícone `ShieldCheck` do lucide-react)
- A rota `/admin/prompt-manager` é protegida pelo server component `page.tsx` (FR-002)

---

### R8: Estrutura de Diretórios para Hooks

**Context**: Constitution I exige hooks separados de componentes. Não existe diretório `src/hooks/` atualmente.

**Decision**: **Criar `src/hooks/` com 3 hooks específicos**

**Rationale**:
- `useGuardrails.ts`: estado da lista, CRUD operations, loading/error states
- `usePrompts.ts`: estado da lista, CRUD operations, guardrails selection state
- `useTenantLink.ts`: estado do form, submit handler, loading/error

**Pattern**: Cada hook retorna `{ data, loading, error, create, update, remove, ... }` seguindo padrão de custom hooks do projeto existentes.

---

## Summary of New Dependencies

| Package | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| `sonner` | ^2.0 | Toast notifications | ~2KB gzipped |
| `rehype-sanitize` | ^6.0 | Markdown XSS sanitization | ~3KB gzipped |

**Total new bundle weight**: ~5KB gzipped — insignificante para o Lighthouse score.
