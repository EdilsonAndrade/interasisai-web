# Feature Specification: Vínculo obrigatório de prompt no tenant e associação em massa

**Feature Branch**: `edilsonaandrade/edi-44-frontend-vinculo-obrigatorio-de-prompt-no-cadastro-de-tenant`
**Created**: 2026-08-22
**Status**: Draft
**Ticket**: [EDI-44](https://linear.app/edilsonandrade/issue/EDI-44/frontend-vinculo-obrigatorio-de-prompt-no-cadastro-de-tenant) — depende de [EDI-43](https://linear.app/edilsonandrade/issue/EDI-43/backend-eliminar-fallback-implicito-de-prompt-e-aplicar-guardrails) (backend)

**Input**: Complemento de UI do EDI-43. O backend deixou de resolver prompt por fallback implícito — todo tenant passa a exigir vínculo explícito. Esta feature cobre a experiência que torna essa obrigatoriedade indolor para o administrador.

**Princípio norteador**: o administrador **confirma uma escolha**, nunca recebe um padrão escondido. Hoje um tenant sem vínculo herda conteúdo em silêncio; a interface não pode reproduzir isso apenas com outro nome.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar tenant escolhendo o prompt conscientemente (Priority: P1)

O administrador cadastra um novo cliente. No formulário, além dos dados do cliente, ele precisa escolher qual prompt de atendimento aquele cliente vai usar. A lista mostra os prompts disponíveis, indicando qual é o padrão da plataforma, mas nenhum vem marcado — o administrador precisa escolher. Se ele tentar salvar sem escolher, o formulário explica por que o prompt é obrigatório. Se nenhum prompt existente servir, ele pode partir de um modelo, editar o texto e salvar o novo prompt junto com o cadastro.

**Why this priority**: é o cenário que fecha a porta de entrada do defeito. Sem ele, tenants novos continuam nascendo sem configuração explícita, e todo o resto da feature vira remediação de um problema que segue sendo criado.

**Independent Test**: cadastrar um tenant do zero e verificar que (a) o cadastro não conclui sem prompt escolhido, (b) o prompt escolhido é o que aparece depois na configuração do tenant. Entrega valor sozinho: a partir dele, nenhum tenant novo nasce quebrado.

**Acceptance Scenarios**:

1. **Given** o formulário de cadastro de tenant aberto, **When** o administrador o visualiza, **Then** existe um campo de prompt obrigatório, vazio, com marcador indicando que uma escolha é necessária.
2. **Given** o campo de prompt vazio, **When** o administrador tenta salvar, **Then** o cadastro é bloqueado e uma mensagem explica que o tenant precisa de um prompt vinculado para que o atendimento funcione.
3. **Given** a lista de prompts disponíveis, **When** o administrador a abre, **Then** o prompt padrão da plataforma aparece com um rótulo que o identifica como padrão, mas não está selecionado.
4. **Given** um prompt escolhido, **When** o administrador o visualiza antes de salvar, **Then** ele consegue ver qual prompt será aplicado e trocá-lo por outro sem sair do formulário.
5. **Given** o administrador escolhe "criar novo a partir de um modelo", **When** ele seleciona um modelo, **Then** um editor abre pré-preenchido com o conteúdo do modelo, editável.
6. **Given** um prompt novo escrito a partir de modelo, **When** o cadastro é concluído com sucesso, **Then** o novo prompt existe na biblioteca de prompts e está vinculado ao tenant recém-criado.
7. **Given** um prompt novo criado a partir de modelo e uma falha no cadastro do tenant (ex.: identificador duplicado), **When** o erro é exibido, **Then** o prompt recém-criado permanece disponível na biblioteca para reaproveitamento na nova tentativa, e o tenant não é criado.
8. **Given** um tenant existente, **When** o administrador abre o formulário de edição, **Then** o campo de prompt não aparece — a troca de vínculo não acontece por ali.

---

### User Story 2 - Ver e corrigir tenant com configuração quebrada (Priority: P1)

O administrador consulta um tenant e vê, na própria tela do cliente, qual prompt está vinculado. Se aquele tenant estiver sem vínculo próprio (situação anômala herdada de antes da mudança), a tela mostra um alerta de erro de configuração — não um estado saudável — junto com uma ação direta para vincular um prompt ali mesmo. As proteções de segurança que se aplicam ao tenant continuam visíveis mesmo nesse estado.

**Why this priority**: é o outro lado do P1. Fechar a porta de entrada não conserta quem já está dentro. Sem esta história, o administrador não tem como descobrir nem corrigir os tenants quebrados, e o critério central do ticket — "não pode ficar parecendo um tenant saudável" — não é atendido.

**Independent Test**: consultar um tenant sem vínculo próprio e verificar que aparece o alerta e que a correção pode ser feita sem sair da tela. Entrega valor sozinho mesmo sem a US1.

**Acceptance Scenarios**:

1. **Given** um tenant com vínculo próprio de prompt, **When** o administrador abre o detalhe do tenant, **Then** o título do prompt vinculado é exibido, sem alerta.
2. **Given** um tenant sem vínculo próprio, **When** o administrador abre o detalhe do tenant, **Then** um alerta visualmente destacado indica erro de configuração, com explicação de que o atendimento desse cliente não tem prompt definido.
3. **Given** o alerta de configuração exibido, **When** o administrador aciona a correção, **Then** ele escolhe um prompt e o vínculo é gravado sem sair da tela do tenant, e o alerta desaparece imediatamente após o sucesso.
4. **Given** um tenant sem vínculo próprio, **When** a tela é exibida, **Then** o conteúdo do prompt padrão **não** é apresentado como configuração vigente daquele tenant — porque não é o que o atendimento vai usar.
5. **Given** um tenant sem vínculo próprio, **When** a tela é exibida, **Then** as proteções globais que se aplicam a ele continuam sendo listadas, porque continuam valendo mesmo com o prompt ausente.

---

### User Story 3 - Aplicar um prompt a vários tenants de uma vez (Priority: P2)

Partindo da tela de prompts, o administrador escolhe um prompt e aciona "aplicar a estes tenants". Ele busca e seleciona vários clientes. Antes de confirmar, vê separadamente quem já usa aquele prompt (nada muda) e quem será alterado, com aviso de que a operação substitui o vínculo anterior e é tudo-ou-nada. Ao confirmar, todos os vínculos são gravados de uma vez.

**Why this priority**: inverte um fluxo que hoje só existe um a um, eliminando trabalho repetitivo. É ganho de eficiência real, mas não corrige defeito de configuração — por isso vem depois das duas primeiras.

**Independent Test**: selecionar um prompt, aplicar a três tenants e verificar que os três passaram a usá-lo. Testável sem depender das outras histórias.

**Acceptance Scenarios**:

1. **Given** a tela de prompts, **When** o administrador seleciona um prompt, **Then** existe uma ação para aplicá-lo a múltiplos tenants.
2. **Given** a ação acionada, **When** o administrador busca por um termo, **Then** os tenants correspondentes aparecem e podem ser marcados em conjunto.
3. **Given** tenants selecionados, **When** a confirmação é exibida, **Then** ela separa em dois grupos: os que já usam o prompt (sem mudança) e os que terão o vínculo substituído.
4. **Given** a confirmação exibida, **When** o administrador a lê, **Then** consta o aviso de que a operação substitui o vínculo anterior daquele tipo de nó e é aplicada por inteiro ou não é aplicada.
5. **Given** a confirmação aceita, **When** a operação conclui com sucesso, **Then** uma mensagem informa quantos tenants foram vinculados.
6. **Given** a confirmação aceita, **When** algum tenant informado não existir, **Then** a interface informa quais falharam e deixa claro que **nenhum** vínculo foi aplicado.
7. **Given** nenhum tenant selecionado, **When** o administrador tenta confirmar, **Then** a ação é bloqueada com mensagem pedindo ao menos um tenant.

---

### User Story 4 - Enxergar as proteções globais que se aplicam ao tenant (Priority: P2)

Na visão do tenant, o administrador vê as proteções (guardrails) que aquele cliente recebe. As proteções globais — que a plataforma aplica automaticamente a todos — aparecem visualmente separadas das que vieram do prompt, com indicação de que são somadas automaticamente e não podem ser removidas dali.

**Why this priority**: torna verdadeira a promessa de "o que a tela mostra é o que o agente recebe". Importante para a confiança do administrador, mas não bloqueia operação — por isso P2.

**Independent Test**: abrir um tenant com proteções globais e proteções do prompt, e verificar que as duas origens são distinguíveis à primeira vista.

**Acceptance Scenarios**:

1. **Given** um tenant com proteções de ambas as origens, **When** o administrador abre a visão do tenant, **Then** as globais estão visualmente distintas das vinculadas ao prompt.
2. **Given** as proteções globais exibidas, **When** o administrador as observa, **Then** há indicação explícita de que são aplicadas automaticamente a todos os tenants e não podem ser removidas naquela tela.
3. **Given** um tenant sem nenhuma proteção vinculada ao prompt, **When** a visão é aberta, **Then** as globais continuam sendo listadas.

---

### User Story 5 - Entender por que uma exclusão foi recusada (Priority: P3)

Ao tentar excluir um prompt ou uma proteção que está em uso, o administrador recebe não só a recusa, mas a lista de quem está bloqueando — com caminho para resolver na origem. No caso específico de uma proteção marcada como global, a interface oferece o atalho de desmarcar o global e excluir em seguida.

**Why this priority**: proteção nova do backend (EDI-43) que sem tratamento de interface aparece como erro cru. Melhora significativa de experiência, mas em fluxo menos frequente que os anteriores.

**Independent Test**: tentar excluir um prompt em uso e verificar que os tenants bloqueadores são listados com caminho de resolução.

**Acceptance Scenarios**:

1. **Given** um prompt vinculado a tenants, **When** o administrador tenta excluí-lo, **Then** a exclusão é recusada e os tenants bloqueadores são listados nominalmente.
2. **Given** a lista de tenants bloqueadores, **When** o administrador escolhe um deles, **Then** ele é levado ao fluxo de vínculo daquele tenant para resolver na origem.
3. **Given** uma proteção marcada como global, **When** o administrador tenta excluí-la, **Then** a recusa explica o motivo e oferece a ação de desmarcar o global e excluir em sequência.
4. **Given** uma proteção associada a prompts em uso, **When** o administrador tenta excluí-la, **Then** os prompts bloqueadores são listados com a quantidade de tenants afetados por cada um.
5. **Given** uma proteção que é global **e** está em uso, **When** o administrador tenta excluí-la, **Then** a interface apresenta o bloqueio de "global" (o mais forte), não o de uso.
6. **Given** um prompt sem nenhum vínculo, **When** o administrador o exclui, **Then** a exclusão conclui normalmente.

---

### Edge Cases

- **Biblioteca de prompts vazia no cadastro**: não deve ocorrer — a semeadura do EDI-43 garante ao menos um prompt por tipo de nó. Ainda assim, se a lista vier vazia, o formulário informa que não há prompt disponível e oferece o caminho de criar um, em vez de exibir um campo vazio sem saída.
- **Falha ao carregar a lista de prompts durante o cadastro**: o formulário não pode permitir salvar às cegas; exibe o erro e oferece nova tentativa, mantendo os dados já digitados.
- **Prompt criado a partir de modelo com o marcador de proteções removido**: o conteúdo copiado precisa preservar o marcador dinâmico de guardrails. Se o administrador o apagar, a interface avisa que as proteções deixarão de ser aplicadas dinamicamente àquele prompt.
- **Prompt órfão acumulado**: prompt criado no fluxo "a partir de modelo" cuja criação de tenant falhou fica na biblioteca sem vínculo. É estado aceito; ele é reaproveitável e excluível sem atrito (não tem vínculo, logo nada o bloqueia).
- **Prompt escolhido é excluído por outro administrador entre a abertura do formulário e o salvamento**: o cadastro falha informando que o prompt não existe mais, e a lista é recarregada.
- **Prompt escolhido não é do tipo operacional** (lista desatualizada em aba antiga): o cadastro é recusado com mensagem específica sobre tipo de nó incompatível.
- **Seleção em massa com tenant inexistente na lista**: nada é aplicado; a interface precisa deixar claro que a operação inteira foi revertida, para o administrador não supor sucesso parcial.
- **Seleção em massa incluindo tenants que já usam o prompt**: são exibidos no grupo "sem mudança"; a operação continua válida.
- **Correção de vínculo a partir do alerta enquanto o tenant já foi corrigido em outra aba**: após o sucesso, a tela reflete o estado atual lido do servidor, não um estado presumido localmente.
- **Erro de servidor sem o envelope estruturado** (caminho legado): a interface exibe uma mensagem genérica utilizável em vez de falhar na renderização.

## Requirements *(mandatory)*

### Cadastro de tenant com prompt obrigatório

- **FR-001**: O formulário de criação de tenant MUST conter um campo de prompt obrigatório, referente ao nó operacional.
- **FR-002**: O sistema MUST impedir a conclusão do cadastro sem prompt escolhido, exibindo mensagem que explica a razão da obrigatoriedade (o atendimento não funciona sem prompt definido).
- **FR-003**: A lista de prompts oferecida no cadastro MUST conter apenas prompts do nó operacional.
- **FR-004**: O campo de prompt MUST iniciar sem nenhuma opção selecionada. O sistema MUST NOT pré-selecionar prompt algum, inclusive o padrão da plataforma.
- **FR-005**: O prompt padrão da plataforma MUST ser identificável na lista por rótulo visual, sem estar selecionado.
- **FR-006**: O administrador MUST conseguir ver qual prompt está escolhido e trocá-lo antes de salvar, sem sair do formulário.
- **FR-007**: O formulário MUST oferecer a opção de criar um prompt novo a partir de um modelo existente, abrindo um editor pré-preenchido com o conteúdo do modelo.
- **FR-008**: O conteúdo copiado de um modelo MUST preservar o marcador dinâmico de proteções intacto; o sistema MUST NOT submeter conteúdo com as proteções já expandidas no texto.
- **FR-009**: No fluxo "criar novo a partir de modelo", o sistema MUST criar o prompt antes de criar o tenant, e usar o identificador retornado no cadastro.
- **FR-010**: Se a criação do tenant falhar após o prompt já ter sido criado, o sistema MUST manter o prompt criado (sem tentativa de desfazer) e MUST informar ao administrador que o prompt está disponível para a nova tentativa.
- **FR-011**: O formulário de edição de tenant MUST NOT incluir campo de prompt; a troca de vínculo de um tenant existente acontece pelos fluxos de vínculo.

### Estado de configuração do tenant

- **FR-012**: O detalhe do tenant MUST exibir o prompt do nó operacional atualmente resolvido para aquele tenant.
- **FR-013**: O sistema MUST identificar quando um tenant não possui vínculo próprio de prompt operacional e MUST apresentar esse estado como **erro de configuração**, com destaque visual distinto de um estado saudável.
- **FR-014**: A detecção do estado "sem vínculo" MUST estar concentrada em um único ponto do código, de modo que a troca do sinal usado para detectá-lo não exija alterações espalhadas.
- **FR-015**: No estado "sem vínculo", o sistema MUST NOT apresentar o conteúdo do prompt retornado como sendo a configuração vigente do tenant.
- **FR-016**: No estado "sem vínculo", o sistema MUST continuar exibindo as proteções que se aplicam ao tenant.
- **FR-017**: O alerta de erro de configuração MUST oferecer ação direta para vincular um prompt, executável sem sair da tela do tenant.
- **FR-018**: Após vínculo bem-sucedido pela ação direta, a tela MUST refletir o novo estado imediatamente, lido do servidor.
- **FR-019**: A visão de configuração do tenant MUST se restringir ao nó operacional nesta entrega.

### Proteções (guardrails) na visão do tenant

- **FR-020**: O sistema MUST exibir as proteções aplicáveis ao tenant, distinguindo visualmente as globais das vinculadas ao prompt.
- **FR-021**: As proteções globais MUST vir acompanhadas de indicação de que são aplicadas automaticamente e não podem ser removidas naquela tela.
- **FR-022**: O conjunto de proteções exibido MUST corresponder ao que o atendimento efetivamente aplica àquele tenant, sem divergência com a resolução do servidor.

### Associação em massa

- **FR-023**: A tela de prompts MUST oferecer, para um prompt selecionado, a ação de aplicá-lo a múltiplos tenants.
- **FR-024**: A seleção de tenants MUST permitir busca por termo e marcação de múltiplos resultados.
- **FR-025**: Antes da confirmação, o sistema MUST exibir separadamente os tenants que já usam o prompt e os que terão o vínculo alterado.
- **FR-026**: A confirmação MUST informar explicitamente que a operação substitui o vínculo anterior daquele tipo de nó e que é aplicada integralmente ou não é aplicada.
- **FR-027**: A confirmação MUST informar que vínculos de outros tipos de nó não são afetados.
- **FR-028**: O sistema MUST bloquear a confirmação com nenhum tenant selecionado.
- **FR-029**: Em caso de sucesso, o sistema MUST informar quantos tenants foram vinculados.
- **FR-030**: Em caso de falha por tenant inexistente, o sistema MUST listar os identificadores problemáticos e MUST deixar explícito que nenhum vínculo foi aplicado.
- **FR-031**: O fluxo de vínculo individual existente MUST continuar funcionando sem alteração de comportamento.

### Tratamento de erros

- **FR-032**: O sistema MUST decidir o tratamento de cada erro pelo código estruturado retornado, nunca pelo texto da mensagem.
- **FR-033**: O tratamento de erros MUST suportar as três formas de resposta em uso: envelope estruturado de regra de negócio, lista de erros de validação de schema, e mensagem de texto simples (caminho legado), sem falhar na renderização em nenhuma delas.
- **FR-034**: Quando um erro traz uma lista de bloqueadores, o sistema MUST exibi-la ao administrador em vez de apenas informar a recusa.
- **FR-035**: Na recusa de exclusão de prompt por uso, cada tenant bloqueador MUST oferecer caminho para o fluxo de vínculo correspondente.
- **FR-036**: Na recusa de exclusão de proteção por ser global, o sistema MUST oferecer a ação combinada de desmarcar o global e excluir em seguida.
- **FR-037**: Na recusa de exclusão de proteção por uso, o sistema MUST listar os prompts bloqueadores com a quantidade de tenants afetados por cada um.
- **FR-038**: A apresentação de bloqueadores do tipo tenant MUST reusar o mesmo componente da lista de tenants vinculados a um prompt, dado que o formato dos dados é idêntico.
- **FR-039**: Erros de conteúdo de prompt e de sobrescrita customizada MUST NOT ser registrados em log (regra de privacidade já vigente no projeto).

### Key Entities

- **Tenant**: o cliente atendido. Passa a exigir, no momento da criação, a indicação de qual prompt operacional usará.
- **Prompt**: texto que define identidade e comportamento do atendimento, classificado por tipo de nó (operacional, institucional, chitchat). Um deles pode ser marcado como padrão da plataforma — o que, após esta feature, é apenas rótulo informativo, não mecanismo de resolução.
- **Vínculo tenant↔prompt**: associação explícita, por tipo de nó, entre um tenant e um prompt, com possibilidade de conteúdo customizado. Relação N:N — um prompt pode servir a muitos tenants.
- **Proteção (guardrail)**: política de segurança da plataforma. É **aditiva**: as globais se somam automaticamente às vinculadas ao prompt. Diferentemente do prompt, não é seletiva nem obrigatória no cadastro.
- **Bloqueador**: item (tenant ou prompt) que impede uma exclusão, apresentado ao administrador com identificação e caminho de resolução.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos tenants criados pela interface após esta entrega possuem vínculo explícito de prompt operacional — nenhum caminho da interface permite criar tenant sem vínculo.
- **SC-002**: O administrador cadastra um tenant com prompt escolhido em no máximo um passo adicional em relação ao fluxo atual (uma escolha em lista).
- **SC-003**: Um tenant com configuração quebrada é identificável em menos de 5 segundos ao abrir seu detalhe, sem consultar nenhuma outra tela.
- **SC-004**: A correção de um tenant sem vínculo é concluída sem sair da tela do tenant, em no máximo três interações (abrir a ação, escolher o prompt, confirmar).
- **SC-005**: Aplicar um prompt a 10 tenants leva uma única operação de confirmação, contra 10 operações no fluxo atual.
- **SC-006**: Antes de confirmar a aplicação em massa, o administrador consegue enumerar exatamente quais tenants mudam e quais não mudam.
- **SC-007**: Para qualquer tenant consultado, o conjunto de proteções exibido é idêntico ao que o atendimento aplica — zero divergência entre tela e execução.
- **SC-008**: Toda recusa de exclusão apresenta ao administrador ao menos um caminho acionável de resolução, em vez de apenas a negativa.
- **SC-009**: Nenhuma das três formas de resposta de erro produz tela quebrada ou mensagem vazia.

## Assumptions

- O backend do EDI-43 está pronto para teste local e será validado em contêiner antes de produção; esta feature é implementada contra o contrato acordado no ticket e verificada contra o backend real antes da conclusão.
- A criação de tenant com prompt é **transacional no servidor**: se o vínculo falhar, o tenant não é criado. A interface não precisa tratar estado intermediário de tenant criado sem prompt.
- A semeadura do EDI-43 garante ao menos um prompt por tipo de nó, então a lista de escolha não vem vazia em operação normal.
- A migração de backfill do EDI-43 associa os tenants antigos ao prompt padrão vigente, portanto o estado "sem vínculo" é **anomalia**, não estado corriqueiro — e merece tratamento visual de erro, não de informação.
- O sinal disponível hoje para detectar "sem vínculo" no nó operacional é confiável; ele é impreciso apenas no nó institucional (herança indistinguível de vínculo próprio), que está fora do escopo desta entrega.
- Prompt órfão gerado por falha no fluxo "criar a partir de modelo" é aceito como custo cosmético. Se o volume incomodar no futuro, a resposta será filtro ou arquivamento na tela de prompts — não mudança no contrato de cadastro.
- Não existe listagem geral de tenants no produto; a seleção em massa e a consulta de tenant usam a busca por termo já existente.
- Os textos de interface seguem o padrão do projeto em português do Brasil.

## Out of Scope

- Campo de status de vínculo estruturado no contrato de leitura do tenant (não existe e não há ticket para ele).
- Sinalização de herança no nó institucional e do padrão no nó chitchat na visão do tenant.
- Alteração de prompt pelo formulário de edição de tenant.
- Tela de listagem geral de tenants com filtro de "configuração quebrada".
- Simulação (pré-visualização sem aplicar) da operação em massa no servidor.
- Qualquer alteração no repositório de backend.
