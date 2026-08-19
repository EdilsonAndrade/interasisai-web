---

description: "Task list for Widget de Chat Embutível para Clientes"
---

# Tasks: Widget de Chat Embutível para Clientes

**Input**: Design documents from `/specs/016-embeddable-chat-widget/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: incluídos — a constituição do projeto (Princípio IV) exige cobertura de teste automatizada para toda feature, tanto na área admin (Jest + RTL) quanto no bundle standalone (Jest + jsdom).

**Organization**: tarefas agrupadas por user story (US1–US5 de [spec.md](./spec.md)), permitindo implementação e teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência entre si)
- **[Story]**: a qual user story a tarefa pertence (US1–US5)
- Caminhos de arquivo exatos incluídos em cada descrição

## Path Conventions

Aplicação Next.js única (`src/`) já existente, com um novo pacote standalone (`src/widget/`) e um novo build script (`scripts/`), conforme `plan.md` → Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar a estrutura de diretórios e o pipeline de build do bundle standalone, sem lógica de negócio ainda.

- [X] T001 Criar a estrutura de diretórios `src/widget/` (`index.ts`, `network.ts`, `state.ts`, `render.ts`, `styles.ts` como arquivos vazios) e `scripts/` para o build script, conforme `plan.md` → Project Structure
- [X] T002 [P] Adicionar `esbuild` como devDependency em `package.json`
- [X] T003 [P] Adicionar o script `"build:widget"` em `package.json` (executa `node scripts/build-widget.mjs`) e encadeá-lo como `"prebuild": "npm run build:widget"` para que `next build` sempre gere um `public/widget/widget.bundle.js` atualizado
- [X] T004 [P] Adicionar `public/widget/widget.bundle.js` ao `.gitignore` (artefato gerado, não deve ser versionado)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura central do widget embutível — necessária antes de US2, US3 e US4 (US1 não depende desta fase, ver Dependencies).

**⚠️ CRITICAL**: nenhuma tarefa de US2/US3/US4 pode começar antes desta fase estar completa.

- [X] T005 [P] Implementar `src/widget/network.ts` — encapsula `initializeChatSession(tenantId)` e `sendChatMessage(request, accessToken)` de `src/services/pythonBackend.ts` para uso fora do runtime React/Next (mesmo contrato HTTP, sem duplicar lógica de fetch)
- [X] T006 [P] Implementar `src/widget/state.ts` — módulo de estado da conversa: `accessToken` mantido só em memória, `thread_id` (UUID v4) persistido em `localStorage` da origem do site do cliente, lista de mensagens e flag de carregamento (per `data-model.md` → WidgetSession)
- [X] T007 [P] Implementar `src/widget/styles.ts` — folha de estilos mínima (bolha, painel, lista de mensagens, input) replicando os tokens da tabela "Visual Identity Standards" da constituição, como string CSS para injeção no Shadow Root
- [X] T008 Implementar `src/widget/render.ts` — constrói bolha + painel + lista de mensagens + input + botão de enviar dentro de um Shadow Root (`mode: "open"`), com handlers de clique/teclado ligados às ações de `state.ts`; mensagens renderizadas como **texto plano** (sem parser de Markdown, para manter o bundle leve — decisão registrada em `research.md` item 3) (depends on T007)
- [X] T009 Implementar `src/widget/index.ts` — ponto de entrada: lê a constante global `__INTERASIS_TENANT_ID__` injetada pelo Route Handler, chama `network.ts` para inicializar a sessão e só monta a UI de `render.ts` se a inicialização retornar sucesso; em qualquer falha, não renderiza nada e não lança exceção visível (per `contracts/widget-loader-contract.md`) (depends on T005, T006, T008)
- [X] T010 Implementar `scripts/build-widget.mjs` — configuração esbuild que compila `src/widget/index.ts` (formato IIFE, minificado) para `public/widget/widget.bundle.js`, definindo a URL pública do backend Python em tempo de build (mesma variável já usada em `NEXT_PUBLIC_PYTHON_BACKEND_URL`) (depends on T009)
- [X] T011 Implementar `src/app/widget/[tenantId]/route.ts` — Route Handler que lê `public/widget/widget.bundle.js`, prefixa `const __INTERASIS_TENANT_ID__ = "{tenantId}";` e retorna com `Content-Type: application/javascript; charset=utf-8` e `Cache-Control: public, max-age=300` (per `contracts/widget-loader-contract.md`) (depends on T010)

**Checkpoint**: o bundle e a rota de distribuição existem e funcionam de ponta a ponta contra um tenant real — US2, US3 e US4 podem começar.

> ⚠️ **Bloqueio externo descoberto em 2026-08-19**: teste manual confirmou que o backend Python bloqueia a chamada de `GET /api/v1/chat/init` por CORS (preflight `OPTIONS` sem `Access-Control-Allow-Origin`), mesmo para domínios corretamente cadastrados em `allowed_domains`. Isso bloqueia **toda a feature** em qualquer site externo real, não só a validação manual (T020/T021/T024/T026/T027/T036). Documentado em `contracts/backend-cors-requirement.md` — requer ação do time do backend Python, fora do escopo deste repositório.

---

## Phase 3: User Story 1 - Operador gera o snippet de instalação (Priority: P1) 🎯 MVP (parte 1)

**Goal**: o operador consegue obter, para qualquer tenant já cadastrado, um snippet pronto para copiar e enviar ao cliente.

**Independent Test**: cadastrar/consultar um tenant existente em `/admin/tenants` e verificar que o sistema exibe um snippet único, sem exigir preenchimento manual de identificadores.

### Tests for User Story 1

- [X] T012 [P] [US1] Teste unitário de `useTenantSnippet.ts` com `renderHook` (Jest), cobrindo diferentes valores de `tenant.id` e a ação de copiar, em `src/hooks/useTenantSnippet.test.ts` (caminho colocado ao lado do hook, seguindo a convenção já usada no repositório em vez de `__tests__/`)
- [X] T013 [P] [US1] Teste RTL de `TenantSnippet.tsx` verificando o texto do snippet e o botão "copiar" via `getByRole`, em `src/components/admin/tenants/TenantSnippet.test.tsx` (mesma convenção colocada do repositório)

### Implementation for User Story 1

- [X] T014 [P] [US1] Documentar a reutilização de `NEXT_PUBLIC_SITE_URL` (já existente) como base do snippet do widget em `.env.example`, em vez de introduzir uma nova variável `WIDGET_BASE_URL` duplicada
- [X] T015 [US1] Implementar `src/hooks/useTenantSnippet.ts` — computa a string `<script src="{NEXT_PUBLIC_SITE_URL}/widget/{tenant.id}" async></script>` a partir de um `Tenant` e expõe uma ação `copySnippet` (per `data-model.md` → InstallationSnippet) (depends on T014)
- [X] T016 [US1] Implementar `src/components/admin/tenants/TenantSnippet.tsx` — exibe o snippet computado em um bloco de código somente-leitura com botão "Copiar" (depends on T015)
- [X] T017 [US1] Integrar `TenantSnippet.tsx` em `src/components/admin/tenants/TenantDetails.tsx`, exibido sempre que um tenant ativo é consultado com sucesso (depends on T016)

**Checkpoint**: operador vê e copia um snippet funcional para qualquer tenant, de forma totalmente independente do restante da feature.

---

## Phase 4: User Story 2 - Cliente instala colando um único trecho de código (Priority: P1) 🎯 MVP (parte 2)

**Goal**: o snippet gerado na US1, quando colado sem edição em um site externo, torna o widget visível e funcional.

**Independent Test**: colar o snippet recebido em uma página HTML de teste (fora deste repositório) e confirmar que o widget aparece funcional, sem qualquer edição do trecho.

### Tests for User Story 2

- [X] T018 [P] [US2] Teste (Jest) do Route Handler `src/app/widget/[tenantId]/route.ts` — confirma `Content-Type` correto e `tenantId` injetado no corpo retornado, em `src/app/widget/[tenantId]/route.test.ts` (caminho colocado, convenção do repo)
- [X] T019 [P] [US2] Teste (Jest + jsdom) de `src/widget/index.ts` — confirma que `mountWidget()` é chamado quando `initSession` resolve `true`, em `src/widget/index.test.ts` (o mesmo arquivo também cobre o caso de falha usado por T025/US4, evitando duplicar a suíte)

### Implementation for User Story 2

- [ ] T020 [US2] Validação manual: executar `quickstart.md` passos 1–5 (build do widget, colar snippet em página HTML externa de teste, confirmar que a bolha aparece) e registrar o resultado na descrição do PR — ⚠️ **parcialmente validado nesta sessão**: com o dev server rodando, `GET /widget/{tenantId}` foi confirmado retornando `200`, `Content-Type: application/javascript`, `Cache-Control: public, max-age=300` e o bundle com o `tenantId` injetado corretamente (isso revelou e corrigiu um bug real: o middleware de i18n estava redirecionando `/widget/*` para `/en/widget/*` → 404, quebrando o contrato para todo cliente — corrigido em `src/middleware.ts`). A confirmação visual da bolha aparecendo em um site externo real **depende de um tenant cadastrado em um backend Python ativo**, indisponível neste ambiente — pendente para o usuário validar
- [ ] T021 [US2] Validação manual: executar `quickstart.md` passo 7 — colar o mesmo snippet em duas páginas diferentes da mesma origem autorizada e confirmar comportamento idêntico em ambas — pendente (mesma dependência de backend Python ativo)

**Checkpoint**: uma página HTML real, externa a este repositório, com o snippet colado sem edição, exibe um widget funcional. **MVP completo (US1 + US2).**

---

## Phase 5: User Story 3 - Visitante conversa com o assistente de IA (Priority: P2)

**Goal**: visitantes do site do cliente enviam mensagens e recebem respostas geradas pela IA usando a base de conhecimento daquele tenant.

**Independent Test**: abrir o widget em um site com snippet instalado, enviar uma mensagem e confirmar que a resposta reflete o conhecimento daquele tenant.

### Tests for User Story 3

- [X] T022 [P] [US3] Teste (Jest + jsdom) de `src/widget/state.ts` — fluxo de envio de mensagem (enviar → carregando → resposta anexada), incluindo o caminho de renovação de token em `401` (equivalente ao já validado em `useChatAssistant.ts`), em `src/widget/state.test.ts` (caminho colocado, convenção do repo) — 7 testes, todos passando

### Implementation for User Story 3

- [X] T023 [US3] Revisar/ajustar `src/widget/render.ts` e `src/widget/state.ts` para garantir o ciclo completo enviar→carregar→exibir resposta (texto plano) e o retry automático de token expirado — já implementado durante a Phase 2 (T008/T009); revisado nesta tarefa e confirmado pelos testes de T022, sem necessidade de ajuste adicional
- [ ] T024 [US3] Validação manual: recarregar a página de teste entre mensagens e confirmar (via `quickstart.md`) que o `thread_id` persiste em `localStorage` da origem do cliente, mantendo o histórico da conversa — pendente (depende de backend Python ativo, indisponível neste ambiente)

**Checkpoint**: uma conversa completa funciona através do widget embutido, usando a base de conhecimento correta do tenant.

---

## Phase 6: User Story 4 - Sistema bloqueia uso do widget fora dos domínios autorizados (Priority: P2)

**Goal**: um snippet colado em um domínio não autorizado (ou de um tenant excluído) nunca se torna funcional.

**Independent Test**: colar um snippet válido em um domínio fora da lista `allowed_domains` do tenant e confirmar que o widget não fica funcional, sem erro técnico exposto.

### Tests for User Story 4

- [X] T025 [P] [US4] Teste (Jest + jsdom) de `src/widget/index.ts` — confirma que nada é renderizado quando `initSession` resolve `false` (simulando rejeição de domínio pela API), em `src/widget/index.test.ts` — já implementado junto de T019 (mesma suíte, evita duplicação)

### Implementation for User Story 4

- [ ] T026 [US4] Validação manual: executar `quickstart.md` passo 6 — servir a página de teste a partir de uma origem fora de `allowed_domains` e confirmar que nenhuma bolha aparece e nenhum erro técnico é exibido na página — pendente (depende de backend Python ativo)
- [ ] T027 [US4] Validação manual: executar `quickstart.md` passo 8 — excluir o tenant de teste pelo admin e confirmar que o widget deixa de aparecer ao recarregar — pendente (depende de backend Python ativo)

**Checkpoint**: domínios não autorizados e tenants excluídos nunca veem um widget funcional.

---

## Phase 7: User Story 5 - Operador atualiza a aparência básica sem nova instalação (Priority: P3)

**Goal**: cor, logo, saudação e posição do widget são configuráveis pelo operador e refletem no site do cliente sem exigir reinstalação.

**Independent Test**: alterar a configuração de aparência de um tenant já com widget instalado e confirmar que a mudança aparece no site do cliente sem tocar no snippet.

> ⚠️ **Bloqueio externo**: esta fase depende de `contracts/tenant-widget-config-api.md`, contrato **ainda não implementado** no backend Python. T028 é o hand-off necessário antes de qualquer tarefa seguinte desta fase.

- [ ] T028 [US5] Alinhar com o time do backend Python a implementação de `GET /api/v1/tenants/{tenant_id}/widget-config` (público, sem autenticação) e dos campos `widget_primary_color`, `widget_logo_url`, `widget_greeting_message`, `widget_position` em `PUT /api/v1/tenants/{tenant_id}` (per `contracts/tenant-widget-config-api.md`) — bloqueante
- [ ] T029 [US5] Estender os tipos `Tenant` e `TenantWriteInput` em `src/services/pythonBackend.types.ts` com os novos campos opcionais `widget_*` (depends on T028)
- [ ] T030 [US5] Adicionar os campos de aparência ao formulário `src/components/admin/tenants/TenantForm.tsx` e às validações em `src/lib/tenantSchemas.ts` (depends on T029)
- [ ] T031 [US5] Atualizar `src/app/widget/[tenantId]/route.ts` para consultar `GET /widget-config` e injetar a aparência recebida no bundle retornado, com fallback para os defaults do produto quando o endpoint retornar 404 ou campos ausentes (depends on T028, T011)
- [ ] T032 [US5] Atualizar `src/widget/render.ts` e `src/widget/styles.ts` para aplicar `primary_color`, `logo_url`, `greeting_message` e `position` recebidos via configuração injetada, com os defaults como fallback (depends on T031)
- [ ] T033 [P] [US5] Teste (Jest + jsdom) cobrindo o fallback para aparência padrão quando `widget-config` está ausente/retorna 404, em `src/widget/__tests__/index.test.ts`

**Checkpoint**: mudanças de aparência feitas pelo operador refletem no widget já instalado, sem qualquer ação do cliente — assim que o contrato de backend (T028) estiver disponível.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T034 [P] Rodar `npm run lint` e corrigir quaisquer problemas introduzidos pelos novos arquivos — 0 erros/warnings nos arquivos desta feature; os 3 erros e 6 warnings restantes do `npm run lint` são pré-existentes em `useGuardrails.ts`, `usePrompts.ts`, `useTenantLink.ts` e `TenantForm.tsx`, não tocados por esta feature
- [X] T035 [P] Medir o tamanho final de `public/widget/widget.bundle.js` (gzip) e confirmar a meta < 20KB de `contracts/widget-loader-contract.md` — resultado: 11KB brutos / **~4KB gzip**, bem abaixo da meta
- [ ] T036 Executar o roteiro completo de `quickstart.md` do início ao fim como validação final de aceite — pendente (depende de backend Python ativo com tenant real, indisponível neste ambiente; passos 1–5 e a rota `/widget/{tenantId}` já foram verificados manualmente nesta sessão)
- [X] T037 [P] Revisar acessibilidade da bolha/painel (labels ARIA equivalentes aos já usados em `src/components/chat/ChatWidget.tsx`: "Abrir chat", "Fechar chat", "Enviar mensagem") — implementado em `src/widget/render.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende de Setup — bloqueia US2, US3 e US4 (não bloqueia US1)
- **US1 (Phase 3)**: depende apenas de Setup (T001) — pode ser feita em paralelo com Phase 2
- **US2 (Phase 4)**: depende de Foundational (Phase 2) e consome o snippet gerado por US1 para o teste manual, mas o código de US2 (Route Handler + bundle) já existe desde a Phase 2 — US2 é essencialmente validação
- **US3 (Phase 5)**: depende de Foundational (Phase 2); pode rodar em paralelo com US4
- **US4 (Phase 6)**: depende de Foundational (Phase 2); pode rodar em paralelo com US3
- **US5 (Phase 7)**: depende de Foundational (Phase 2) e de um contrato externo (T028) — pode ficar bloqueada por tempo indeterminado sem travar o lançamento das demais fases
- **Polish (Phase 8)**: depende de todas as user stories desejadas para o release estarem completas

### Parallel Opportunities

- Todas as tarefas [P] da Phase 1 podem rodar em paralelo
- T005, T006, T007 (Phase 2) podem rodar em paralelo; T008 depende de T007; T009 depende de T005+T006+T008
- Phase 3 (US1) pode ser desenvolvida em paralelo com Phase 2, já que não depende dela
- Após Phase 2, Phase 5 (US3) e Phase 6 (US4) podem ser feitas em paralelo por desenvolvedores diferentes
- Phase 7 (US5) pode ser adiada indefinidamente sem impactar o lançamento de US1–US4

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Lançar em paralelo:
Task: "Implementar src/widget/network.ts"
Task: "Implementar src/widget/state.ts"
Task: "Implementar src/widget/styles.ts"
# Depois, sequencialmente:
Task: "Implementar src/widget/render.ts (depende de styles.ts)"
Task: "Implementar src/widget/index.ts (depende de network.ts, state.ts, render.ts)"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bundle + Route Handler funcionando de ponta a ponta)
3. Completar Phase 3: US1 (snippet visível e copiável no admin)
4. Completar Phase 4: US2 (validar em site de teste externo)
5. **PARAR E VALIDAR**: um cliente real consegue colar o snippet e ver o widget funcionando
6. Esse é o ponto mínimo vendável: "envie o script, cole no site, o chat aparece"

### Incremental Delivery

1. Setup + Foundational + US1 + US2 → MVP vendável
2. Adicionar US3 (conversa validada com a base de conhecimento certa) → confiança de produto
3. Adicionar US4 (bloqueio de domínio validado) → segurança confirmada antes de vender a N clientes
4. US5 (customização de aparência) entra quando o contrato de backend (T028) estiver pronto — não bloqueia os clientes iniciais, que usam a aparência padrão

---

## Notes

- [P] = arquivos diferentes, sem dependência entre si
- [Story] mapeia cada tarefa à user story correspondente para rastreabilidade
- T028 (contrato externo de backend) é o único bloqueio verdadeiramente fora do controle deste repositório — todo o resto é executável de ponta a ponta aqui
- Parar em qualquer checkpoint para validar a story isoladamente antes de seguir
