# Phase 0 Research: Busca de Tenant e Gestão da Base de Conhecimento

Não há marcadores `NEEDS CLARIFICATION` no Technical Context — o stack e os endpoints já estão confirmados (ver [contracts/admin-api-contract.md](contracts/admin-api-contract.md) e as Assumptions do [spec.md](spec.md)). Este documento registra as decisões técnicas tomadas ao investigar o código existente antes do desenho (Phase 1).

## Decisão 1: Onde implementar os novos endpoints

**Decision**: Estender `src/services/pythonBackend.ts` (não criar um novo arquivo de serviço).

**Rationale**: Os seis endpoints do contrato (`/tenants?q=`, `/tenants/{id}`, `/prompt-manager/tenant/{id}`, `/tenants/{id}/knowledge-base` × 3) já são servidos pela mesma base URL (`NEXT_PUBLIC_PYTHON_BACKEND_URL`) consumida por `pythonBackend.ts` — confirmado por `getTenantById`/`createTenant`/`updateTenant`/`deleteTenant` (tenants) e por `fetchTenantPromptDetail` em `promptManager.ts`, que chama `${NEXT_PUBLIC_PYTHON_BACKEND_URL}/api/v1/prompt-manager/tenant/{id}`. Como `pythonBackend.ts` já possui `Tenant`, `TenantOperationResult` e o helper `requestTenant`, os novos endpoints de busca e base de conhecimento (ambos sob `/tenants/...`) se encaixam naturalmente nesse arquivo, em vez de fragmentar a integração com tenants em dois serviços.

**Alternatives considered**:
- Novo arquivo `knowledgeBase.ts` dedicado (padrão usado por `promptManager.ts` para seu próprio domínio) — rejeitado porque a base de conhecimento é uma sub-rota de `/tenants/{id}`, não um domínio próprio como prompts/guardrails; manter em `pythonBackend.ts` evita duplicar o helper de request e o tratamento de erro já existentes para tenants.

## Decisão 2: Reaproveitar `fetchTenantPromptDetail` sem duplicar

**Decision**: Reaproveitar `fetchTenantPromptDetail` (`promptManager.ts`) tal como está; apenas estender o tipo `TenantPromptDetail` com o novo campo `is_default_prompt: boolean`.

**Rationale**: FR-025/FR-028 do spec exigem isso explicitamente. A função já implementa exatamente a chamada `GET /prompt-manager/tenant/{tenant_id}` que o contrato descreve como "ALTERADO" (mudança de comportamento no backend, não de contrato de request) — nenhuma mudança de assinatura é necessária no frontend, só o novo campo na resposta.

**Observação fora de escopo**: `useTenantLink.ts` (tela `/admin/prompt-manager`, aba "Vincular Tenant") hoje trata `status === 404` como "tenant sem vínculo ainda" (ver comentário em `useTenantLink.ts:70-76`). O novo contrato torna esse 404 impossível para esse caso — agora ele só ocorre quando o tenant realmente não existe. Esse hook pertence à feature 015 e a uma tela diferente da que esta feature (017) modifica; corrigi-lo está fora do escopo aqui, mas fica registrado como uma inconsistência a ser tratada por uma manutenção futura da feature 015.

## Decisão 3: Cartão de contexto (prompt/guardrails) — novo componente, sem extrair um compartilhado

**Decision**: Criar `TenantContextCard.tsx` como um componente novo e independente, em vez de extrair um componente compartilhado a partir do cartão "Vínculo Atual" já existente em `TenantLinkSection.tsx`.

**Rationale**: O cartão em `TenantLinkSection.tsx` é parte de um formulário ativo (tem botão de limpar, é pré-preenchido para edição, referencia campos do formulário React Hook Form). O cartão desta feature é puramente de leitura, sem ações de edição. Extrair um componente compartilhado agora acopla duas telas por um componente de apresentação pequeno (menos de 40 linhas de JSX) cujo comportamento diverge o suficiente (props, ações, contexto) para que a extração custe mais em indireção do que economiza em duplicação — ver diretriz do projeto contra abstração prematura. Ambos consomem o mesmo tipo (`TenantPromptDetail`) e a mesma função de serviço, então a duplicação real é apenas de marcação visual, não de lógica.

**Alternatives considered**: Extrair `PromptGuardrailSummary.tsx` compartilhado — descartado por over-engineering para o tamanho do bloco duplicado; pode ser revisitado se um terceiro consumidor aparecer.

## Decisão 4: Remoção do fluxo de ingestão legado

**Decision**: Remover `IngestForm.tsx`, `useAdminIngest.ts` (+ seu teste) e `ingestKnowledge`/`IngestRequest`/`IngestResult`/`IngestSuccessResponse`/`IngestErrorResponse` de `pythonBackend.ts`/`pythonBackend.types.ts`, junto com seus exports em `src/services/index.ts`.

**Rationale**: Busca confirmou que `AdminDashboard.tsx` é o único consumidor de `IngestForm`/`useAdminIngest`, e `useAdminIngest.ts` é o único consumidor de `ingestKnowledge`. O novo endpoint de upsert (`PUT /tenants/{tenant_id}/knowledge-base`) cobre completamente o caso de uso de "adicionar conteúdo novo" que `POST /api/v1/ingest/text` atendia nesta tela — manter os dois caminhos ativos duplicaria a forma de escrever a base de conhecimento de um tenant e violaria a Constitution III (DRY). Ver Assumption correspondente no spec.

**Alternatives considered**: Manter `ingestKnowledge` como fallback — descartado; nenhuma US do spec pede a coexistência dos dois fluxos, e o contrato trata a base de conhecimento como um único documento por tenant, tornando o endpoint antigo redundante para esta tela.

## Decisão 5: Autenticação Bearer/JWT — confirmação da decisão já tomada

**Decision**: Nenhuma chamada desta feature anexa `Authorization: Bearer <admin JWT>`. Fica documentado apenas como comentário/observação nos pontos de chamada de `pythonBackend.ts`, sem código de autenticação.

**Rationale**: Decisão explícita do usuário durante `/speckit.specify` (ver Assumptions do spec e FR-021/FR-022): o gate atual de `/admin` é a sessão de cookie por credenciais de ambiente; a emissão de JWT para o backend é escopo de uma feature futura de login administrativo. Se o backend passar a rejeitar (401) essas chamadas antes dessa feature futura, o comportamento observável é uma falha genérica de operação (FR-022) — já coberto pelo tratamento de erro padrão do union type, sem necessidade de tratamento especial agora.

## Decisão 6: Padrão de busca — envio explícito, não busca incremental (debounce)

**Decision**: A busca de tenant é disparada por um envio explícito (botão "Buscar" ou Enter), não por busca incremental conforme o usuário digita.

**Rationale**: Consistente com o padrão já usado em `TenantLookupForm.tsx` e `TenantLinkSection.tsx` (ambos com botão "Buscar" explícito) e com as Acceptance Scenarios do spec (US1, cenário 1: "informa um termo... e aciona 'Buscar'"). Busca incremental exigiria debounce, cancelamento de requisições concorrentes e testes adicionais não pedidos pelo spec — escopo maior sem requisito correspondente.

**Alternatives considered**: Busca incremental com debounce — descartada por não ser exigida pelo spec e aumentar a superfície de testes sem benefício claro para um painel administrativo de baixo volume de uso.
