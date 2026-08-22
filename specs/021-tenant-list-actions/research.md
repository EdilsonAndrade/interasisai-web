# Research: Exclusão com confirmação de impacto, edição e atalho WhatsApp

**Input**: `specs/021-tenant-list-actions/spec.md` | **Ticket**: EDI-46 (depende de EDI-45, backend em paralelo)

Nenhum item ficou marcado como `NEEDS CLARIFICATION` no plano — as decisões abaixo já estavam resolvidas por convenção existente no repositório ou foram fechadas com o usuário durante o `/speckit.specify`.

## 1. Escopo da "lista de tenants" (item A do ticket)

**Decision**: a feature aprimora a tela de consulta por ID já existente (`TenantManagement.tsx` → `TenantDetails.tsx`), que hoje retorna e exibe um tenant por vez. Não será construída uma tabela com todos os tenants simultaneamente.

**Rationale**: não existe endpoint de listagem em massa no escopo do backend (EDI-45 só define `GET /tenants/{id}/delete-impact` e a orquestração de `DELETE /tenants/{id}`). Confirmado diretamente com o usuário antes da escrita da spec.

**Alternatives considered**: construir uma tabela nova — rejeitada por depender de um endpoint que não existe e não está no escopo desta feature.

## 2. Onde expor o resumo de impacto de exclusão no frontend

**Decision**: nova função `fetchTenantDeleteImpact(tenantId, signal)` em `src/services/pythonBackend.ts` (mesmo arquivo que já expõe `deleteTenant`, `getTenantById` etc.), com tipos novos em `pythonBackend.types.ts`. Reaproveita o padrão existente: `normalizeApiError` + variante de falha compatível com `TenantOperationFailure`.

**Rationale**: o endpoint (`GET /tenants/{id}/delete-impact`) pertence ao domínio de tenant, não ao prompt-manager — mesma base de URL (`NEXT_PUBLIC_PYTHON_BACKEND_URL`) e mesmo padrão de erro já usado por `getTenantById`/`deleteTenant`. Criar o serviço em `promptManager.ts` misturaria domínios sem necessidade.

**Alternatives considered**: expor via `promptManager.ts` — rejeitada, o endpoint não é prefixado por `/prompt-manager` nem lida com prompts/guardrails como entidade própria, só como leitura agregada do lado do tenant.

## 3. Onde guardar o estado do resumo de impacto (loading/dado/erro)

**Decision**: hook novo `useTenantDeleteImpact.ts`, independente de `useTenantManagement`, com `fetchImpact(tenantId)`, `impact`, `state` (`idle|loading|loaded|error`), `error`, e `clear()`.

**Rationale**: mantém `useTenantManagement` focado em CRUD (padrão já usado para separar `useTenantPromptBinding` do CRUD do tenant no EDI-44). O modal de exclusão consome os dois hooks via `TenantManagement.tsx`, sem acoplar a lógica de impacto ao hook de CRUD.

**Alternatives considered**: estender `useTenantManagement.remove()` para buscar o impacto antes de excluir — rejeitada, misturaria dois estados de operação distintos (`operation === "delete"` já é usado para a exclusão em si) e dificultaria testar cada hook isoladamente.

## 4. Como exibir prompts dos três `node_type` no card do tenant

**Decision**: hook novo `useTenantNodePrompts.ts` que chama `fetchTenantPromptDetail(tenantId, nodeType)` (já existente em `promptManager.ts`) uma vez para cada um de `operational`, `institutional`, `chitchat`, em paralelo (`Promise.all`), devolvendo um mapa por `node_type` com o mesmo formato de estado já usado por `useTenantPromptBinding` (`idle|loading|linked|missing|error`).

**Rationale**: o endpoint já aceita `node_type` como parâmetro opcional — só falta chamá-lo para os três tipos. `useTenantPromptBinding` (operacional) permanece intocado porque já cobre o fluxo obrigatório de correção in-place (EDI-44); os outros dois tipos são exibição somente-leitura, sem o CTA de "vincular prompt" que só se aplica ao operacional.

**Alternatives considered**: unificar tudo em `useTenantPromptBinding` com um parâmetro de node_type — rejeitada, misturaria o fluxo obrigatório/corrigível (operacional) com a exibição simples (institucional/chitchat), quebrando o princípio de responsabilidade única do hook.

## 5. Badge visual para guardrails globais

**Decision**: reaproveitar `GuardrailScopeBadge.tsx` (já existe, criado no EDI-44) tanto na seção de guardrails do card do tenant (`TenantPromptBindingCard.tsx`, hoje sem badge) quanto nas listas do modal de resumo de impacto.

**Rationale**: já é o "single source of truth" para esse indicador no projeto (substituiu variações divergentes em outros componentes). Criar um badge novo duplicaria lógica que a Constituição (Princípio III — DRY/Componentização) proíbe.

**Alternatives considered**: nenhuma — o componente já resolve exatamente este requisito.

## 6. Confirmação por nome exato

**Decision**: comparação exata e sensível a maiúsculas/minúsculas entre o texto digitado (após `trim()` apenas do valor digitado) e `tenant.name` tal como exibido. Nenhuma normalização adicional (acentos, espaços internos) é aplicada.

**Rationale**: o ticket pede "nome exato" como prova deliberada de leitura/atenção — normalizar demais enfraquece essa garantia. `trim()` do digitado evita frustração com espaço à direita/esquerda sem abrir mão da exatidão do conteúdo.

**Alternatives considered**: comparação case-insensitive — rejeitada, reduz a fricção intencional que o ticket pede.

## 7. Atalho para WhatsApp com pré-preenchimento

**Decision**: navegação via `router.push` com query string (`/admin/whatsapp?tenantId=...&instanceName=...`) a partir de `TenantDetails.tsx`. `WhatsAppInstanceForm.tsx` passa a ler `useSearchParams()` (Next.js) e usar os valores como `defaultValues` do `react-hook-form`, permanecendo editável.

**Rationale**: a tela de WhatsApp já é uma rota própria (`/admin/whatsapp`) sem suporte a valores iniciais externos — query string é o mecanismo padrão do Next.js App Router para isso, sem exigir Context novo nem mudança de arquitetura (Princípio II da Constituição: Context só para estado verdadeiramente global).

**Alternatives considered**: Context compartilhado entre as páginas de tenant e whatsapp — rejeitada, over-engineering para passar dois valores primitivos entre duas navegações independentes.

## 8. Modal de exclusão: reaproveitar `AdminDialog`

**Decision**: `TenantDeleteDialog.tsx` continua usando `AdminDialog` (já trata Esc/backdrop/foco/loading-disabled). Apenas o conteúdo interno muda: seções de resumo de impacto + campo de confirmação por nome.

**Rationale**: `AdminDialog` já implementa exatamente o comportamento exigido por FR-005 (fechar sem efeito colateral) — não há necessidade de um componente de modal novo.

**Alternatives considered**: nenhuma — reuso direto.

## 9. Sequenciamento com o backend (EDI-45 em paralelo)

**Decision**: implementação e testes seguem o contrato de API documentado no EDI-45 (tratado como estável). A verificação manual contra o backend real acontece só ao final, via `quickstart.md`, quando o backend estiver disponível — instrução explícita do usuário ao abrir esta feature.

**Rationale**: já é o padrão usado no EDI-44/EDI-43 (ver `specs/020-tenant-prompt-binding/plan.md`, seção "Riscos e mitigações") — testes mockam o contrato acordado, divergência aparece na verificação manual, não em produção.

**Alternatives considered**: bloquear o frontend até o backend estar pronto — rejeitado explicitamente pelo usuário.

## 10. Pivô: grid de todos os tenants (US4, adicionado após a implementação inicial)

**Contexto**: a decisão do item 1 (escopo da "lista de tenants" = tela de consulta por ID) foi revertida depois que o backend disponibilizou um endpoint dedicado de listagem em massa, `GET /tenants/list`, respondendo à pergunta original do ticket ("Lista de tenants" — item A do EDI-46).

**Decision**: novo endpoint `GET /tenants/list` (`{items, total}`, `q` opcional, `limit`/`offset`) consumido por uma função de serviço nova e separada, `listTenants()` em `pythonBackend.ts` — **sem tocar** em `searchTenants()` (que continua em `GET /tenants`, array puro, `q` obrigatório, usado pela busca de tenant da Base de Conhecimento em `useTenantSearch`/`AdminDashboard`).

**Rationale**: o backend confirmou que `GET /tenants` foi 100% revertido ao contrato original — a preocupação levantada (mudar o envelope de resposta de um endpoint já consumido por outra feature) foi resolvida criando um endpoint novo (`/tenants/list`) em vez de reformar o existente. Duas funções de serviço separadas espelham essa separação de contratos e evitam qualquer risco cruzado entre as duas features.

**Layout**: o grid (só ID + nome, por decisão explícita do usuário — os campos `prompts`/`guardrails` do contrato existem na resposta mas não são renderizados no grid) fica **sempre visível** acima da seção "Consultar por ID"; clicar em uma linha chama `management.lookup(id)` — o mesmo caminho que a busca manual usa — preenchendo o card de detalhe abaixo sem esconder o grid.

**Paginação**: botões "Anterior"/"Próxima" com `limit=20` fixo (padrão do contrato), via `offset`. Rejeitadas: scroll infinito e "carregar tudo de uma vez" — decisão explícita do usuário pela opção mais simples e mais alinhada ao contrato (`limit`/`offset` já são paginação de página fixa, não de scroll).

**Sincronização com CRUD**: após criar, editar ou excluir um tenant com sucesso, a página atual do grid é rebuscada (`grid.fetchPage(grid.offset)`) para refletir a mudança — sem isso, um tenant excluído continuaria aparecendo na lista até um refresh manual.

**Alternatives considered**: reformar `searchTenants`/`GET /tenants` para o novo envelope — rejeitada pelo próprio backend, por quebrar o consumidor existente da Base de Conhecimento.
