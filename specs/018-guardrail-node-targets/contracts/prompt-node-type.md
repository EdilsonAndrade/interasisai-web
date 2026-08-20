# API Contract: Prompts com Nó de Destino (`node_type`)

**Feature**: 018-guardrail-node-targets
**Date**: 2026-08-20
**Source of truth**: `agendamento-ia/specs/003-guardrails-por-no/contracts/prompt-node-type.md`
(backend real, 27/29 tarefas concluídas). Este documento espelha o contrato do lado do consumidor (frontend).

## `GET /api/v1/prompt-manager/prompts`

Sem mudança de uso neste frontend (continua sem filtro de `node_type` na query — a `PromptList` exibe todos
os prompts de todos os nós, com badge indicando cada um). Cada item da resposta passa a incluir `node_type`.

```json
[
  { "id": "...", "titulo": "...", "conteudo": "...", "is_default": false, "node_type": "operational", "guardrail_ids": ["g1"] }
]
```

## `POST /api/v1/prompt-manager/prompts` / `PUT /api/v1/prompt-manager/prompts/{id}`

**Request body** (campo novo em negrito):

```json
{
  "titulo": "Guardrails Chitchat - Barbearia X",
  "conteudo": "...",
  "is_default": false,
  "node_type": "chitchat",
  "guardrail_ids": ["g1", "g3"]
}
```

`node_type`: enviado sempre pelo frontend (default `"operational"` no formulário quando o usuário não altera).

## `POST /api/v1/prompt-manager/link-tenant`

Sem mudança de request/response. O `node_type` do vínculo é derivado pelo backend a partir do `prompt_id`
informado — o frontend só precisa garantir que o dropdown de prompts, na tela de vínculo, esteja filtrado
pelo nó selecionado (para não permitir escolher um prompt do nó errado).

## `GET /api/v1/prompt-manager/tenant/{tenant_id}`

**Novo query param opcional**: `node_type` (`operational` | `institutional` | `chitchat`), default
`operational`. `fetchTenantPromptDetail(tenantId, nodeType?, signal?)` no `promptManager.ts` anexa
`?node_type=...` somente quando `nodeType` é passado explicitamente.

**Response**:

```json
{
  "tenant_id": "1234",
  "node_type": "institutional",
  "prompt_id": "b3f1...",
  "prompt_titulo": "Atendimento Barbearia",
  "prompt_conteudo": "...",
  "custom_content_override": null,
  "is_default_prompt": false,
  "is_active": true,
  "guardrails_associados": [{ "id": "g1", "titulo": "...", "conteudo": "...", "is_global": false }]
}
```

Campos renomeados em relação ao contrato anterior do frontend (achado incidental, corrigido nesta feature):
`prompt_conteudo_base` → `prompt_conteudo`; `prompt_is_default` removido (nunca existiu no backend real),
`is_default_prompt` passa a ser obrigatório.
