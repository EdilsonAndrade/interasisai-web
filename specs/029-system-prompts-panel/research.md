# Phase 0 Research: Painel Admin — Prompts do Sistema

## Contexto

Não há `[NEEDS CLARIFICATION]` pendente no `plan.md` — a feature é puramente frontend, o backend já está pronto (endpoints documentados no ticket EDI-71), e o repositório já contém um precedente arquitetural direto (`015-admin-prompt-guardrails`) para decisões de padrão. As pesquisas abaixo consolidam as decisões técnicas com base no código existente.

## Decisão 1: Camada de serviço de API

- **Decision**: Novo arquivo `src/services/systemPrompts.ts` + `src/services/systemPrompts.types.ts`, seguindo exatamente o padrão union-type `{ ok, status, data } | { ok: false, ... }` já usado em `src/services/promptManager.ts`, incluindo `getBaseUrl()` lendo `NEXT_PUBLIC_PYTHON_BACKEND_URL` e `normalizeApiError` de `@/lib/apiError`.
- **Rationale**: Reutilizar um padrão já testado e revisado no mesmo repositório reduz risco e mantém consistência entre features administrativas irmãs. `NEXT_PUBLIC_PYTHON_BACKEND_URL` já está configurada no ambiente (usada por `promptManager.ts` e outros serviços do admin).
- **Alternatives considered**: Criar um cliente HTTP genérico compartilhado entre `promptManager.ts` e o novo serviço — rejeitado por ampliar escopo além do solicitado (refatoração de código existente não pedida) e por risco de regressão em feature já em produção.

## Decisão 2: Rota e navegação

- **Decision**: Nova rota `src/app/[locale]/admin/system-prompts/page.tsx` (Server Component com guard de sessão, mesmo padrão de `admin/prompt-manager/page.tsx`). `AdminNavigation.tsx` é modificado: o item "Painel" passa a abrir um menu com dois links — "Prompts do Sistema" (`/admin/system-prompts`) e "Ingestão Tenant" (`/admin`, inalterado).
- **Rationale**: O BDD do ticket especifica exatamente essa estrutura de menu. A rota `/admin` já é a tela de "Ingestão Tenant" (`AdminDashboard.tsx` — busca de tenant + base de conhecimento), então nenhuma mudança de rota é necessária para preservá-la.
- **Alternatives considered**: Colocar "Prompts do Sistema" como item de topo separado (sem submenu) — rejeitado por não corresponder ao BDD explícito do ticket ("menu Painel com os submenus...").

## Decisão 3: Componente de menu com submenu

- **Decision**: Implementar o dropdown do item "Painel" com estado local (`useState` para aberto/fechado), fechamento ao clicar fora e por tecla Escape, seguindo os mesmos tokens visuais (`bg-surface-base`, `rounded-card`, `border-border-subtle`) já usados em `AdminDialog`. Não há biblioteca de menu/dropdown no projeto — todos os componentes admin são custom (confirmado em `015-admin-prompt-guardrails`/research).
- **Rationale**: Consistência com o restante do painel (sem biblioteca de UI de terceiros) e menor superfície de dependências novas.
- **Alternatives considered**: usar `<details>/<summary>` nativo — rejeitado por menor controle de estilo/acessibilidade fina (foco programático, fechar ao clicar fora) frente ao padrão já usado em `AdminDialog`.

## Decisão 4: Editor de conteúdo do prompt

- **Decision**: `<textarea>` simples controlada (sem preview Markdown, sem `react-markdown`/`rehype-sanitize`), já que os prompts do agente são texto plano/instruções, não Markdown para renderização visual.
- **Rationale**: O ticket EDI-71 não menciona preview Markdown (diferente de `015-admin-prompt-guardrails`, que explicitamente pede editor com preview). Adicionar essa capacidade seria escopo não solicitado.
- **Alternatives considered**: Reutilizar `MarkdownEditorCustom` de `015` — rejeitado por over-engineering; o conteúdo de `routing_agent`/`GROUNDEDNESS_RULE` etc. é prompt de sistema, não documentação Markdown a ser visualizada formatada.

## Decisão 5: Confirmação de rollback

- **Decision**: Reutilizar `AdminDialog` (`src/components/admin/AdminDialog.tsx`) já existente para o diálogo de confirmação "Reverter para versão anterior?".
- **Rationale**: Componente já acessível (`aria-modal`, foco gerenciado, fecha com Escape/backdrop), testado, e evita duplicar lógica de modal.
- **Alternatives considered**: `window.confirm()` nativo — rejeitado por quebrar a identidade visual do painel e por pior acessibilidade/testabilidade.

## Decisão 6: Testes

- **Decision**: Cobertura via Jest + RTL, conforme Constitution IV (não há dispensa do usuário nesta feature, diferente de `015`). `useSystemPrompts.test.ts` com `renderHook`, cobrindo list/save/rollback em sucesso e erro; testes RTL para os componentes visuais principais simulando clique/edição/confirmação.
- **Rationale**: Constitution IV é marcada como NON-NEGOTIABLE no `constitution.md` do projeto; a ausência de testes em `015` foi uma exceção explícita solicitada pelo usuário naquele ticket, não um precedente geral.
- **Alternatives considered**: Seguir o precedente de `015` e pular testes — rejeitado por não haver pedido explícito do usuário nesta conversa para omiti-los.

## Resumo

Nenhuma incerteza técnica restante. Todas as decisões reaproveitam padrões já estabelecidos e validados no repositório (`015-admin-prompt-guardrails`), com o escopo reduzido às necessidades específicas do EDI-71 (4 prompts fixos, edição + rollback, sem CRUD completo, sem N:N, sem preview Markdown).
