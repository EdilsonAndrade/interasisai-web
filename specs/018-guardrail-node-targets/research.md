# Phase 0 Research: Prompts e Guardrails por Nó

**Feature**: 018-guardrail-node-targets
**Date**: 2026-08-20 (revisado)

## Como isto foi decidido

A decisão original deste documento (campo `nodes: NodeType[]` no `Guardrail`) foi **descartada** após
inspecionar a implementação real do backend (`agendamento-ia`, branch
`edilsonaandrade/edi-42-permitir-associar-guardrails-ao-chitchat_node`, spec
`specs/003-guardrails-por-no/`, 27/29 tarefas concluídas e testadas). O backend adotou um modelo diferente —
mais simples e já validado — e o frontend foi adaptado a ele. Ver `specs/003-guardrails-por-no/research.md`
(R1–R5) no repositório `agendamento-ia` para o raciocínio completo do lado backend.

## Decisão 1: Onde representar o "nó de destino"

- **Decision**: `node_type` vive no **`Prompt`**, não no `Guardrail`. Cada prompt pertence a exatamente um
  nó (`operational` | `institutional` | `chitchat`). A associação guardrail↔nó continua sendo feita através
  do N:N `guardrail_ids` já existente em `Prompt` — vincular um guardrail a um prompt de um nó específico já
  resolve o "destino" pedido no ticket.
- **Rationale**: Reaproveita 100% o modelo N:N já implementado e testado neste frontend (seletor de
  guardrails em `PromptFormModal`). Nenhum campo novo em `Guardrail`. Simetria exata com o modelo de dados
  real do backend (`prompts.node_type`).
- **Alternatives considered (rejeitada)**: `Guardrail.nodes: NodeType[]`, com o backend traduzindo esse array
  em múltiplos vínculos internos por nó. Rejeitada porque essa tradução não existe no backend real — exigiria
  pedir ao time de backend para refazer um trabalho já completo e testado, por um design pior (não-atômico,
  implícito).

## Decisão 2: Nomenclatura do `NodeType`

- **Decision**: `"operational" | "institutional" | "chitchat"` — sem sufixo `_node`, espelhando exatamente
  `app/schemas/prompt_manager.py::NodeType` no backend.
- **Rationale**: Os nomes dos *nós do agente* (`operational_node`, etc., em `agent_graph.py`) são diferentes
  dos valores de `node_type` na API/DB (`operational`, etc.). Usar o valor exato do contrato evita um mapeamento
  desnecessário no frontend.

## Decisão 3: Tela de vínculo de tenant

- **Decision**: `TenantLinkSection` ganha um seletor de nó (3 abas) que filtra a lista de prompts exibida e é
  passado para `fetchTenantPromptDetail`/`linkTenantToPrompt` via o novo parâmetro `node_type` da API
  (`GET /tenant/{id}?node_type=...`).
- **Rationale**: Sem isso, a UI continuaria só operando sobre `operational`, e não haveria como o
  administrador de fato vincular um tenant aos prompts institutional/chitchat criados nas outras histórias.
- **Alternatives considered**: 3 abas/telas totalmente separadas para "Vincular Tenant". Rejeitada por
  duplicar toda a lógica de busca/formulário já existente sem necessidade — um seletor simples no topo da
  tela já resolve, trocando apenas o filtro de prompts e o parâmetro da API.

## Decisão 4: Compatibilidade com o campo renomeado `prompt_conteudo`

- **Decision**: `TenantPromptDetail.prompt_conteudo_base` foi renomeado para `prompt_conteudo`, e
  `prompt_is_default` foi removido em favor de `is_default_prompt` (obrigatório, não mais opcional/defensivo).
- **Rationale**: Ao inspecionar `TenantPromptOverviewResponse` no backend real, o contrato já usa
  `prompt_conteudo`/`is_default_prompt` — os nomes antigos no tipo do frontend nunca correspondiam ao que o
  backend de fato envia (achado incidental, não introduzido por esta feature, mas corrigido por estar no
  mesmo tipo sendo alterado para adicionar `node_type`).

## Resumo

Nenhuma incerteza técnica remanescente. O modelo `node_type` no `Prompt` está implementado e testado dos dois
lados (backend quase concluído; frontend implementado nesta feature).
