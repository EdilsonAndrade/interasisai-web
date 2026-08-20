# Data Model: Prompts e Guardrails por Nó

**Feature**: 018-guardrail-node-targets
**Date**: 2026-08-20 (revisado)

## Novo tipo

### NodeType

```typescript
export type NodeType = "operational" | "institutional" | "chitchat";
```

Espelha exatamente `app/schemas/prompt_manager.py::NodeType` no backend (`agendamento-ia`). Sem sufixo
`_node` — esse é o nome dos nós do grafo do agente (`agent_graph.py`), não o valor de `node_type` na API/DB.

## Entidade estendida

### Prompt (extensão)

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `id` | `string` | sim (existente) | — |
| `titulo` | `string` | sim (existente) | — |
| `conteudo` | `string` | sim (existente) | — |
| `is_default` | `boolean` | sim (existente) | Passa a ser único **por `node_type`** no backend, não mais globalmente. |
| `node_type` | `NodeType` | sim (novo) | Default `"operational"` no backend para registros antigos. |
| `guardrail_ids` | `string[]` | sim (existente) | **Sem mudança** — vincular um guardrail a este prompt já resolve "aplicar o guardrail a este nó". |

## Entidade inalterada

### Guardrail

**Nenhuma mudança de schema.** `titulo`, `conteudo`, `is_global` continuam exatamente como antes desta
feature. `is_global: true` continua sendo aplicado automaticamente a todos os nós (o backend resolve isso
independente de `prompt_id`).

## Tipos de request/response afetados

```typescript
export interface PromptCreateInput {
  titulo: string;
  conteudo: string;
  is_default: boolean;
  node_type: NodeType; // novo — default "operational" no formulário
  guardrail_ids: string[];
}

export type PromptUpdateInput = PromptCreateInput;
```

### TenantPromptDetail (renomeado/estendido)

```typescript
export interface TenantPromptDetail {
  tenant_id: string;
  node_type: NodeType;               // novo — nó consultado/resolvido
  prompt_id: string;
  is_active: boolean;
  custom_content_override: string | null;
  prompt_titulo: string;
  prompt_conteudo: string;           // renomeado de prompt_conteudo_base
  is_default_prompt: boolean;        // prompt_is_default removido (nunca existiu no backend real)
  guardrails_associados: Guardrail[];
}
```

`GET /tenant/{tenant_id}` passa a aceitar `?node_type=operational|institutional|chitchat` (default
`operational` — preserva o contrato para quem não envia o parâmetro).

## Cadeia de resolução em runtime (não é uma entidade nova, apenas documentação)

```
operational (tenant)
  1. vínculo ativo do tenant com prompt.node_type = 'operational'
  2. prompt.is_default = TRUE AND node_type = 'operational'
  3. fallback local (arquivo)

institutional (tenant)
  1. vínculo ativo do tenant com prompt.node_type = 'institutional'
  2. resultado já resolvido de operational(tenant) acima

chitchat (tenant)
  1. vínculo ativo do tenant com prompt.node_type = 'chitchat'
  2. prompt.is_default = TRUE AND node_type = 'chitchat'
  3. texto fixo embutido no backend
```

Guardrails aplicados em qualquer nível = guardrails vinculados ao prompt resolvido (`guardrail_ids`) +
guardrails com `is_global = true`. Toda essa cadeia é responsabilidade do backend; o frontend apenas exibe o
resultado retornado por `GET /tenant/{id}?node_type=...`.

## Diagrama de relacionamento (conceitual)

```text
Prompt (node_type: operational | institutional | chitchat)
  └─ guardrail_ids: string[]  ──► Guardrail (inalterado)

Tenant ──► até 3 vínculos ativos simultâneos, um por node_type de Prompt
```
