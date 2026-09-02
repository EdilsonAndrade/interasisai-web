# Feature Specification: Ingestão de Dados por Múltiplos Arquivos

**Feature Branch**: `edilsonaandrade/edi-39-permitir-ingestao-de-dados-por-multiplos-arquivos`
**Created**: 2026-09-01
**Status**: Draft
**Input**: Linear EDI-39 — Permitir ingestão de dados por múltiplos arquivos no painel de administração de tenants.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar múltiplos arquivos para compor a base de conhecimento (Priority: P1)

Como usuário administrativo, ao acessar a tela de ingestão de dados de um tenant, quero enviar vários arquivos (PDF, XLS ou CSV) de uma vez, além de poder colar texto direto, para que todo esse conteúdo componha a base de conhecimento do tenant.

**Why this priority**: É a funcionalidade central do ticket — sem ela, a ingestão continua limitada a um único texto corrido, obrigando o admin a consolidar manualmente vários arquivos antes de colar.

**Independent Test**: Pode ser testado enviando 2+ arquivos diferentes (ex: um PDF e um CSV) numa ingestão nova e verificando que o conteúdo extraído de ambos aparece na base de conhecimento do tenant.

**Acceptance Scenarios**:

1. **Given** um tenant sem ingestão prévia, **When** o admin envia 3 arquivos (PDF, XLS, CSV) de uma vez, **Then** o conteúdo extraído dos 3 arquivos passa a compor a base de conhecimento do tenant.
2. **Given** um tenant sem ingestão prévia, **When** o admin cola texto direto e também anexa um arquivo na mesma submissão, **Then** ambos os conteúdos (texto colado + arquivo) compõem a base de conhecimento.
3. **When** o admin tenta enviar um arquivo em formato não suportado, **Then** o sistema recusa o envio e explica quais formatos são aceitos.

---

### User Story 2 - Escolher entre substituir ou adicionar a uma ingestão existente (Priority: P1)

Como usuário administrativo, quando já existe uma ingestão para o tenant, quero escolher entre substituir todos os dados existentes ou acrescentar os novos arquivos/textos ao que já existe, confirmando a ação antes de ela ser executada.

**Why this priority**: Evita perda acidental de dados e é a decisão mais arriscada do fluxo — precisa de confirmação explícita e é bloqueante para qualquer ingestão em tenant que já tem dados.

**Independent Test**: Pode ser testado em um tenant com ingestão prévia, alternando o toggle entre "substituir" e "adicionar", e verificando que cada modo pede confirmação e produz o resultado esperado (dados antigos apagados vs. dados antigos preservados + novos anexados).

**Acceptance Scenarios**:

1. **Given** um tenant com ingestão existente, **When** o admin ativa a opção de substituir e envia novos arquivos, **Then** o sistema exibe um modal perguntando se deseja substituir todos os dados de ingestão antes de executar.
2. **Given** o admin confirma a substituição no modal, **When** a ação é executada, **Then** todo o conteúdo anterior é removido e apenas o conteúdo dos novos arquivos/texto passa a existir.
3. **Given** um tenant com ingestão existente, **When** o admin deixa a opção de substituir desmarcada e envia novos arquivos, **Then** o sistema pergunta se deseja adicionar os novos arquivos/texto à ingestão existente, e ao confirmar o conteúdo antigo permanece somado ao novo.
4. **Given** o admin envia (modo adicionar) um arquivo com o mesmo nome de um já existente na ingestão, **When** a submissão ocorre, **Then** o sistema avisa que o nome já existe e pergunta se deve substituir aquele item específico ou manter ambos como itens separados — nunca substitui ou duplica sem essa confirmação.
5. **Given** qualquer uma das confirmações acima, **When** o admin cancela o modal, **Then** nenhuma alteração é feita na base de conhecimento.

---

### User Story 3 - Consultar, substituir ou excluir um item individualmente na grid (Priority: P2)

Como usuário administrativo, quero ver uma grid com todos os arquivos/textos já submetidos (com uma prévia do conteúdo), abrir o conteúdo completo de um item, substituir apenas o arquivo daquele item, ou excluí-lo individualmente sem afetar os demais.

**Why this priority**: Depende das User Stories 1 e 2 já existirem (só faz sentido gerenciar itens depois que a ingestão por múltiplos arquivos existe), mas é essencial para manutenção contínua da base de conhecimento sem precisar reenviar tudo.

**Independent Test**: Pode ser testado em um tenant com 2+ itens já ingeridos, abrindo o modal de detalhe de um item, substituindo o arquivo daquele item por outro, e excluindo um segundo item — confirmando que os itens não afetados permanecem intactos.

**Acceptance Scenarios**:

1. **Given** um tenant com itens já ingeridos, **When** o admin acessa a tela, **Then** vê uma grid listando cada arquivo/texto submetido com uma prévia limitada aos primeiros 1000 caracteres do conteúdo.
2. **Given** a grid de itens, **When** o admin clica em um item, **Then** um modal abre mostrando o conteúdo completo daquele item com rolagem.
3. **Given** o modal de um item aberto, **When** o admin escolhe substituir o arquivo daquele item e envia um novo arquivo, **Then** o sistema pergunta a confirmação, e ao confirmar, o conteúdo daquele item específico é atualizado, mantendo os demais itens intactos.
4. **Given** a grid de itens, **When** o admin escolhe excluir um item, **Then** o sistema pergunta a confirmação, e ao confirmar, apenas aquele item é removido — os demais itens continuam disponíveis normalmente.

---

### User Story 4 - Continuar editando o texto extraído como hoje (Priority: P3)

Como usuário administrativo, depois que os arquivos são ingeridos, quero continuar podendo editar livremente o texto extraído (de Excel, PDF ou TXT), do mesmo jeito que já funciona hoje.

**Why this priority**: É uma garantia de não regressão de um comportamento já existente, não uma capacidade nova — importante, mas de menor risco/impacto que as anteriores.

**Independent Test**: Pode ser testado editando manualmente o conteúdo de um item já ingerido e confirmando que a alteração é salva e refletida na tela de preview.

**Acceptance Scenarios**:

1. **Given** um item já ingerido a partir de um arquivo, **When** o admin edita manualmente o texto exibido, **Then** a alteração é salva e passa a valer como conteúdo daquele item.
2. **Given** conteúdo editado manualmente, **When** o admin volta à tela de preview geral, **Then** o texto editado aparece refletido no conteúdo consolidado do tenant.

---

### Edge Cases

- O que acontece se o admin enviar um arquivo vazio, corrompido ou de um formato não suportado (ex: .docx)? → Sistema recusa o item, informando o motivo, sem afetar os demais arquivos válidos da mesma submissão.
- O que acontece se o admin tentar submeter a ingestão sem nenhum arquivo e sem nenhum texto? → Sistema impede o envio e orienta que ao menos um arquivo ou texto é necessário.
- O que acontece se o admin colar um texto vazio (só espaços)? → Sistema recusa como item inválido.
- O que acontece se dois arquivos enviados na mesma submissão tiverem o mesmo nome entre si (não com um já existente)? → Tratado como duplicidade dentro da própria submissão, seguindo a mesma confirmação de nome duplicado.
- O que acontece com tenants que já tinham uma ingestão única (texto corrido) antes desta funcionalidade existir? → Esse conteúdo é convertido automaticamente em um item da nova grid, sem exigir ação do admin, e continua aparecendo normalmente na tela de preview.
- O que acontece se o admin excluir o único item restante da base de conhecimento? → Permitido; a base de conhecimento do tenant fica vazia, mesmo comportamento de hoje quando não há ingestão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o admin envie múltiplos arquivos (PDF, XLS/XLSX ou CSV) numa única submissão, além do texto direto já suportado hoje.
- **FR-002**: O sistema DEVE extrair o conteúdo textual de cada arquivo enviado e usá-lo para compor a base de conhecimento do tenant.
- **FR-003**: O sistema DEVE oferecer uma opção (toggle) para o admin escolher entre "substituir" toda a ingestão existente ou "adicionar" os novos arquivos/texto à ingestão existente.
- **FR-004**: O sistema DEVE pedir confirmação explícita do admin, via modal, antes de executar qualquer ação de substituição total, adição, substituição de item individual ou exclusão de item.
- **FR-005**: O sistema DEVE detectar quando um arquivo enviado em modo "adicionar" tem o mesmo nome de um arquivo já existente na ingestão do tenant, e perguntar ao admin se deseja substituir aquele item específico ou manter ambos.
- **FR-006**: O sistema NUNCA DEVE substituir ou duplicar silenciosamente um item com nome já existente sem confirmação do admin.
- **FR-007**: O sistema DEVE exibir uma grid com todos os itens (arquivos e textos) já submetidos para o tenant, mostrando uma prévia limitada aos primeiros 1000 caracteres do conteúdo de cada item.
- **FR-008**: O sistema DEVE permitir abrir um modal com o conteúdo completo de um item, com rolagem, ao clicar no item na grid.
- **FR-009**: O sistema DEVE permitir substituir apenas o arquivo de um item específico (enviando outro arquivo por cima), preservando os demais itens intactos.
- **FR-010**: O sistema DEVE permitir excluir um item específico da ingestão, preservando os demais itens intactos.
- **FR-011**: O sistema DEVE manter a tela de preview atual funcionando, exibindo o conteúdo consolidado (todos os itens ativos) do tenant.
- **FR-012**: O sistema DEVE continuar permitindo a edição manual livre do texto extraído de qualquer item, como já ocorre hoje.
- **FR-013**: O sistema DEVE migrar automaticamente, sem ação do admin, o conteúdo de ingestões existentes (modelo de texto único anterior a esta funcionalidade) para um item na nova grid, preservando o conteúdo já ingerido.
- **FR-014**: O sistema DEVE rejeitar arquivos com formato não suportado ou vazios, informando o motivo ao admin, sem interromper o processamento dos demais arquivos válidos da mesma submissão.
- **FR-015**: O sistema DEVE rejeitar arquivos maiores que 10MB, informando o motivo ao admin.
- **FR-016**: O sistema DEVE impedir a submissão quando nenhum arquivo e nenhum texto forem fornecidos.

### Key Entities *(include if feature involves data)*

- **Item de Ingestão**: Representa uma unidade de conteúdo (um arquivo ou um texto colado) que compõe a base de conhecimento de um tenant. Possui origem (arquivo ou texto), nome (quando originado de arquivo), conteúdo textual extraído/colado, e datas de criação/atualização.
- **Base de Conhecimento do Tenant**: Representa o conteúdo consolidado de todos os itens de ingestão ativos de um tenant, usado hoje na tela de preview e no atendimento do tenant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um admin consegue ingerir 3 arquivos de formatos diferentes numa única submissão em menos de 1 minuto (sem contar o tempo de upload dos arquivos em si).
- **SC-002**: 100% das ações destrutivas (substituir tudo, substituir item, excluir item) exigem confirmação explícita antes de serem executadas — nenhuma perda de dados ocorre sem confirmação do admin.
- **SC-003**: Um admin consegue localizar e revisar o conteúdo completo de qualquer item já ingerido em até 2 cliques a partir da tela de ingestão.
- **SC-004**: Tenants com ingestão prévia ao lançamento desta funcionalidade continuam com seu conteúdo visível e funcional na tela de preview, sem exigir nenhuma ação manual de migração pelo admin.
- **SC-005**: Um admin consegue substituir ou remover um item específico sem afetar o conteúdo dos demais itens da mesma ingestão, em 100% dos casos testados.

## Assumptions

- O binário original dos arquivos enviados (PDF/XLS/CSV) não é armazenado — apenas o texto extraído é persistido. Substituir o arquivo de um item descarta o binário anterior.
- Tamanho máximo de 10MB por arquivo; não há limite rígido de quantidade de arquivos por submissão.
- Formatos aceitos nesta fase: PDF, XLS/XLSX e CSV, além de texto colado direto (mesmo comportamento atual).
- Textos colados diretamente passam a ser tratados como itens da mesma grid usada para arquivos, deixando de existir como campo separado.
- A reindexação/vetorização do conteúdo continua ocorrendo em segundo plano após a confirmação da ação, sem bloquear a resposta ao admin.
