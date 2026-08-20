# Feature Specification: Prompts e Guardrails por Nó (Operational/Institutional/Chitchat)

**Feature Branch**: `edilsonaandrade/edi-42-permitir-associar-guardrails-ao-chitchat_node`
**Created**: 2026-08-20
**Status**: Draft
**Input**: EDI-42 — Permitir associar guardrails ao chitchat_node e ao institutional_node, mantendo o operational_node como destino padrão.

**Revisão (2026-08-20)**: a especificação original assumia que o campo "destino" viveria no `Guardrail`
(`nodes: NodeType[]`). Ao inspecionar a implementação real do backend (`agendamento-ia`,
`specs/003-guardrails-por-no/`, já quase concluída e testada), constatou-se que o modelo adotado foi outro,
mais simples e totalmente reaproveitando a infraestrutura N:N já existente: cada nó passa a ter seu próprio
**Prompt** (`node_type`), e a associação de um guardrail a um nó é simplesmente vincular esse guardrail ao
prompt daquele nó — exatamente como já funcionava para o `operational_node`. Esta especificação foi reescrita
para refletir esse modelo; o frontend adapta-se ao backend, não o contrário.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar/editar um prompt para um nó específico (Priority: P1)

Como usuário administrativo, ao criar ou editar um prompt, quero escolher a qual nó do agente
(`operational`, `institutional` ou `chitchat`) ele pertence, mantendo `operational` como valor padrão — o
comportamento já existente para prompts não é afetado.

**Why this priority**: É a base sobre a qual as demais histórias dependem — sem o campo de nó no prompt, não
há como direcionar guardrails a `institutional`/`chitchat`.

**Independent Test**: Criar um prompt sem alterar o campo de nó e confirmar que ele é salvo com
`node_type: "operational"`, idêntico ao comportamento anterior a esta feature.

**Acceptance Scenarios**:

1. **Given** a tela de criação de prompt, **When** o usuário preenche título/conteúdo e salva sem alterar o
   campo "Nó de Destino", **Then** o prompt é salvo com `node_type: "operational"`.
2. **Given** um prompt existente, **When** o usuário abre para edição, **Then** o campo "Nó de Destino"
   reflete o `node_type` atual do prompt.

---

### User Story 2 - Associar guardrails a um prompt do institutional_node (Priority: P2)

Como usuário administrativo, quero criar/editar um prompt com nó "Institucional" e escolher, no seletor de
guardrails já existente, quais guardrails se aplicam a ele — de forma independente dos guardrails do
`operational_node` do mesmo tenant.

**Why this priority**: É o requisito explícito do ticket EDI-42 para o nó institucional; reaproveita 100% o
seletor N:N de guardrails que já existe no formulário de prompt.

**Independent Test**: Criar um prompt com `node_type: "institutional"`, marcar guardrails nele, e confirmar
que esses guardrails não aparecem associados a nenhum prompt `operational` do mesmo tenant.

**Acceptance Scenarios**:

1. **Given** a tela de criação/edição de prompt, **When** o usuário seleciona "Institucional" como nó e marca
   guardrails no seletor existente, **Then** esses guardrails ficam vinculados apenas ao prompt institucional.
2. **Given** um tenant sem prompt institucional próprio, **When** o administrador consulta o vínculo do nó
   institucional desse tenant, **Then** o sistema mostra o prompt (e guardrails) do `operational_node` desse
   tenant como fallback (comportamento do backend, apenas refletido na tela).

---

### User Story 3 - Associar guardrails a um prompt do chitchat_node (Priority: P3)

Como usuário administrativo, quero criar/editar um prompt com nó "Chitchat" e escolher guardrails para ele,
de forma independente dos demais nós.

**Why this priority**: Completa o escopo do ticket; menor prioridade apenas porque `chitchat_node` é o nó com
menor volume de uso hoje.

**Independent Test**: Criar um prompt com `node_type: "chitchat"`, marcar guardrails nele, e confirmar que
aparecem no card de vínculo do tenant quando o nó "Chitchat" é selecionado na tela de vínculo.

**Acceptance Scenarios**:

1. **Given** a tela de criação/edição de prompt, **When** o usuário seleciona "Chitchat" como nó, **Then** o
   prompt criado só aparece como opção de vínculo quando o nó "Chitchat" está selecionado na tela de
   vínculo de tenant.
2. **Given** um tenant vinculado a um prompt de `chitchat_node`, **When** o administrador visualiza o vínculo
   nesse nó, **Then** vê o prompt e os guardrails específicos desse nó, distintos dos demais.

---

### User Story 4 - Vincular um tenant a um prompt por nó (Priority: P2)

Como usuário administrativo, na tela "Vincular Tenant", quero escolher para qual nó (`operational`,
`institutional` ou `chitchat`) estou criando/consultando o vínculo, já que cada tenant agora tem até 3
vínculos ativos independentes (um por nó) em vez de apenas um.

**Why this priority**: Sem isso, a tela de vínculo continuaria só operando sobre o `operational_node`,
tornando as User Stories 2 e 3 inacessíveis na prática (os prompts institucional/chitchat existiriam, mas
não haveria como vincular um tenant a eles pela UI).

**Independent Test**: Selecionar o nó "Chitchat", buscar um tenant, vincular a um prompt de chitchat, e
confirmar que o vínculo `operational` do mesmo tenant permanece inalterado.

**Acceptance Scenarios**:

1. **Given** a tela de vínculo de tenant, **When** o usuário troca o nó selecionado, **Then** a lista de
   prompts disponíveis é filtrada para mostrar apenas prompts daquele nó.
2. **Given** um tenant já vinculado no `operational_node`, **When** o administrador cria um novo vínculo no
   `chitchat_node` para o mesmo tenant, **Then** o vínculo `operational_node` permanece ativo e inalterado.

---

### Edge Cases

- O que acontece se o usuário tentar vincular, no nó "Institucional", um prompt cujo `node_type` é
  `operational`? Não é possível pela UI — o dropdown de prompts é sempre filtrado pelo nó selecionado.
- Como o sistema trata um prompt criado antes desta feature (sem `node_type` registrado)? O backend aplica
  `DEFAULT 'operational'` na coluna — o prompt aparece como pertencente ao `operational_node`.
- O que acontece se não houver nenhum prompt cadastrado para um nó ao tentar vincular um tenant a ele? A
  tela exibe uma mensagem informando que não há prompt para aquele nó e desabilita o botão de vincular.
- Como a seleção de nó interage com o campo `is_global` de um guardrail? São eixos independentes — um
  guardrail global continua se aplicando a todos os nós automaticamente, sem associação explícita.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela de criação/edição de prompt MUST exibir um campo "Nó de Destino" com as opções
  "Operacional", "Institucional" e "Chitchat", com "Operacional" como valor padrão.
- **FR-002**: O sistema MUST persistir o `node_type` escolhido junto com o prompt, e permitir alterá-lo em
  edições futuras.
- **FR-003**: O seletor de guardrails já existente no formulário de prompt MUST continuar funcionando sem
  alteração de comportamento — associar guardrails a um prompt de qualquer nó usa o mesmo mecanismo N:N.
- **FR-004**: A listagem de prompts MUST exibir, para cada prompt, uma indicação visual do seu `node_type`.
- **FR-005**: A tela "Vincular Tenant" MUST permitir escolher o nó (`operational`, `institutional` ou
  `chitchat`) para o qual o vínculo está sendo consultado ou criado.
- **FR-006**: Ao trocar o nó selecionado na tela de vínculo, o sistema MUST filtrar a lista de prompts
  disponíveis para mostrar apenas os prompts daquele nó.
- **FR-007**: Ao trocar o nó selecionado com um tenant já carregado, o sistema MUST atualizar automaticamente
  o card de vínculo atual para refletir o vínculo daquele nó, sem exigir nova busca manual.
- **FR-008**: O sistema MUST continuar aplicando automaticamente guardrails com `is_global: true` a qualquer
  nó, sem necessidade de associação explícita a um prompt (comportamento inalterado do backend).
- **FR-009**: Prompts criados antes desta feature (sem `node_type` explícito) MUST ser tratados pelo sistema
  como pertencentes ao `operational_node`.

### Key Entities *(include if feature involves data)*

- **Prompt**: template de instrução do assistente; ganha o atributo `node_type`
  (`operational` | `institutional` | `chitchat`), determinando a qual nó do agente pertence. Continua tendo
  seu vínculo N:N pré-existente com `Guardrail`.
- **Guardrail**: regra de conteúdo (título, conteúdo, escopo global/tenant) — **sem alteração de schema**
  nesta feature. Aplica-se a um nó indiretamente, através do(s) prompt(s) daquele nó ao(s) qual(is) está
  vinculado.
- **Vínculo Tenant-Prompt**: relação entre um tenant e o prompt ativo de um nó. Cada tenant passa a ter até 3
  vínculos ativos simultâneos e independentes (um por nó), em vez de apenas 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário administrativo consegue criar um prompt para qualquer um dos 3 nós e associar
  guardrails a ele usando exatamente o mesmo fluxo já conhecido (seletor N:N existente).
- **SC-002**: 100% dos prompts e vínculos existentes antes desta feature continuam funcionando como
  `operational_node`, sem exigir qualquer ação manual de migração.
- **SC-003**: Na tela de vínculo de tenant, o usuário consegue visualizar e gerenciar os vínculos dos 3 nós
  de um mesmo tenant sem sair da tela, apenas trocando o nó selecionado.
- **SC-004**: Vincular um tenant a um prompt de um nó nunca desativa o vínculo ativo dos outros dois nós
  desse mesmo tenant (0% de interferência cruzada).

## Assumptions

- O backend (`agendamento-ia`) implementa `node_type` na tabela `prompts`
  (`operational` | `institutional` | `chitchat`, default `operational`), reaproveitando o N:N
  `prompt_guardrails` já existente — nenhuma mudança de schema em `Guardrail`.
- A cadeia de fallback (`institutional` sem prompt próprio → `operational` ativo do tenant; `chitchat` sem
  prompt próprio → `is_default` do nó → texto fixo) e a tag de substituição de guardrails no conteúdo do
  prompt são responsabilidade do backend; o frontend não precisa validar ou manipular essa tag.
- O campo `is_global` do guardrail continua funcionando exatamente como hoje — eixo independente do
  `node_type` do prompt.
- Os três nós (`operational`, `institutional`, `chitchat`) são fixos nesta feature; não há suporte a criação
  dinâmica de novos nós.
