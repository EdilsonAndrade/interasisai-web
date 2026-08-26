# Feature Specification: Limite de mensagens por tenant — UI Admin (EDI-63)

**Feature Branch**: `edilsonaandrade/edi-63-limite-de-mensagens-por-tenant-mensal-flag-byok-com-chave-de`
**Created**: 2026-08-25
**Status**: Draft
**Input**: User description: "Parte de frontend do EDI-63 — o backend (repo agendamento-ia, specs/010-tenant-message-limit) já está pronto. Falta a UI admin: configurar `monthly_message_limit`/`notification_emails` no cadastro/edição de tenant, indicador visual de consumo do mês, tela de Configurações Globais para `global_notification_recipients`, e a calculadora de dimensionamento de plano."

## Contexto (backend já pronto)

Endpoints confirmados em `app/api/v1/endpoints/tenant.py` e `app/api/v1/endpoints/global_notification_recipients.py` (repo `agendamento-ia`, branch `edilsonaandrade/edi-63-...`):

- `POST /tenants/` e `PUT /tenants/{tenant_id}` aceitam `monthly_message_limit: int | null` e `notification_emails: string[]` (validado como e-mail, `422` se malformado).
- `GET /tenants/{tenant_id}` devolve os mesmos campos em `TenantResponse`.
- `GET /tenants/{tenant_id}/usage` → `{ tenant_id, monthly_message_limit, current_month_calls, percentage_used, blocked }` — `percentage_used`/`monthly_message_limit` são `null` quando o tenant não tem limite configurado.
- `GET /tenants/message-limit-config` → `{ worst_case_calls_per_message, average_calls_per_message }` (hoje 3 e 3.0) — base da calculadora e da dica ao lado do campo de limite.
- `GET/POST/PUT/DELETE /global-notification-recipients/` → CRUD de `{ id, email, active, created_at }`; `POST` duplicado devolve `409 EMAIL_ALREADY_EXISTS`; `PUT`/`DELETE` em id inexistente devolve `404`.

Esta spec cobre **somente** o consumo desses endpoints no admin do `interasisai-web` (Next.js). Não há trabalho de backend nem de fluxo de agente aqui.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin configura limite e e-mails, e acompanha o consumo do tenant (Priority: P1)

Na tela de cadastro/edição de tenant (`TenantForm`, hoje com `name`, `google_calendar_id`, `allowed_domains`, `scheduling_enabled`), o admin passa a poder definir `monthly_message_limit` (opcional) e gerenciar uma lista de `notification_emails` (adicionar/remover múltiplos e-mails). Na tela de detalhes do tenant (`TenantDetails`), um indicador mostra o consumo atual do mês (mensagens usadas / limite / %), com cor verde (<50%), amarela (50-80%) ou vermelha (≥80%) — e um estado explícito de "sem limite configurado" quando `monthly_message_limit` é `null`.

**Why this priority**: é o valor central desta fatia de UI — sem isso, o limite e os e-mails só podem ser configurados via chamada direta à API, sem visibilidade de consumo para o time comercial/suporte.

**Independent Test**: abrir a tela de edição de um tenant, configurar `monthly_message_limit` e adicionar/remover e-mails de `notification_emails`, salvar, reabrir e confirmar que os valores persistiram; abrir a tela de detalhes de um tenant com uso real e confirmar que o indicador reflete `GET /tenants/{id}/usage`.

**Acceptance Scenarios**:

1. **Given** o formulário de edição de um tenant, **When** o admin define `monthly_message_limit = 500` e salva, **Then** o `PUT /tenants/{id}` é chamado com o valor e a tela reflete o valor salvo após sucesso.
2. **Given** o formulário de edição de um tenant, **When** o admin adiciona dois e-mails a `notification_emails` e remove um terceiro já existente, **Then** a lista final enviada no `PUT` reflete exatamente as adições/remoções feitas na tela.
3. **Given** o admin digita um e-mail em formato inválido em `notification_emails`, **When** tenta salvar, **Then** a validação de formulário bloqueia o envio antes da chamada à API (mesmo padrão de validação client-side já usado em `tenantSchemas.ts`), com mensagem de erro específica no campo.
4. **Given** um tenant com `current_month_calls = 156` e `monthly_message_limit = 500` (31%), **When** o admin visualiza a tela de detalhes, **Then** vê "156 / 500 (31%)" com destaque visual verde.
5. **Given** um tenant com uso ≥80% do limite, **When** o admin visualiza a tela de detalhes, **Then** o indicador aparece em vermelho.
6. **Given** um tenant sem `monthly_message_limit` configurado, **When** o admin visualiza a tela de detalhes, **Then** o indicador mostra um estado "sem limite configurado" (sem barra de progresso, sem cor de alerta), sem erro.
7. **Given** a chamada a `GET /tenants/{id}/usage` falha (erro de rede/servidor), **When** a tela de detalhes carrega, **Then** o restante dos dados do tenant continua visível e o indicador de consumo mostra um estado de erro/indisponível, sem quebrar a tela.

---

### User Story 2 - Admin gerencia a lista global de destinatários de alerta (Priority: P2)

Uma nova tela/seção de "Configurações Globais" dentro da área admin lista os `global_notification_recipients` (e-mails internos da InterasisAI que recebem todo alerta de 100% de bloqueio de qualquer tenant), permitindo adicionar um novo e-mail, ativar/desativar (sem apagar) e remover um existente.

**Why this priority**: importante para o time interno acompanhar bloqueios, mas não bloqueia o valor da US1 (configuração por tenant já funciona sem essa tela, usando o fallback `contato@interasisai.com.br`).

**Independent Test**: abrir a tela de Configurações Globais, adicionar um e-mail, confirmar que aparece na lista; tentar adicionar um e-mail já existente e confirmar que a UI mostra o erro `409` de forma clara; desativar um e-mail e confirmar que o estado `active` muda sem remover o registro; remover um e-mail e confirmar que desaparece da lista.

**Acceptance Scenarios**:

1. **Given** a tela de Configurações Globais, **When** o admin adiciona um novo e-mail válido, **Then** `POST /global-notification-recipients/` é chamado e o novo item aparece na lista com `active = true`.
2. **Given** um e-mail já cadastrado, **When** o admin tenta adicioná-lo novamente, **Then** a UI exibe uma mensagem de erro específica (não genérica) refletindo o `409 EMAIL_ALREADY_EXISTS` do backend, sem duplicar o item na lista.
3. **Given** um e-mail ativo na lista, **When** o admin o desativa, **Then** `PUT /global-notification-recipients/{id}` é chamado com `active: false` e o item permanece na lista com indicação visual de inativo.
4. **Given** um e-mail na lista, **When** o admin o remove, **Then** `DELETE /global-notification-recipients/{id}` é chamado e o item desaparece da lista.
5. **Given** a lista está vazia, **When** o admin visualiza a tela, **Then** vê uma indicação explícita de que a lista está vazia e que o fallback `contato@interasisai.com.br` está em uso.

---

### User Story 3 - Time comercial usa a calculadora de dimensionamento de plano (Priority: P3)

Uma calculadora (independente da edição de um tenant específico, acessível na área admin) permite informar um número de chamadas de LLM (candidato a `monthly_message_limit`) e escolher um cenário — "pior caso" (usa `worst_case_calls_per_message` de `GET /tenants/message-limit-config`) ou "médio" (usa `average_calls_per_message`, com opção de o admin sobrescrever o valor) — calculando ao vivo a estimativa de mensagens reais de clientes finais correspondente. Nada é persistido; é uma ferramenta de simulação.

**Why this priority**: útil para o time comercial dimensionar planos vendidos, mas não bloqueia o enforcement nem a configuração básica das US1/US2.

**Independent Test**: abrir a calculadora, informar 1000 chamadas no cenário "pior caso" (razão 3) e confirmar que mostra ~333 mensagens reais; trocar para "médio" e confirmar que o valor recalcula sem exigir nenhum salvamento.

**Acceptance Scenarios**:

1. **Given** a calculadora carregada (com `worst_case_calls_per_message`/`average_calls_per_message` vindos de `GET /tenants/message-limit-config`), **When** o admin informa 1000 chamadas de LLM no cenário "pior caso", **Then** a tela exibe a estimativa `1000 / worst_case_calls_per_message` mensagens reais, arredondada de forma clara (ex.: "≈ 333 mensagens").
2. **Given** a mesma calculadora, **When** o admin troca para o cenário "médio", **Then** a estimativa recalcula usando `average_calls_per_message`, instantaneamente, sem chamada de rede adicional nem botão de salvar.
3. **Given** o campo de número de chamadas de LLM, **When** o admin apaga o valor ou informa um número negativo/zero, **Then** a calculadora não exibe uma estimativa inválida (ex.: divisão por zero, número negativo) — mostra um estado vazio/neutro.
4. **Given** o campo de `monthly_message_limit` no formulário de tenant (US1), **When** o admin preenche um valor, **Then** a UI exibe ao lado uma dica com a mesma estimativa da calculadora (reaproveitando `GET /tenants/message-limit-config`), deixando claro que o limite é contado por chamada de LLM, não por mensagem real (FR-013a do backend).

---

### Edge Cases

- Tenant recém-criado, ainda sem nenhuma chamada de LLM no mês: `GET /tenants/{id}/usage` devolve `current_month_calls = 0`; o indicador deve mostrar "0 / limite (0%)" em verde, não um estado de erro.
- `notification_emails` vazio ao salvar: a UI deve permitir salvar sem nenhum e-mail (campo é opcional, ver FR-002 do backend) — não travar o formulário exigindo ao menos um e-mail.
- Removido o único e-mail de `notification_emails` durante a edição: o admin deve conseguir salvar a lista vazia normalmente (equivalente a "remover todos os avisos deste tenant").
- `GET /tenants/message-limit-config` falha ao carregar: a calculadora e a dica ao lado do campo de limite devem degradar graciosamente (ex.: ocultar a estimativa, sem quebrar o restante do formulário).
- Dois admins editando o mesmo tenant simultaneamente: fora de escopo desta feature (mesmo comportamento de "último a salvar vence" já existente no `TenantForm` atual, não é regressão introduzida aqui).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de criação/edição de tenant DEVE incluir um campo opcional para `monthly_message_limit` (inteiro positivo ou vazio/null).
- **FR-002**: O formulário de criação/edição de tenant DEVE incluir um editor de lista para `notification_emails` (adicionar/remover múltiplos e-mails), validando formato de e-mail no client antes do envio.
- **FR-003**: Ao salvar, o formulário DEVE enviar `monthly_message_limit` e `notification_emails` em `POST /tenants/` (criação) e `PUT /tenants/{id}` (edição), seguindo o mesmo padrão de erro de campo (`fieldErrors`) já usado para os demais campos do tenant.
- **FR-004**: A tela de detalhes do tenant DEVE consumir `GET /tenants/{id}/usage` e exibir `current_month_calls`, `monthly_message_limit` e `percentage_used` de forma legível (ex.: "156 / 500 mensagens (31%)").
- **FR-005**: O indicador de consumo DEVE aplicar destaque visual verde (<50%), amarelo (50-80%) e vermelho (≥80%), e um estado neutro/"sem limite" quando `monthly_message_limit` é `null`.
- **FR-006**: Uma nova tela/seção "Configurações Globais" DEVE listar, criar, ativar/desativar e remover `global_notification_recipients`, consumindo o CRUD `GET/POST/PUT/DELETE /global-notification-recipients/`.
- **FR-007**: A criação de um destinatário global duplicado DEVE exibir a mensagem de erro específica do `409 EMAIL_ALREADY_EXISTS`, não uma mensagem de erro genérica.
- **FR-008**: A área admin DEVE oferecer uma calculadora de dimensionamento de plano, consumindo `GET /tenants/message-limit-config` para os valores de referência (`worst_case_calls_per_message`, `average_calls_per_message`), calculando ao vivo (sem chamada de rede adicional por interação) a estimativa de mensagens reais a partir de um número de chamadas de LLM informado.
- **FR-009**: O campo `monthly_message_limit` do formulário de tenant DEVE exibir, ao lado, uma dica com a estimativa de mensagens reais correspondente (reaproveitando os mesmos valores de `GET /tenants/message-limit-config`), deixando claro que a contagem é por chamada de LLM.
- **FR-010**: Falha ao carregar `GET /tenants/{id}/usage` ou `GET /tenants/message-limit-config` NÃO DEVE bloquear a renderização do restante da tela — cada um desses blocos degrada isoladamente (estado de erro/indisponível local).

### Key Entities *(include if feature involves data)*

- **Tenant** (já existente no frontend, `Tenant`/`TenantCreateInput` em `pythonBackend.types.ts`): ganha `monthly_message_limit: number | null` e `notification_emails: string[]`.
- **Tenant Usage** (novo, `GET /tenants/{id}/usage`): `{ tenant_id, monthly_message_limit, current_month_calls, percentage_used, blocked }`.
- **Tenant Message Limit Config** (novo, `GET /tenants/message-limit-config`): `{ worst_case_calls_per_message, average_calls_per_message }`.
- **Global Notification Recipient** (novo, CRUD próprio): `{ id, email, active, created_at }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um admin configura `monthly_message_limit` e `notification_emails` de um tenant e vê o resultado persistido ao reabrir a tela, sem precisar de acesso direto à API/banco.
- **SC-002**: O indicador de consumo do mês reflete corretamente os três estados de cor (verde/amarelo/vermelho) e o estado "sem limite", validado com dados reais de `GET /tenants/{id}/usage`.
- **SC-003**: Um e-mail interno pode ser adicionado, desativado e removido da lista global sem necessidade de acesso direto à API/banco, e duplicatas são rejeitadas com mensagem clara.
- **SC-004**: A calculadora de dimensionamento produz uma estimativa correta (chamadas ÷ razão do cenário) para qualquer combinação válida de entrada, recalculando sem round-trip ao servidor.
- **SC-005**: Falha em qualquer uma das duas chamadas de leitura auxiliares (`usage`, `message-limit-config`) não impede o admin de visualizar/editar os demais dados do tenant.

## Assumptions

- O backend (repo `agendamento-ia`, branch `edilsonaandrade/edi-63-...`) está funcionalmente pronto para os endpoints listados em "Contexto" — esta spec não reabre discussão de contrato, só consome o que já existe. Qualquer divergência encontrada durante a implementação (campo ausente, formato diferente do documentado aqui) deve ser validada contra o código real do backend antes de prosseguir, não contra esta spec.
- Cores de destaque (verde/amarelo/vermelho) seguem os tokens de tema já definidos em `src/theme/design-tokens.ts`, sem introduzir uma nova paleta.
- A tela de "Configurações Globais" é nova na navegação admin (`AdminNavigation.tsx`); a decisão exata de onde ela entra no menu fica para `/speckit.plan`.
- Fora de escopo: qualquer alteração no fluxo de bloqueio/enforcement do agente, envio de e-mails, ou no reset mensal do contador — tudo isso já é backend (EDI-63/EDI-64) e não depende de nenhuma ação da UI.
