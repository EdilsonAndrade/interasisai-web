# Feature Specification: Exclusão com confirmação de impacto, edição e atalho WhatsApp na tela de tenant

**Feature Branch**: `edilsonaandrade/edi-46-frontend-tela-de-tenants-exclusao-com-confirmacao-de-impacto`
**Created**: 2026-08-22
**Status**: Draft
**Ticket**: [EDI-46](https://linear.app/edilsonandrade/issue/EDI-46/frontend-tela-de-tenants-exclusao-com-confirmacao-de-impacto-edicao-e) — depende de [EDI-45](https://linear.app/edilsonandrade/issue/EDI-45/backend-exclusao-segura-de-tenant-com-desvinculoexclusao-em-cascata-de) (backend, em desenvolvimento em paralelo)

**Input**: Complemento de UI do EDI-45. Hoje excluir um tenant é uma ação simples e irreversível, sem mostrar ao administrador o que realmente vai acontecer com os prompts e guardrails vinculados a ele. Esta feature adiciona uma confirmação de impacto antes da exclusão, um atalho para configurar WhatsApp a partir do tenant, e reforça a visibilidade de prompts/guardrails (com destaque para os globais) na tela do tenant já existente.

**Nota de sequenciamento**: o backend do EDI-45 (endpoints de impacto e exclusão orquestrada) está em desenvolvimento em paralelo. Este trabalho de frontend segue com o contrato de API já definido no EDI-45 como fonte da verdade; a validação de integração ponta a ponta acontece quando o backend estiver disponível.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Excluir tenant sem surpresas (Priority: P1)

O administrador quer excluir um tenant. Antes de qualquer coisa acontecer de verdade, ele vê um resumo claro do que vai ser excluído de fato (prompts e guardrails exclusivos daquele tenant) e do que vai apenas ser desvinculado (itens compartilhados com outros tenants ou globais). Só depois de digitar o nome exato do tenant — prova de que leu o resumo e tem certeza — o botão de confirmar libera. Cancelar ou fechar a janela (Esc) não muda nada.

**Why this priority**: exclusão é destrutiva e hoje não tem rede de segurança nenhuma. É o núcleo do ticket e o que mais protege contra erro humano com maior custo (perda de dados de configuração de clientes).

**Independent Test**: abrir o fluxo de exclusão de um tenant com prompts/guardrails mistos (alguns exclusivos, alguns compartilhados/globais) e verificar que (a) o resumo mostra os dois grupos separadamente, (b) o botão de confirmar só habilita com o nome certo digitado, (c) cancelar/Esc não altera nada, (d) confirmar dispara a exclusão e informa sucesso ou erro.

**Acceptance Scenarios**:

1. **Given** o administrador clica em "Excluir" no tenant, **When** o resumo de impacto é carregado, **Then** o modal mostra separadamente: prompts que serão excluídos, prompts que serão apenas desvinculados, guardrails que serão excluídos, guardrails que serão apenas desvinculados — cada grupo com os itens nomeados.
2. **Given** o modal de confirmação aberto, **When** o administrador ainda não digitou o nome do tenant (ou digitou errado), **Then** o botão "Confirmar" permanece desabilitado.
3. **Given** o administrador digita o nome exato do tenant, **When** o texto bate com o nome exibido, **Then** o botão "Confirmar" habilita.
4. **Given** o modal de confirmação aberto, **When** o administrador clica "Cancelar" ou pressiona Esc, **Then** o modal fecha e nenhuma alteração ocorre no tenant, prompts ou guardrails.
5. **Given** o nome confirmado corretamente, **When** o administrador clica "Confirmar", **Then** o sistema mostra estado de carregamento e, ao final, uma mensagem de sucesso ou de erro — nunca fica em silêncio.
6. **Given** um prompt exclusivo do tenant e um guardrail global associado a ele, **When** o resumo de impacto é exibido, **Then** o prompt aparece no grupo "será excluído" e o guardrail aparece no grupo "será apenas desvinculado" — avaliados de forma independente, nunca como tudo-ou-nada.
7. **Given** a busca do resumo de impacto falha (erro de rede/backend), **When** o administrador tenta excluir, **Then** o sistema mostra o erro e não libera o campo de confirmação por nome — nunca permite excluir sem ter mostrado o impacto real.

---

### User Story 2 - Ver prompts e guardrails do tenant com destaque para os globais (Priority: P2)

Ao consultar um tenant, o administrador vê quais prompts estão vinculados a ele (por tipo: operacional, institucional, chitchat) e quais guardrails cada um usa. Guardrails globais — que afetam a plataforma inteira, não só aquele tenant — aparecem com um destaque visual diferente dos guardrails exclusivos, para que o administrador nunca confunda "vou excluir algo de um cliente" com "vou mexer em algo que afeta todos os clientes".

**Why this priority**: dá ao administrador o contexto que ele precisa para tomar a decisão de excluir com confiança — é o que torna o resumo de impacto (US1) compreensível, mas a tela já funciona sem isso hoje, então é um reforço, não um bloqueador.

**Independent Test**: consultar um tenant com guardrails globais e exclusivos misturados e verificar que os globais têm um indicador visual distinto e reconhecível dos demais.

**Acceptance Scenarios**:

1. **Given** um tenant com prompts vinculados nos três tipos de nó, **When** o administrador consulta o tenant, **Then** os prompts aparecem identificados por tipo (operacional, institucional, chitchat).
2. **Given** um tenant com guardrails globais e exclusivos, **When** o administrador visualiza a lista de guardrails, **Then** os guardrails globais têm um indicador visual (selo/ícone) que os diferencia claramente dos demais.

---

### User Story 3 - Ir direto para configurar o WhatsApp do tenant (Priority: P3)

A partir da tela do tenant, o administrador clica em um atalho "WhatsApp" e é levado à tela de gestão de instâncias de WhatsApp já com o ID do tenant preenchido e o nome da instância sugerido com o nome do tenant (podendo editar esse nome antes de continuar).

**Why this priority**: é uma conveniência que elimina redigitação e erro de copiar/colar o ID errado, mas nenhuma outra parte do ticket depende dela.

**Independent Test**: a partir da tela de um tenant específico, clicar no atalho WhatsApp e verificar que a tela de instâncias abre com Tenant ID e Nome da Instância já preenchidos, e que ambos podem ser editados normalmente antes de salvar.

**Acceptance Scenarios**:

1. **Given** o administrador está vendo os dados de um tenant, **When** ele clica no atalho "WhatsApp", **Then** é levado à tela de instâncias de WhatsApp com o campo Tenant ID preenchido com o ID daquele tenant.
2. **Given** a tela de instâncias aberta a partir do atalho, **When** ela carrega, **Then** o campo Nome da Instância já vem preenchido com o nome do tenant, mas continua editável.

---

### User Story 4 - Ver todos os tenants em um grid e abrir o detalhe ao clicar (Priority: P1)

Ao abrir a tela de tenants, o administrador já vê um grid com todos os tenants cadastrados (ID e nome), paginado. Ele pode navegar entre páginas com "Anterior"/"Próxima", ou continuar usando a busca por ID já existente. Clicar em uma linha do grid preenche o card de detalhe logo abaixo — os mesmos dados que apareceriam se ele tivesse digitado aquele ID na busca manual. O grid permanece visível o tempo todo, então o administrador pode clicar em outro tenant a qualquer momento sem precisar "voltar".

**Why this priority**: é o ponto de entrada da tela — sem ele, o administrador só consegue chegar a um tenant se já souber o ID de cor, o que não é realista no dia a dia. Item A do ticket original (EDI-46), destravado quando o backend disponibilizou `GET /tenants/list`.

**Independent Test**: abrir a tela de tenants e verificar que (a) o grid aparece já carregado com tenants reais (ID + nome), (b) clicar em uma linha popula o card de detalhe abaixo com os dados daquele tenant, (c) os botões de paginação avançam/voltam páginas corretamente, (d) o grid nunca é escondido pelo detalhe.

**Acceptance Scenarios**:

1. **Given** a tela de tenants é aberta, **When** carrega, **Then** um grid com ID e nome de todos os tenants aparece, sem exigir nenhuma busca manual antes.
2. **Given** o grid carregado, **When** o administrador clica em uma linha, **Then** o card de detalhe abaixo mostra os dados daquele tenant, exatamente como uma busca manual por aquele ID mostraria.
3. **Given** mais tenants do que cabem em uma página, **When** o administrador clica em "Próxima", **Then** a página seguinte de tenants é exibida; "Anterior" volta à página anterior; os botões desabilitam nas pontas (primeira/última página).
4. **Given** um tenant é excluído ou editado com sucesso, **When** a operação conclui, **Then** o grid reflete a mudança (tenant excluído some da lista corrente; nome editado atualiza).

---

### Edge Cases

- O que acontece se o nome do tenant tiver espaços extras ou variar em maiúsculas/minúsculas? A comparação deve exigir correspondência exata ao nome exibido — não deve "quase bater".
- O que acontece se a exclusão em si falhar depois que o resumo de impacto já foi mostrado e confirmado (ex.: erro de backend no meio da orquestração)? O administrador deve ver a falha claramente e o tenant deve continuar existindo (nada de estado intermediário ambíguo na tela).
- O que acontece se o tenant não tiver nenhum prompt/guardrail vinculado em nenhum grupo? O resumo deve deixar isso explícito (ex.: "nada será excluído nem desvinculado") em vez de mostrar seções vazias sem explicação.
- O que acontece se o nome do tenant tiver caracteres que não sejam ideais como nome de instância de WhatsApp? O campo é apenas uma sugestão pré-preenchida e editável — o administrador pode ajustar antes de prosseguir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao clicar em "Excluir", o sistema MUST buscar o resumo de impacto da exclusão antes de permitir qualquer confirmação.
- **FR-002**: O sistema MUST exibir o resumo separando claramente: prompts a excluir, prompts a apenas desvincular, guardrails a excluir, guardrails a apenas desvincular — cada grupo listando os itens afetados por nome.
- **FR-003**: O sistema MUST exigir que o administrador digite o nome exato do tenant em um campo obrigatório antes de habilitar a confirmação definitiva.
- **FR-004**: O botão de confirmação MUST permanecer desabilitado enquanto o texto digitado não corresponder exatamente ao nome exibido do tenant.
- **FR-005**: Cancelar a ação ou fechar o modal (Esc) MUST encerrar o fluxo sem qualquer alteração no tenant, prompts ou guardrails.
- **FR-006**: Confirmar a exclusão MUST disparar a exclusão orquestrada, mostrando estado de carregamento até a resposta.
- **FR-007**: O sistema MUST informar claramente sucesso ou falha da exclusão ao final da operação.
- **FR-008**: Se a busca do resumo de impacto falhar, o sistema MUST informar o erro e não liberar o campo de confirmação por nome, evitando exclusão sem visibilidade do impacto real.
- **FR-009**: A avaliação de impacto MUST tratar prompts e guardrails de forma independente entre si — o destino de um guardrail (excluir/manter) não é determinado pelo destino do prompt ao qual está associado.
- **FR-010**: O sistema MUST exibir os prompts vinculados ao tenant agrupados por tipo de nó (operacional, institucional, chitchat).
- **FR-011**: O sistema MUST destacar visualmente os guardrails marcados como globais, de forma distinta dos guardrails exclusivos do tenant.
- **FR-012**: O sistema MUST oferecer uma ação "WhatsApp" a partir da tela do tenant que leve à tela de gestão de instâncias de WhatsApp.
- **FR-013**: Essa ação MUST pré-preencher o campo Tenant ID com o ID do tenant de origem.
- **FR-014**: Essa ação MUST pré-preencher o campo Nome da Instância com o nome do tenant, permanecendo editável pelo administrador.
- **FR-015**: O sistema MUST continuar oferecendo a edição do tenant com os dados atuais pré-carregados (comportamento já existente na tela, sem regressão).
- **FR-016**: O sistema MUST exibir, ao carregar a tela de tenants, um grid com ID e nome de todos os tenants, sem exigir busca manual antes.
- **FR-017**: O sistema MUST paginar o grid, oferecendo navegação entre páginas ("Anterior"/"Próxima"), com os botões desabilitados nas pontas (primeira/última página).
- **FR-018**: Clicar em uma linha do grid MUST exibir o card de detalhe daquele tenant, com o mesmo conteúdo que uma busca manual por ID mostraria.
- **FR-019**: O grid MUST permanecer visível após uma linha ser clicada — não é substituído pelo card de detalhe.
- **FR-020**: O grid MUST refletir exclusões e edições concluídas com sucesso (tenant excluído sai da lista corrente; nome editado é atualizado).

### Key Entities

- **Tenant**: cliente administrado na plataforma, identificado por ID e nome; ponto de entrada de todas as ações desta feature.
- **Prompt vinculado**: conteúdo de atendimento associado ao tenant por tipo de nó (operacional, institucional, chitchat); pode ser exclusivo do tenant ou compartilhado com outros/padrão da plataforma.
- **Guardrail**: regra de proteção associada a um prompt; pode ser global (afeta toda a plataforma) ou exclusivo de um prompt/tenant.
- **Resumo de impacto de exclusão**: agrupamento, calculado no momento da consulta, do que será excluído de fato vs. apenas desvinculado — separado por prompts e por guardrails.
- **Item de grid**: representação resumida de um tenant na listagem (ID, nome) usada só para navegação — o detalhe completo só é carregado ao clicar, via o mesmo fluxo de busca por ID já existente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tentativas de exclusão de tenant exigem confirmação por nome exato antes de qualquer exclusão real ser executada — zero exclusões acidentais possíveis via a interface.
- **SC-002**: O administrador consegue identificar, sem sair da tela, o que será excluído de fato versus apenas desvinculado antes de decidir confirmar uma exclusão.
- **SC-003**: O administrador consegue abrir a configuração de uma instância de WhatsApp para um tenant específico sem precisar redigitar o ID do tenant.
- **SC-004**: O administrador consegue distinguir guardrails globais de guardrails exclusivos do tenant apenas olhando para a tela, sem precisar consultar outra tela.
- **SC-005**: O administrador chega ao detalhe de qualquer tenant cadastrado sem precisar saber o ID de cor — o grid inicial e a paginação são suficientes.

## Assumptions

- O contrato de API definido no EDI-45 (`GET /tenants/{id}/delete-impact` e `DELETE /tenants/{id}`) é tratado como estável para fins de construção do frontend, mesmo com o backend ainda em desenvolvimento; a validação de integração ponta a ponta é feita quando o backend estiver pronto, conforme combinado.
- O grid de tenants (US4) consome um endpoint novo e dedicado, `GET /tenants/list` (com `{items, total}`, `q` opcional, `limit`/`offset`), diferente do endpoint de busca já existente `GET /tenants` (array puro, `q` obrigatório, usado pela busca de tenant da Base de Conhecimento). Essa separação foi uma decisão explícita do backend para não quebrar o consumidor já existente.
- O botão "Editar" já existente na tela atende ao critério de aceite correspondente do ticket; o trabalho desta feature nessa frente é garantir que continue funcionando sem regressão, não reconstruí-lo.
- A tela de instâncias de WhatsApp pode receber valores iniciais fornecidos externamente (Tenant ID e Nome da Instância) e mantê-los editáveis — hoje ela não aceita nenhum valor pré-preenchido, então essa é uma extensão necessária, não um comportamento já existente reaproveitado.
- "Nome exato do tenant" significa correspondência exata (sensível a maiúsculas/minúsculas e espaços) com o nome atualmente exibido daquele tenant.
