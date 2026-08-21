# Feature Specification: Ajustes de Usabilidade no Painel Administrativo (Fase 1)

**Feature Branch**: `019-admin-ux-quick-wins`
**Created**: 2026-08-21
**Status**: Draft
**Input**: User description: "Painel administrativo interno confuso — corrigir título da tela 'Painel', reduzir peso visual do botão Excluir, corrigir fechamento de modais (ESC/backdrop/área de clique do X), diferenciar títulos duplicados de prompts, adicionar tooltip na badge Global/(G), tratar campo 'Atualizado em' vazio, e adicionar busca na listagem de Prompts Base."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fechar modais de forma previsível (Priority: P1)

Como administrador, ao abrir qualquer modal do painel (editar prompt, editar guardrail, editar tenant, confirmar exclusão), eu espero poder fechá-lo pressionando ESC ou clicando fora dele, como em qualquer outro sistema — e ser avisado se isso descartar uma alteração que eu ainda não salvei.

**Why this priority**: Hoje nenhum modal do admin reage ao ESC nem escurece o fundo (o comportamento nativo de modal não está ativo), o que quebra a expectativa básica de uso em todas as ~8 telas que usam modal. É o problema estrutural de maior alcance no painel.

**Independent Test**: Abrir qualquer modal do admin (ex: Editar Prompt) e pressionar ESC — o modal deve fechar. Repetir preenchendo um campo antes de pressionar ESC — deve aparecer confirmação antes de descartar.

**Acceptance Scenarios**:

1. **Given** um modal de confirmação de exclusão aberto (sem formulário), **When** o usuário pressiona ESC, **Then** o modal fecha imediatamente, sem executar a exclusão.
2. **Given** um modal de edição (Prompt, Guardrail ou Tenant) aberto sem nenhuma alteração no formulário, **When** o usuário pressiona ESC, **Then** o modal fecha imediatamente.
3. **Given** um modal de edição aberto com pelo menos um campo alterado em relação ao valor original, **When** o usuário pressiona ESC ou clica fora do modal, **Then** o sistema exibe uma confirmação perguntando se deseja descartar as alterações antes de fechar.
4. **Given** qualquer modal aberto, **When** o usuário observa a tela, **Then** o conteúdo por trás do modal aparece escurecido/bloqueado (backdrop), reforçando que o foco está no modal.
5. **Given** um modal aberto, **When** o usuário posiciona o mouse sobre a área ao redor do ícone "X", **Then** a área clicável é grande o suficiente para ser acionada com facilidade (não apenas o ícone em si).

---

### User Story 2 - Entender a função da tela "Painel" (Priority: P1)

Como administrador, ao abrir a tela hoje intitulada "Painel Administrador - Adicionar Novo Tenant", eu quero que o título reflita o que a tela realmente faz — buscar um tenant existente e colar/editar o texto da base de conhecimento dele — para não pensar que ali é onde se cadastra um tenant novo.

**Why this priority**: É a porta de entrada mais usada do admin e o nome atual gera uma expectativa errada logo no primeiro contato, levando o usuário a procurar "criar tenant" em outro lugar (ou tentar criar um tenant duplicado ali).

**Independent Test**: Abrir a tela "Painel" e ler o título — deve ficar claro, sem abrir a tela de Tenants, que ali se busca um tenant e se gerencia a base de conhecimento dele.

**Acceptance Scenarios**:

1. **Given** o administrador está na tela "Painel", **When** ele lê o título da página, **Then** o título comunica busca de tenant e gestão da base de conhecimento, sem mencionar criação/adição de tenant.

---

### User Story 3 - Diferenciar visualmente "Excluir" de "Salvar" (Priority: P2)

Como administrador, eu quero que o botão "Excluir" tenha um peso visual claramente menor que o botão de ação primária (ex: "Salvar"), para não correr o risco de clicar em excluir por engano ao confundir os dois.

**Why this priority**: O risco de erro é sério (perda de dados) mas hoje já existe confirmação antes de qualquer exclusão — o ajuste é refinamento visual, não uma proteção que falta.

**Independent Test**: Abrir a tela de Base de Conhecimento de um tenant com conteúdo salvo — os botões "Salvar Base de Conhecimento" e "Excluir" devem ser visualmente distinguíveis em peso (tamanho/destaque), não apenas em cor.

**Acceptance Scenarios**:

1. **Given** uma tela com um botão de ação primária (ex: "Salvar") e um botão "Excluir" lado a lado, **When** o usuário olha para os dois, **Then** o botão "Excluir" tem menor destaque visual (ex: menor, estilo texto/link, ou outline mais discreto) que o botão primário.
2. **Given** o usuário clica em "Excluir" em qualquer lista ou tela de detalhe (Tenant, Base de Conhecimento, Prompt, Guardrail), **When** a exclusão é solicitada, **Then** o sistema continua exigindo confirmação explícita antes de excluir (comportamento já existente, não deve regredir).

---

### User Story 4 - Buscar um prompt na lista de Prompts Base (Priority: P2)

Como administrador, ao ter muitos prompts cadastrados, eu quero buscar/filtrar por título na aba "Prompts Base" para encontrar o que preciso sem rolar a lista inteira.

**Why this priority**: Sem busca, o custo de encontrar um prompt cresce linearmente com o catálogo — já é perceptível hoje e piora conforme mais prompts forem cadastrados (inclusive por nó, ver Fase de modelagem por nó já implementada).

**Independent Test**: Na aba "Prompts Base", digitar parte do título de um prompt existente no campo de busca — a lista deve reduzir para mostrar apenas os prompts correspondentes, em tempo real.

**Acceptance Scenarios**:

1. **Given** a aba "Prompts Base" com múltiplos prompts cadastrados, **When** o usuário digita um termo no campo de busca, **Then** a lista exibe apenas os prompts cujo título contém o termo (busca não sensível a maiúsculas/acentos).
2. **Given** um termo de busca que não corresponde a nenhum prompt, **When** a busca é aplicada, **Then** a tela exibe uma mensagem de "nenhum resultado encontrado" em vez de lista vazia sem explicação.
3. **Given** um termo de busca preenchido, **When** o usuário limpa o campo, **Then** a lista completa de prompts volta a ser exibida.

---

### User Story 5 - Diferenciar prompts com título duplicado (Priority: P3)

Como administrador, ao ver dois prompts com o mesmo título na listagem, eu quero um indicador adicional ao lado de cada um (como o nó de destino) para saber qual é qual sem precisar abrir os dois para comparar.

**Why this priority**: Já existe hoje um caso real de dois prompts chamados "Agendamento Padrão e Assistente Comercial" (um Institucional, outro Operacional). O título em si é dado de conteúdo (fora do escopo de código), mas a UI pode e deve deixar claro qual é qual.

**Independent Test**: Cadastrar (ou usar dados existentes com) dois prompts de mesmo título e nós diferentes — a listagem deve permitir identificar cada um sem ambiguidade, sem precisar editar nenhum dos dois.

**Acceptance Scenarios**:

1. **Given** dois ou mais prompts com o mesmo título na listagem, **When** o usuário visualiza a lista, **Then** cada ocorrência exibe um indicador adicional (nó de destino e, quando aplicável, tenant vinculado) suficiente para diferenciá-los.
2. **Given** dois prompts com o mesmo título e o mesmo nó de destino, **When** o indicador de nó não é suficiente para diferenciá-los, **Then** a listagem exibe um identificador adicional (ex: trecho do conteúdo ou identificador curto) como critério de desempate.

---

### User Story 6 - Entender o que significa a badge "Global" (Priority: P3)

Como administrador, ao ver a marcação "(G)" ou "Global" em um guardrail, eu quero uma explicação rápida do que isso significa, e quero que o mesmo conceito seja chamado da mesma forma em todas as telas.

**Why this priority**: Hoje a mesma informação (guardrail global) aparece rotulada de formas diferentes — "(G)" em um lugar, "Global" em outro — sem nenhuma explicação em nenhum dos dois, o que é confuso mas de baixo risco.

**Independent Test**: Passar o mouse (ou navegar por teclado) sobre a badge de um guardrail global em qualquer tela onde ela aparece — deve exibir uma explicação do significado, com o mesmo rótulo em todas as telas.

**Acceptance Scenarios**:

1. **Given** um guardrail marcado como global, **When** o usuário passa o mouse ou foca a badge correspondente, **Then** uma explicação curta é exibida (ex: "Este guardrail se aplica a todos os tenants").
2. **Given** a mesma informação de guardrail global, **When** ela aparece em telas diferentes (Prompts Base, Guardrails, modal de edição de Prompt, Vincular Tenant), **Then** o rótulo textual usado é o mesmo em todas elas.

---

### User Story 7 - Ver claramente quando um tenant nunca foi atualizado (Priority: P3)

Como administrador, ao consultar os dados de um tenant que nunca foi editado desde a criação, eu quero uma mensagem clara em vez do texto genérico "Não informado" no campo "Atualizado em".

**Why this priority**: É uma inconsistência de conteúdo pequena e isolada a uma tela, sem impacto funcional.

**Independent Test**: Consultar um tenant cujo campo de última atualização esteja vazio — o campo não deve exibir o texto literal "Não informado".

**Acceptance Scenarios**:

1. **Given** um tenant cujo campo "Atualizado em" não possui valor, **When** o administrador visualiza os detalhes do tenant, **Then** o sistema exibe uma mensagem que deixe claro que o tenant nunca foi atualizado (ex: "Nunca atualizado"), ou omite o campo por completo.

---

### Edge Cases

- Se o usuário pressiona ESC enquanto um modal está processando uma submissão (salvando/excluindo), a tecla deve ser ignorada até a operação terminar — mesma regra hoje aplicada ao botão "Cancelar" durante carregamento.
- Se o usuário pressiona ESC dentro de um campo de formulário que também usa ESC para outro fim (ex: um editor de markdown com atalho próprio), o fechamento do modal não deve conflitar com esse atalho.
- Se a busca de Prompts Base é aplicada e depois o usuário cria um novo prompt, o novo prompt deve respeitar o filtro ativo (aparecer somente se corresponder ao termo buscado).
- Se dois prompts têm o mesmo título e o mesmo nó de destino, o indicador de nó sozinho não resolve — necessário critério de desempate adicional (ver US5, cenário 2).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fechar qualquer modal do painel administrativo quando o usuário pressiona a tecla ESC.
- **FR-002**: O sistema DEVE exibir uma confirmação antes de fechar, via ESC ou clique fora, um modal de formulário (Prompt, Guardrail, Tenant) que contenha alterações não salvas; modais somente de confirmação (sem campos editáveis) fecham imediatamente sem essa confirmação.
- **FR-003**: O sistema DEVE exibir um fundo semi-transparente (backdrop) atrás de todo modal aberto, bloqueando a interação com o conteúdo por trás enquanto o modal estiver visível.
- **FR-004**: O sistema DEVE prover uma área de clique perceptivelmente maior que o ícone "X" para o botão de fechar de cada modal, mantendo o rótulo acessível já existente.
- **FR-005**: A tela de busca de tenant e edição de base de conhecimento DEVE exibir um título que reflita sua função real (consulta de tenant e gestão de base de conhecimento), sem mencionar criação/adição de tenant.
- **FR-006**: Todo botão "Excluir" em listagens (Prompts, Guardrails) e em telas de detalhe (Tenant, Base de Conhecimento) DEVE ter peso visual perceptivelmente inferior ao botão de ação primária mais próximo (ex: "Salvar"), sem remover a confirmação de exclusão já existente.
- **FR-007**: A aba "Prompts Base" DEVE oferecer um campo de busca por título que filtra a lista exibida conforme o usuário digita, de forma não sensível a maiúsculas/minúsculas ou acentuação.
- **FR-008**: Quando a busca em "Prompts Base" não retornar nenhum resultado, o sistema DEVE exibir uma mensagem indicando ausência de resultados, distinta da mensagem de "nenhum prompt cadastrado".
- **FR-009**: Quando dois ou mais prompts compartilharem o mesmo título, o sistema DEVE exibir, ao lado de cada um na listagem, um indicador adicional (nó de destino e, se necessário para desempate, um identificador complementar) que permita diferenciá-los sem alterar o título armazenado.
- **FR-010**: A badge que indica um guardrail global DEVE usar o mesmo rótulo textual em todas as telas onde aparece (Prompts Base, Guardrails, modal de edição de Prompt, Vincular Tenant).
- **FR-011**: A badge de guardrail global DEVE fornecer uma explicação acessível (tooltip e/ou texto para leitor de tela) do que a marcação significa.
- **FR-012**: Quando o campo "Atualizado em" de um tenant não possuir valor, o sistema NÃO DEVE exibir o texto literal "Não informado"; deve exibir uma mensagem que comunique que o tenant nunca foi atualizado, ou omitir o campo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos modais do painel administrativo podem ser fechados com a tecla ESC.
- **SC-002**: Nenhuma alteração não salva em um formulário de modal é perdida silenciosamente — toda tentativa de fechar um modal com alterações pendentes gera uma confirmação antes do fechamento.
- **SC-003**: Em teste de primeira impressão, administradores identificam corretamente a função da tela "Painel" (busca de tenant e base de conhecimento) apenas pelo título, sem precisar abrir a tela.
- **SC-004**: O tempo para localizar um prompt específico em uma lista com 20 ou mais itens cai em relação ao cenário sem busca, medido em teste de uso da listagem de Prompts Base.
- **SC-005**: Em teste de reconhecimento visual, administradores não confundem o botão "Excluir" com o botão de ação primária em nenhuma das telas afetadas.
- **SC-006**: Diante de dois prompts com título idêntico, administradores conseguem apontar corretamente qual é qual usando apenas a listagem, sem abrir nenhum dos dois.

## Assumptions

- O comportamento de confirmação de exclusão já existente (modais de confirmação para Prompt, Guardrail, Tenant e Base de Conhecimento) é mantido; o foco desta feature é reduzir o peso visual do botão, não adicionar uma confirmação que já existe.
- "Alterações não salvas" refere-se ao estado de formulários com campos editados (Prompt, Guardrail, Tenant) em relação ao valor carregado; modais que são apenas confirmação de exclusão não possuem esse estado e fecham imediatamente com ESC.
- A diferenciação de prompts com título duplicado é resolvida inteiramente na interface (indicador visual adicional), sem renomear os registros existentes.
- Estão fora do escopo desta feature: a unificação das telas "Painel" e "Tenants" e o redesenho da aba "Vincular Tenant" (tratados em feature separada — Fase 2) e a tela "WhatsApp — Instâncias" (Fase 3).
