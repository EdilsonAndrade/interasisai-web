# Phase 1 Data Model: Painel Admin — Prompts do Sistema

Dados persistidos e versionados inteiramente no backend (Python/FastAPI + tabela `system_prompts`, já implementado). O frontend apenas espelha o contrato retornado pela API — nenhum armazenamento local além do estado de UI (React state).

## Entidade: SystemPrompt

Representa um dos 4 prompts administráveis do agente de IA.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único do registro (UUID/PK do backend). |
| `prompt_key` | `"routing_agent" \| "groundedness_rule" \| "chitchat_no_knowledge_rule" \| "booking_integrity_rule"` | Chave fixa do prompt — conjunto fechado, sem criação/exclusão pelo painel. |
| `titulo` | `string` | Nome de exibição vindo do `agent_graph.py` (ex.: `"GROUNDEDNESS_RULE"`), usado como título na listagem e no editor. |
| `current_version` | `string` | Conteúdo vigente (versão em uso pelo agente). Exibido/editado no `SystemPromptEditor`. |
| `last_version` | `string` | Conteúdo da versão anterior, preservado para rollback. Nunca nulo (migration inicial popula ambos os campos com o conteúdo hardcoded atual). |
| `created_at` | `string` (ISO 8601) | Data de criação do registro. Exibido apenas como metadado informativo, se necessário. |
| `updated_at` | `string` (ISO 8601) | Data da última atualização (save ou rollback). |

### Regras de negócio (aplicadas no backend, refletidas na UI)

- `current_version` nunca é vazio/nulo — validado no backend (`PUT` rejeita conteúdo vazio com 400).
- `last_version` nunca é nulo — garantido pela migration inicial (popula ambos os campos com o conteúdo hardcoded).
- Rollback é uma troca simétrica (`current_version ↔ last_version`): aplicado duas vezes, retorna ao estado original (spec FR-016 / SC-006).
- `prompt_key` é imutável e não editável pela UI.

### Estados de UI (não persistidos)

- **Seleção**: qual `prompt_key` está atualmente aberto no editor (estado local do orquestrador `SystemPromptsPage`).
- **Rascunho não salvo**: conteúdo digitado no textarea antes de `Salvar`, mantido em estado local até confirmação de sucesso ou descarte.
- **Pendência de operação**: flag de carregamento por prompt (`saving` / `rollingBack`) para bloquear envios duplicados (FR-012) e não sobrepor respostas de operações concorrentes entre prompts diferentes (Edge Case da spec).

## Sem novas entidades de persistência no frontend

Não há Context API global nem armazenamento local (localStorage) — o estado vive inteiramente no hook `useSystemPrompts` durante a sessão da página, e a fonte de verdade é sempre a API.
