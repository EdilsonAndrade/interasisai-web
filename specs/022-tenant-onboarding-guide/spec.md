# Feature Specification: Guia de onboarding para cadastro de tenant

**Feature Branch**: `edilsonaandrade/edi-49-adicionar-tutorial-guiado-para-cadastro-de-tenant`
**Created**: 2026-08-23
**Status**: Draft
**Ticket**: [EDI-49](https://linear.app/edilsonandrade/issue/EDI-49/adicionar-tutorial-guiado-para-cadastro-de-tenant)

**Input**: Ao cadastrar um novo tenant, deve aparecer um guia de onboarding em formato de painel lateral fixo com checklist manual, cobrindo os passos necessários para deixar o tenant configurado corretamente (prompts, guardrails, vínculo do tenant e base de conhecimento), com opção de desativação para usuários que já conhecem o processo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguir o checklist até o tenant ficar pronto (Priority: P1)

O administrador acabou de criar um tenant. Um painel lateral fixo aparece com a lista de passos necessários para deixar o tenant funcional (prompts, guardrails, vínculo, base de conhecimento, teste no site do cliente). Conforme ele completa cada passo nas telas correspondentes, volta ao painel e marca o item como concluído. Itens ainda não marcados ficam com destaque piscando, para não serem esquecidos.

**Why this priority**: é o núcleo do ticket — hoje não existe nenhuma orientação, e é comum esquecer passos (ex.: guardrail de identidade ou vínculo do tenant a algum prompt), deixando o tenant mal configurado em produção.

**Independent Test**: criar um novo tenant, verificar que o painel aparece com os 8 itens na ordem correta, marcar alguns itens e confirmar que o destaque piscando some apenas dos itens marcados; navegar entre `/admin/tenants` e `/admin/prompt-manager` e confirmar que o progresso marcado se mantém.

**Acceptance Scenarios**:

1. **Given** um tenant recém-criado, **When** o painel de onboarding é exibido, **Then** ele lista, nesta ordem: prompt operacional, prompt institucional, prompt chitchat, guardrail de identidade, ajuste dos guardrails nos três prompts, vínculo do tenant a cada prompt, cadastro da base de conhecimento, teste no site do cliente.
2. **Given** o painel aberto com itens pendentes, **When** nenhum item foi marcado, **Then** todos os itens pendentes exibem um destaque visual piscando.
3. **Given** o administrador marca um item como concluído, **When** o item é marcado, **Then** o destaque piscando desse item some e o estado marcado permanece ao navegar para outra tela do fluxo (ex.: de `/admin/tenants` para `/admin/prompt-manager`).
4. **Given** o administrador está na aba de vínculo de tenant em `/admin/prompt-manager`, **When** ele volta para a tela de tenants, **Then** o painel do guia continua visível com o progresso preservado.

---

### User Story 2 - Ser lembrado do prompt inicial e da base de conhecimento ao criar o tenant (Priority: P2)

Ao clicar no botão de criar tenant, o administrador vê um aviso informativo perguntando se o prompt inicial e a base de conhecimento do cliente já existem, antes de prosseguir. O aviso não bloqueia a criação — é apenas um lembrete, já que a base de conhecimento só pode ser cadastrada depois de existir um prompt vinculado ao tenant.

**Why this priority**: reforça a ordem correta dos passos logo no início, mas não é bloqueador — o checklist da US1 já cobre isso de forma persistente.

**Independent Test**: clicar em "criar tenant" e verificar que o aviso aparece perguntando sobre prompt inicial e base de conhecimento, e que clicar em prosseguir (mesmo sem confirmar nada) completa a criação normalmente.

**Acceptance Scenarios**:

1. **Given** a tela de criação de tenant, **When** o administrador clica no botão de criar tenant, **Then** um aviso informativo pergunta se o prompt inicial e a base de conhecimento já existem.
2. **Given** o aviso exibido, **When** o administrador o dispensa ou ignora, **Then** a criação do tenant prossegue normalmente, sem bloqueio.

---

### User Story 3 - Desativar o guia para quem já conhece o processo (Priority: P3)

Um administrador experiente, que já sabe todos os passos de configuração de um tenant, quer cadastrar sem o painel de onboarding aparecendo toda vez. Na primeira tela do guia existe uma opção clara para desativá-lo; a partir daí, novos cadastros de tenant não exibem mais o painel automaticamente.

**Why this priority**: melhora a experiência de usuários recorrentes, mas não é essencial para o valor central do ticket (garantir que a configuração seja completa para quem está aprendendo o processo).

**Independent Test**: desativar o guia na primeira exibição, criar um novo tenant em seguida e confirmar que o painel não aparece mais; verificar que a preferência permanece após recarregar a página no mesmo navegador.

**Acceptance Scenarios**:

1. **Given** o painel de onboarding exibido pela primeira vez, **When** o administrador escolhe a opção de desativar o guia, **Then** o painel se fecha e a preferência é salva no navegador.
2. **Given** o guia desativado, **When** o administrador cadastra um novo tenant, **Then** o painel de onboarding não é exibido automaticamente, e o cadastro pode ser feito manualmente.
3. **Given** o guia desativado em um navegador, **When** o administrador acessa o sistema em outro navegador ou dispositivo, **Then** o guia volta a aparecer normalmente (a preferência não sincroniza entre dispositivos).

---

### Edge Cases

- O que acontece se o administrador tentar marcar "cadastrar base de conhecimento" antes de existir qualquer prompt para o tenant? O checklist é manual e não bloqueia a marcação, mas a ordem exibida deixa claro que esse passo depende dos anteriores.
- O que acontece se o administrador fechar a aba do navegador com o checklist parcialmente concluído? Ao voltar a acessar o cadastro daquele tenant no mesmo navegador, o progresso salvo é retomado.
- O que acontece se o administrador desativar o guia no meio do checklist de um tenant específico? O painel some para cadastros futuros; o progresso do tenant em andamento deixa de ser exibido automaticamente.
- O que acontece se o administrador quiser reativar o guia depois de tê-lo desativado? Deve existir uma forma de reativação manual, já que a desativação não deve ser permanente e irreversível.
- O que acontece se o administrador limpar os dados do navegador (localStorage)? O guia volta a aparecer como se fosse a primeira vez, e qualquer progresso salvo se perde.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir um painel lateral fixo com um checklist de onboarding sempre que um novo tenant for criado, exceto quando o guia tiver sido desativado pelo usuário.
- **FR-002**: Ao clicar no botão de criar tenant na tela de tenants, o sistema MUST exibir um aviso informativo, não bloqueante, perguntando se o prompt inicial e a base de conhecimento já existem.
- **FR-003**: O checklist MUST conter, nesta ordem, os seguintes itens: (1) cadastrar prompt operacional, (2) cadastrar prompt institucional, (3) cadastrar prompt chitchat, (4) cadastrar guardrail de identidade, (5) ajustar os prompts operacional, institucional e chitchat com os guardrails corretos do tenant, (6) vincular o tenant a cada prompt existente, (7) cadastrar a base de conhecimento, (8) testar no site do cliente.
- **FR-004**: Cada item do checklist MUST poder ser marcado manualmente pelo usuário como concluído, sem depender de validação automática contra o backend.
- **FR-005**: Itens do checklist ainda não marcados como concluídos MUST exibir um destaque visual piscando/pulsante.
- **FR-006**: Na primeira exibição do painel MUST existir uma opção clara e visível para desativar o guia.
- **FR-007**: Ao desativar o guia, o sistema MUST deixar de exibir o painel automaticamente em cadastros futuros de tenant, permitindo cadastro manual sem interrupções.
- **FR-008**: A preferência de guia desativado MUST ser persistida em localStorage do navegador, sem sincronização entre dispositivos ou usuários.
- **FR-009**: O progresso do checklist (itens marcados) MUST ser preservado enquanto o usuário navega entre as telas envolvidas no fluxo (tela de tenants e tela de gerenciamento de prompts/guardrails/vínculo) durante o cadastro do mesmo tenant.
- **FR-010**: O sistema MUST oferecer uma forma de reativar o guia manualmente após ele ter sido desativado.

### Key Entities

- **Estado do guia de onboarding**: representa, por navegador, se o guia está ativo ou desativado e o progresso do checklist (quais dos 8 itens estão marcados) para o cadastro de tenant em andamento. Persistido localmente (localStorage), sem contrapartida no backend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores que completam o checklist de onboarding marcam os 8 itens antes de considerar um novo tenant pronto para uso, sem pular etapas.
- **SC-002**: Administradores experientes conseguem desativar o guia e cadastrar um tenant do início ao fim sem qualquer interrupção do painel.
- **SC-003**: O aviso sobre prompt inicial e base de conhecimento aparece de forma clara ao clicar em criar tenant, em 100% das vezes, sem impedir a conclusão da criação.
- **SC-004**: Após desativar o guia, nenhum novo cadastro de tenant no mesmo navegador exibe o painel automaticamente, até que o usuário o reative.

## Assumptions

- O guia é iniciado automaticamente ao clicar em criar tenant, exceto quando já desativado pelo usuário naquele navegador.
- A verificação de conclusão de cada passo é feita pelo próprio usuário (checklist manual); não há checagem automática contra o backend nesta versão.
- A reativação do guia (Edge Case) é feita através de um controle visível na interface (ex.: botão ou link), cujo posicionamento exato fica a critério do design da tela.
- As telas envolvidas (`/admin/tenants` e as abas de Prompts, Guardrails e Vínculo de Tenant em `/admin/prompt-manager`) continuam funcionando como hoje; o guia apenas orienta e não altera o comportamento existente dessas telas.
- O guia é pensado para o fluxo de um tenant por vez; múltiplos cadastros de tenant em paralelo no mesmo navegador não fazem parte do escopo desta versão.
