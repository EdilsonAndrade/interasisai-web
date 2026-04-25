# Tasks: Otimização de Payload de Áudio e Integração BFF (EDI-25)

**Input**: Design documents from `/specs/007-optimize-audio-payload/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/audio-payload-bff-verification.md, quickstart.md

**Tests**: Incluídos (obrigatórios para esta feature, conforme spec e constituição do projeto).

**Organization**: Tarefas agrupadas por user story para permitir implementação e validação independentes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: Mapeamento da tarefa para a user story (US1, US2, US3)
- Todas as tarefas incluem caminho de arquivo explícito

---

## Phase 1: Setup (Shared Preparation)

**Purpose**: Preparar estrutura mínima e pontos de integração para reduzir retrabalho nas fases seguintes.

- [X] T001 Auditar pontos atuais de envio (voz e texto) em src/hooks/useChatAssistant.ts
- [X] T002 [P] Criar pasta de serviços de integração em src/services/
- [X] T003 [P] Criar arquivo de índice para exportações de serviço em src/services/index.ts

**Checkpoint**: Estrutura base preparada para implementar gateway e utilitários sem bloquear as user stories.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura comum que BLOQUEIA todas as user stories.

**⚠️ CRITICAL**: Nenhuma tarefa de US1/US2/US3 deve iniciar antes do fechamento desta fase.

- [X] T004 Criar contratos tipados de integração BFF em src/services/chatGateway.types.ts
- [X] T005 Implementar normalização de resposta e erro de integração em src/services/chatGateway.ts
- [X] T006 Implementar funções sendTextMessageToBff e sendAudioMessageToBff com credentials em src/services/chatGateway.ts
- [X] T007 [P] Criar testes de contrato JSON/FormData do gateway em src/services/chatGateway.test.ts
- [X] T008 Criar utilitário de otimização de áudio com Web Audio API em src/hooks/audioOptimization.ts
- [X] T009 [P] Criar testes determinísticos do utilitário de otimização em src/hooks/audioOptimization.test.ts
- [X] T010 Atualizar imports e consumo de serviço/utilitário no hook em src/hooks/useChatAssistant.ts

**Checkpoint**: Fundação pronta; user stories podem avançar com risco técnico reduzido.

---

## Phase 3: User Story 1 - Enviar áudio otimizado (Priority: P1) 🎯 MVP

**Goal**: Garantir envio de voz apenas após otimização válida, com duração otimizada menor que a original.

**Independent Test**: Gravar áudio válido e validar que o payload enviado contém arquivo otimizado com optimizedDurationMs < originalDurationMs e resposta do chat concluída.

### Tests for User Story 1

- [X] T011 [US1] Adicionar teste falhando para redução de duração antes do envio em src/hooks/useChatAssistant.test.ts
- [X] T012 [US1] Adicionar teste falhando para campos FormData (kind, audio, originalDurationMs, optimizedDurationMs) em src/hooks/useChatAssistant.test.ts

### Implementation for User Story 1

- [X] T013 [US1] Integrar pipeline optimizeAudioForBff no fluxo de envio de voz em src/hooks/useChatAssistant.ts
- [X] T014 [US1] Montar FormData de voz e enviar via sendAudioMessageToBff em src/hooks/useChatAssistant.ts
- [X] T015 [US1] Registrar evidência de redução de duração para observabilidade em src/hooks/useChatAssistant.ts
- [X] T016 [US1] Ajustar estado/feedback de sucesso do fluxo de voz sem quebrar continuidade no widget em src/components/chat/ChatWidget.tsx

**Checkpoint**: US1 funcional e testável isoladamente.

---

## Phase 4: User Story 2 - Enviar texto no mesmo canal de integração (Priority: P2)

**Goal**: Unificar o envio textual no mesmo gateway BFF sem regressão do fluxo atual.

**Independent Test**: Enviar mensagens somente de texto e validar request com kind=text, credentials e resposta do chat preservada.

### Tests for User Story 2

- [X] T017 [US2] Adicionar teste falhando para garantir uso do gateway BFF no envio textual em src/hooks/useChatAssistant.test.ts
- [X] T018 [P] [US2] Adicionar teste falhando de contrato textual (JSON + credentials) em src/services/chatGateway.test.ts

### Implementation for User Story 2

- [X] T019 [US2] Refatorar submit textual para sendTextMessageToBff em src/hooks/useChatAssistant.ts
- [X] T020 [US2] Preservar mapeamento de resposta do assistente após integração BFF em src/hooks/useChatAssistant.ts
- [X] T021 [US2] Remover caminho legado de envio textual direto no hook em src/hooks/useChatAssistant.ts

**Checkpoint**: US2 funcional e testável isoladamente.

---

## Phase 5: User Story 3 - Tratar falhas de envio e otimização (Priority: P3)

**Goal**: Exibir feedback claro em falhas de otimização ou integração, mantendo estabilidade e possibilidade de retry.

**Independent Test**: Simular erro de otimização e indisponibilidade do BFF para voz/texto, validando mensagem clara em até 2s e opção de nova tentativa.

### Tests for User Story 3

- [X] T022 [US3] Adicionar teste falhando para falha de otimização bloquear payload inválido em src/hooks/useChatAssistant.test.ts
- [X] T023 [US3] Adicionar teste falhando para falha de integração com estado retryable (voz/texto) em src/hooks/useChatAssistant.test.ts
- [X] T024 [US3] Adicionar teste de componente para erro visível sem travar interação em src/components/chat/ChatWidget.test.tsx

### Implementation for User Story 3

- [X] T025 [US3] Implementar branch de erro de otimização com mensagem acionável no hook em src/hooks/useChatAssistant.ts
- [X] T026 [US3] Implementar tratamento unificado de erro do gateway para voz/texto em src/hooks/useChatAssistant.ts
- [X] T027 [US3] Expor feedback acessível e affordance de retry no widget em src/components/chat/ChatWidget.tsx
- [X] T028 [US3] Implementar retry seguro do último payload válido no hook em src/hooks/useChatAssistant.ts

**Checkpoint**: US3 funcional e testável isoladamente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar validações finais, documentação e evidências de conformidade.

- [X] T029 [P] Consolidar ajustes e execução de testes focados de hook em src/hooks/useChatAssistant.test.ts
- [X] T030 [P] Consolidar ajustes e execução de testes focados de gateway em src/services/chatGateway.test.ts
- [X] T031 Atualizar cenários de validação manual e evidências de aceite em specs/007-optimize-audio-payload/quickstart.md
- [X] T032 Atualizar checklist de verificação do contrato BFF em specs/007-optimize-audio-payload/contracts/audio-payload-bff-verification.md

**Checkpoint**: Feature pronta para execução de implementação guiada e validação de aceite.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependências
- **Phase 2 (Foundational)**: depende da conclusão da Phase 1 e bloqueia todas as user stories
- **Phase 3 (US1)**: depende da conclusão da Phase 2
- **Phase 4 (US2)**: depende da conclusão da Phase 2
- **Phase 5 (US3)**: depende da conclusão da Phase 2 e integra comportamentos de US1/US2
- **Phase 6 (Polish)**: depende da conclusão das fases de user stories selecionadas

### User Story Dependencies

- **US1 (P1)**: independente após Foundational
- **US2 (P2)**: independente após Foundational
- **US3 (P3)**: independente após Foundational, mas valida melhor quando US1/US2 já estão implementadas

### Task Dependency Highlights

- T006 depende de T004 e T005
- T010 depende de T006 e T008
- T013 depende de T008 e T010
- T014 depende de T006 e T013
- T019 depende de T006 e T010
- T025 e T026 dependem de T010
- T028 depende de T026 e T027

---

## Parallel Opportunities

- **Phase 1**: T002 e T003
- **Phase 2**: T007 e T009 (após T004/T005/T008 disponíveis)
- **US2**: T018 pode rodar em paralelo com T017
- **Polish**: T029 e T030

---

## Parallel Example: User Story 1

- Executar em paralelo (tarefas de base já prontas):
- T011 em src/hooks/useChatAssistant.test.ts
- T009 em src/hooks/audioOptimization.test.ts

- Sequência obrigatória após paralelização:
- T013 -> T014 -> T015 -> T016

---

## Parallel Example: User Story 2

- Executar em paralelo:
- T017 em src/hooks/useChatAssistant.test.ts
- T018 em src/services/chatGateway.test.ts

- Sequência obrigatória após paralelização:
- T019 -> T020 -> T021

---

## Parallel Example: User Story 3

- Sequência de testes (mesmo arquivo):
- T022 -> T023

- Paralelo adicional:
- T024 em src/components/chat/ChatWidget.test.tsx (pode rodar em paralelo com T023)

- Sequência obrigatória de implementação:
- T025 -> T026 -> T027 -> T028

---

## Requirement Traceability (FR -> Tasks)

- **FR-001, FR-002**: T008, T009, T011, T013
- **FR-003**: T004, T006, T012, T014
- **FR-004**: T006, T017, T019
- **FR-005**: T006, T018
- **FR-006**: T004, T006, T010, T019
- **FR-007**: T012, T015, T031
- **FR-008**: T022, T025, T027
- **FR-009**: T023, T026, T028
- **FR-010**: T017, T020, T021, T029

## Success Criteria Coverage (SC -> Tasks)

- **SC-001**: T011, T012, T013, T015
- **SC-002**: T008, T009, T031
- **SC-003**: T017, T018, T019, T020
- **SC-004**: T022, T023, T024, T027
- **SC-005**: T029, T030, T031

---

## Implementation Strategy

### MVP First (US1)

1. Completar Phase 1
2. Completar Phase 2 (bloqueante)
3. Completar Phase 3 (US1)
4. Validar teste independente de US1 antes de seguir

### Incremental Delivery

1. Entregar US1 (voz otimizada)
2. Entregar US2 (texto no mesmo canal)
3. Entregar US3 (falhas e retry)
4. Finalizar com Phase 6 (polish + evidências)

### Ready Check

- Todas as tarefas seguem checklist obrigatório: `- [X] TXXX [P?] [US?] descrição + caminho`
- Dependências estão explícitas por fase e por tarefa
- Critérios independentes por user story definidos
- Mapeamento FR/SC para tarefas incluído
