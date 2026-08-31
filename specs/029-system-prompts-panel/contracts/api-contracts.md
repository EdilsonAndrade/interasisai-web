# API Contracts: Painel Admin — Prompts do Sistema

Backend já implementado (EDI-71, dev notes do ticket). Base: `NEXT_PUBLIC_PYTHON_BACKEND_URL` + `/api/v1/system-prompts`. Este documento é referência para a camada de serviço frontend (`src/services/systemPrompts.ts`) — nenhum endpoint é criado ou alterado por esta feature.

## Listar prompts

```
GET /api/v1/system-prompts
```

**Resposta 200**:

```json
[
  {
    "id": "string",
    "prompt_key": "routing_agent",
    "titulo": "routing_agent",
    "current_version": "string",
    "last_version": "string",
    "created_at": "2026-08-31T00:00:00Z",
    "updated_at": "2026-08-31T00:00:00Z"
  }
]
```

Array com os 4 prompts fixos.

## Obter um prompt

```
GET /api/v1/system-prompts/{prompt_key}
```

- **200**: mesmo shape de item acima.
- **404**: `prompt_key` inválido/fora do conjunto fixo.

## Atualizar (salvar) um prompt

```
PUT /api/v1/system-prompts/{prompt_key}
Content-Type: application/json

{ "conteudo": "novo texto" }
```

- **200**: grava `conteudo` como `current_version`, move o valor anterior de `current_version` para `last_version`. Retorna o registro atualizado.
- **400**: `conteudo` vazio ou apenas espaços em branco.

## Reverter (rollback) um prompt

```
POST /api/v1/system-prompts/{prompt_key}/rollback
```

- **200**: troca `current_version` ↔ `last_version` (reversível — aplicar duas vezes retorna ao estado original). Retorna o registro atualizado.

## `prompt_key` — valores fixos

- `routing_agent`
- `groundedness_rule`
- `chitchat_no_knowledge_rule`
- `booking_integrity_rule`

Sem endpoint de criação — o frontend nunca envia um `prompt_key` fora deste conjunto, e trata qualquer chave desconhecida vinda do backend de forma defensiva (exibe usando `titulo` recebido, sem quebrar a listagem — Edge Case da spec).

## Mapeamento para o serviço frontend

| Função em `systemPrompts.ts` | Endpoint | Union type de retorno |
|---|---|---|
| `fetchSystemPrompts()` | `GET /system-prompts` | `SystemPromptListResult` |
| `fetchSystemPrompt(promptKey)` | `GET /system-prompts/{prompt_key}` | `SystemPromptSingleResult` |
| `updateSystemPrompt(promptKey, { conteudo })` | `PUT /system-prompts/{prompt_key}` | `SystemPromptSingleResult` |
| `rollbackSystemPrompt(promptKey)` | `POST /system-prompts/{prompt_key}/rollback` | `SystemPromptSingleResult` |

Segue o mesmo padrão union-type (`{ ok: true, status, data } | { ok: false, status, message, ... }`) e tratamento de erro (`normalizeApiError`) já usado em `src/services/promptManager.ts`.
