# Tasks: Administração de Prompts e Guardrails

**Input**: Design documents from `/specs/015-admin-prompt-guardrails/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: NÃO incluídos — fora do escopo por solicitação explícita do usuário.

**Nota i18n**: Área administrativa não requer tradução. Todo texto da UI é hardcoded em Português (Brasil).

**Organization**: Tasks são agrupadas por user story para permitir implementação e validação independente de cada story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: Qual user story esta task pertence (US1, US2, US3)
- Inclui caminho exato do arquivo em cada descrição

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Instalar dependências e criar estrutura de diretórios

- [x] T001 Instalar novas dependências (`sonner` e `rehype-sanitize`) executando `npm install sonner rehype-sanitize` no diretório raiz
- [x] T002 [P] Criar diretório `src/hooks/` (novo diretório para custom hooks conforme Constitution I)
- [x] T003 [P] Criar diretório `src/components/admin/prompt-manager/` e `src/app/[locale]/admin/prompt-manager/`

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Tipos, schemas, camada de serviço e componentes compartilhados que TODAS as user stories dependem

**⚠️ CRITICAL**: Nenhuma user story pode iniciar antes desta fase ser concluída

- [x] T004 [P] Criar tipos de API em `src/services/promptManager.types.ts` — interfaces `Guardrail`, `Prompt`, `GuardrailCreateInput`, `PromptCreateInput`, `TenantLinkInput` e union types `PromptManagerResult<T>` conforme data-model.md
- [x] T005 [P] Criar schemas Zod e tipos inferidos em `src/lib/promptManagerSchemas.ts` — schemas `guardrailFormSchema`, `promptFormSchema`, `tenantLinkSchema` usando Zod v4 (`.trim().min(1, "mensagem")` — `.trim()` antes de `.min()` é obrigatório para normalizar espaços, FR-030)
- [x] T006 Criar camada de serviço em `src/services/promptManager.ts` — funções `fetchGuardrails`, `createGuardrail`, `updateGuardrail`, `deleteGuardrail`, `fetchPrompts`, `createPrompt`, `updatePrompt`, `deletePrompt`, `linkTenantToPrompt` seguindo padrão union type de `pythonBackend.ts` (base URL: `NEXT_PUBLIC_PYTHON_BACKEND_URL/prompt-manager`); **importante**: `console.error` NÃO deve logar valores de `conteudo` ou `custom_content_override` (FR-045); suporte a `AbortController` via parâmetro `signal?: AbortSignal` para descarte de respostas obsoletas (edge case: respostas atrasadas)
- [x] T007 [P] Criar componente reutilizável `Tabs` em `src/components/admin/prompt-manager/Tabs.tsx` — props: `tabs: { id, label, icon }[]`, `activeTab`, `onTabChange`; animação de underline via framer-motion `layoutId`; responsivo com scroll horizontal em mobile
- [x] T008 [P] Criar editor Markdown customizado `MarkdownEditorCustom` em `src/components/admin/prompt-manager/MarkdownEditorCustom.tsx` — 3 modos (edit/preview/split) via textarea + `react-markdown` + `rehype-sanitize`; controles toggle com ícones `Code`, `Eye`, `Columns` do lucide-react; atualização em tempo real; props: `value`, `onChange`, `label?`
- [x] T009 [P] Criar tipos de componentes em `src/components/admin/prompt-manager/types.ts` — tipos locais: `EditorMode`, `ModalMode`, `TabId`, etc.

**Checkpoint**: Fundação pronta — implementação das user stories pode começar em paralelo

---

## Phase 3: User Story 1 - Gerenciar Guardrails (Priority: P1) 🎯 MVP

**Goal**: Administrador lista, cria, edita e exclui guardrails com editor Markdown nos modos edição/preview/split

**Independent Test**: Acessar aba "Guardrails", visualizar listagem, criar guardrail com título e conteúdo Markdown, editar existente, excluir com diálogo de confirmação — tudo sem depender de prompts ou tenants

### Implementation for User Story 1

- [x] T010 [US1] Criar hook `useGuardrails` em `src/hooks/useGuardrails.ts` — gerencia estado da lista de guardrails (idle/loading/success/error/empty), funções `createGuardrail`, `updateGuardrail`, `removeGuardrail` (com confirmação), `refreshGuardrails`; todas as operações retornam feedback para toast
- [x] T011 [P] [US1] Criar componente `GuardrailList` em `src/components/admin/prompt-manager/GuardrailList.tsx` — consome `useGuardrails`; exibe lista de guardrails com título, badge "Global"/"Específico", ações editar/excluir; estado vazio com mensagem "Nenhum guardrail cadastrado"; loading com "Carregando guardrails..."; cards com design tokens (`bg-surface-base`, `border-border-subtle`, `rounded-card`)
- [x] T012 [P] [US1] Criar componente `GuardrailFormModal` em `src/components/admin/prompt-manager/GuardrailFormModal.tsx` — modal via `AdminDialog` existente; formulário com `react-hook-form` + `guardrailFormSchema`; campos: `titulo` (text input), `conteudo` (`MarkdownEditorCustom`), `is_global` (toggle switch); suporta modo criar e editar (pré-preenche valores); validação com mensagens de erro por campo; botão "Salvando..." com `isSubmitting`; fecha modal e dispara refresh ao sucesso
- [x] T013 [US1] Implementar diálogo de confirmação de exclusão no `GuardrailList` — usa `AdminDialog` com título "Excluir guardrail?", nome do guardrail, mensagem "Esta ação não poderá ser desfeita.", ações "Cancelar" e "Excluir" (estilo destrutivo)
- [x] T014 [US1] Integrar feedback toast no `useGuardrails` — ao criar: "Guardrail criado com sucesso"; ao editar: "Guardrail atualizado com sucesso"; ao excluir: "Guardrail excluído com sucesso"; erro 409 (conflito): "Este guardrail está vinculado a prompts ativos. Remova os vínculos antes de excluir."; demais erros: mensagem descritiva da API; falha de rede: "Não foi possível conectar ao servidor. Verifique sua conexão."

**Checkpoint**: User Story 1 funcional — guardrails podem ser gerenciados independentemente com feedback visual completo

---

## Phase 4: User Story 2 - Gerenciar Prompts Base (Priority: P2)

**Goal**: Administrador lista, cria, edita e exclui prompts do sistema com seleção N:N de guardrails via checkboxes

**Independent Test**: Acessar aba "Prompts Base", visualizar listagem com guardrails vinculados, criar prompt selecionando múltiplos guardrails, editar conteúdo Markdown com preview, excluir com diálogo de confirmação

**Dependencies**: Phase 3 (US1) — precisa de guardrails cadastrados para o seletor N:N

### Implementation for User Story 2

- [x] T015 [US2] Criar hook `usePrompts` em `src/hooks/usePrompts.ts` — gerencia estado da lista de prompts (idle/loading/success/error/empty); funções `createPrompt`, `updatePrompt`, `removePrompt` (com confirmação), `refreshPrompts`; também expõe `guardrails` (lista para o seletor N:N carregada via `fetchGuardrails` do serviço); todas as operações retornam feedback para toast
- [x] T016 [P] [US2] Criar componente `PromptList` em `src/components/admin/prompt-manager/PromptList.tsx` — consome `usePrompts`; exibe lista de prompts com título, badge "Padrão" se `is_default`, chips com nomes dos guardrails vinculados, ações editar/excluir; estado vazio "Nenhum prompt cadastrado"; loading "Carregando prompts..."; design tokens consistentes
- [x] T017 [P] [US2] Criar componente `PromptFormModal` em `src/components/admin/prompt-manager/PromptFormModal.tsx` — modal via `AdminDialog`; formulário com `react-hook-form` + `promptFormSchema`; campos: `titulo` (text), `conteudo` (`MarkdownEditorCustom`), `is_default` (toggle), seletor N:N de `guardrail_ids` (checkboxes custom estilizados com `accent-brand-primary`, cada um mostrando título do guardrail + badge "Global" se aplicável); suporte criar/editar; checkbox marcados pré-selecionados na edição; validação, loading, fechamento e refresh ao sucesso
- [x] T018 [US2] Implementar diálogo de confirmação de exclusão no `PromptList` — mesmo padrão do `GuardrailList` com título "Excluir prompt?", nome, mensagem e ações Cancelar/Excluir
- [x] T019 [US2] Integrar feedback toast no `usePrompts` — criar: "Prompt criado com sucesso"; editar: "Prompt atualizado com sucesso"; excluir: "Prompt excluído com sucesso"; erro 409: "Operação conflitante. Verifique os vínculos."; demais erros e falhas de rede seguem mesmo padrão do US1

**Checkpoint**: User Story 2 funcional — prompts podem ser gerenciados com vínculo N:N a guardrails

---

## Phase 5: User Story 3 - Vincular Tenant a Prompt (Priority: P3)

**Goal**: Administrador associa um tenant a um prompt com opção de customização de conteúdo (override)

**Independent Test**: Acessar aba "Vincular Tenant", informar tenant_id, selecionar prompt da lista, opcionalmente preencher conteúdo customizado no editor Markdown, confirmar associação com feedback de sucesso

**Dependencies**: Phase 4 (US2) — precisa de prompts cadastrados para o seletor

### Implementation for User Story 3

- [x] T020 [US3] Criar hook `useTenantLink` em `src/hooks/useTenantLink.ts` — gerencia estado do formulário de vínculo; carrega lista de prompts via `fetchPrompts` para o seletor; função `linkTenant(input: TenantLinkInput)` que chama `linkTenantToPrompt` do serviço; retorna `{ prompts, loading, submitting, linkTenant, error }` com feedback para toast
- [x] T021 [US3] Criar componente `TenantLinkSection` em `src/components/admin/prompt-manager/TenantLinkSection.tsx` — formulário com `react-hook-form` + `tenantLinkSchema`; campos: `tenant_id` (text input obrigatório), `prompt_id` (select dropdown com prompts disponíveis, obrigatório — se lista vazia exibir "Nenhum prompt cadastrado" e desabilitar submit), `custom_content_override` (`MarkdownEditorCustom` opcional, exibido com label "Customização de Conteúdo (opcional)"); botão "Vincular Tenant" com estado de loading "Vinculando..."; validação bloqueia envio se campos obrigatórios vazios
- [x] T022 [US3] Integrar feedback toast no `TenantLinkSection` — sucesso: "Vínculo criado com sucesso"; erro de API: mensagem descritiva; erro de rede: "Não foi possível conectar ao servidor"; campo `tenant_id` preservado após erro, formulário permanece aberto

**Checkpoint**: User Story 3 funcional — tenants podem ser vinculados a prompts com override opcional

---

## Phase 6: Polish & Integração Cross-User-Story

**Purpose**: Orquestrador da página, rota server component, item de navegação, e refinamentos finais

- [x] T023 Criar componente orquestrador `PromptManagerPage` em `src/components/admin/prompt-manager/PromptManagerPage.tsx` — `"use client"`; renderiza `<Toaster richColors />` do sonner com `aria-live="polite"` wrapper para acessibilidade; renderiza `<Tabs />` com 3 abas (Prompts Base, Guardrails, Vincular Tenant) usando ícones `MessageSquare`, `Shield`, `Link`; tab ativa default: "prompts"; renderiza condicionalmente `PromptList` / `GuardrailList` / `TenantLinkSection` conforme aba ativa; estado de cada aba preservado durante troca (componentes não são desmontados — usar CSS `display` ou conditional rendering que mantém estado)
- [x] T024 Criar rota server component em `src/app/[locale]/admin/prompt-manager/page.tsx` — async server component; verifica sessão admin via `hasValidAdminSession(cookies)` e redireciona para `/admin` se não autenticado; exporta `metadata` com `title: "Prompts & Guardrails | Interasis AI"`, `description` e `openGraph`; renderiza `<PromptManagerPage />`
- [x] T025 Modificar `AdminNavigation` em `src/components/admin/AdminNavigation.tsx` — adicionar item ao array de navegação: `{ href: "/admin/prompt-manager", label: "Prompts & Guardrails", icon: ShieldCheck }` (importar `ShieldCheck` de `lucide-react`)
- [x] T026 [P] Validar edge cases e usabilidade — verificar listagem vazia (mensagens amigáveis em vez de tela branca), formulário preserva dados ao alternar abas, envio duplicado bloqueado, conteúdo Markdown extenso não quebra layout, modais fecham com Escape e clique fora, teclado navega em todos os controles

**Checkpoint**: Feature completa — `/admin/prompt-manager` funcional com as 3 abas integradas

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
└─► Phase 2 (Foundational) ─── BLOCKER para todas as stories
    ├─► Phase 3 (US1: Guardrails P1) 🎯 MVP
    │   └─► Phase 4 (US2: Prompts P2)
    │       └─► Phase 5 (US3: Tenant Link P3)
    └─► Phase 6 (Polish & Integration) — após todas as stories

Dentro de cada fase:
  Tarefas [P] podem executar em paralelo
  Tarefas sem [P] devem ser sequenciais ou dependem de tarefas anteriores da mesma fase
```

### Story Completion Order

| Story | Priority | Depende de | Entregável MVP |
|-------|----------|-----------|----------------|
| US1 - Guardrails | P1 | Phase 2 (Foundational) | Guardrails CRUD completo |
| US2 - Prompts | P2 | Phase 2 + US1 (guardrails para seletor N:N) | Prompts CRUD com N:N guardrails |
| US3 - Tenant Link | P3 | Phase 2 + US2 (prompts para seletor) | Vínculo tenant-prompt |

---

## Parallel Execution Examples

### Phase 2 (Foundational) — Executar juntos

```bash
# Paralelizável: T004, T005, T007, T008, T009 (arquivos diferentes, sem dependências)
# T004: src/services/promptManager.types.ts
# T005: src/lib/promptManagerSchemas.ts
# T007: src/components/admin/prompt-manager/Tabs.tsx
# T008: src/components/admin/prompt-manager/MarkdownEditorCustom.tsx
# T009: src/components/admin/prompt-manager/types.ts
# Sequencial após: T006 (depende de T004)
```

### Phase 3 (US1: Guardrails) — Executar juntos

```bash
# Paralelizável: T011, T012 (componentes diferentes, ambos dependem de T010)
# T011: src/components/admin/prompt-manager/GuardrailList.tsx
# T012: src/components/admin/prompt-manager/GuardrailFormModal.tsx
# Sequencial após: T010 (hook deve existir primeiro)
```

### Phase 4 (US2: Prompts) — Executar juntos

```bash
# Paralelizável: T016, T017 (componentes diferentes, ambos dependem de T015)
# T016: src/components/admin/prompt-manager/PromptList.tsx
# T017: src/components/admin/prompt-manager/PromptFormModal.tsx
# Sequencial após: T015 (hook deve existir primeiro)
```

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**Scope**: Phase 1 → Phase 2 → Phase 3 (US1: Guardrails) → Phase 6 (mínimo: T023 + T024 + T025)

Entregar apenas a aba de Guardrails como MVP inicial permite:
- Validar toda a infraestrutura (tipos, schemas, serviço, MarkdownEditor, Tabs)
- Testar integração com backend Python
- Coletar feedback antes de investir nas abas de Prompts e Tenant Link

### Incremental Delivery

1. **Sprint 1 (MVP)**: Setup + Foundational + US1 Guardrails + Integração (rota/nav)
2. **Sprint 2**: US2 Prompts (adiciona aba "Prompts Base" com seletor N:N)
3. **Sprint 3**: US3 Tenant Link (adiciona aba "Vincular Tenant")

### Total Task Count

| Phase | Tasks | Paralelizáveis |
|-------|-------|----------------|
| Phase 1: Setup | 3 | 2 |
| Phase 2: Foundational | 6 | 5 |
| Phase 3: US1 Guardrails (P1) | 5 | 2 |
| Phase 4: US2 Prompts (P2) | 5 | 2 |
| Phase 5: US3 Tenant Link (P3) | 3 | 0 |
| Phase 6: Polish | 4 | 1 |
| **Total** | **26** | **12** |

---

## Notes

- **Sem i18n**: Área administrativa não requer tradução — todo texto UI hardcoded em pt-BR
- **Sem testes**: Testes unitários fora do escopo por solicitação explícita do usuário
- **Sem `any`**: Constitution V — todos os tipos explicitamente definidos
- **Sem `dangerouslySetInnerHTML`**: Constitution VIII — usar `react-markdown` + `rehype-sanitize`
- **Design tokens**: Usar tokens do tema existente (`text-text-strong`, `bg-surface-base`, `border-brand-primary`, `rounded-card`, etc.)
- **Padrão admin**: Seguir o padrão existente — server component (`page.tsx`) → client component delegation (`PromptManagerPage`)
- **Endpoints PUT/DELETE**: Se backend não tiver os endpoints ainda, o serviço captura erro e exibe toast apropriado (FR-033, FR-034)
