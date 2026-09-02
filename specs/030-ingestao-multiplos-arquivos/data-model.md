# Phase 1 Data Model: Ingestão de Dados por Múltiplos Arquivos

Modelos usados no frontend (`src/services/pythonBackend.types.ts`). O armazenamento real (`tenant_knowledge_base_items` em PostgreSQL) vive no serviço Python backend — aqui documentamos apenas o formato que o frontend consome/envia, espelhando o contrato definido em EDI-39.

## KnowledgeBaseItem (linha da grid)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` (uuid) | Identificador do item |
| `tenant_id` | `string` | |
| `source_type` | `"file" \| "texto"` | Origem do conteúdo |
| `filename` | `string \| null` | Nome original; `null` para texto colado |
| `content_preview` | `string` | Primeiros 1000 caracteres do conteúdo |
| `content_length` | `number` | Tamanho total do conteúdo, para indicar truncamento na UI |
| `created_at` | `string` (ISO) | |
| `updated_at` | `string` (ISO) | |

## KnowledgeBaseItemDetail (modal de conteúdo completo)

Mesmos campos de `KnowledgeBaseItem`, substituindo `content_preview`/`content_length` por:

| Campo | Tipo | Notas |
|---|---|---|
| `content` | `string` | Conteúdo completo, renderizado com `whitespace-pre-wrap` |

## UploadMode

```ts
type KnowledgeBaseUploadMode = "append" | "replace";
```

Reflete o toggle da tela — controla o campo `mode` enviado no `POST /knowledge-base/items`.

## DuplicateResolution (enviado no retry após 409)

| Campo | Tipo | Notas |
|---|---|---|
| `filename` | `string` | |
| `action` | `"replace" \| "keep_both"` | Escolha do admin no `KnowledgeBaseDuplicateDialog` |
| `existing_item_id` | `string` (uuid) | Item existente conflitante, vindo do 409 |

## UploadConflict (recebido no 409)

| Campo | Tipo | Notas |
|---|---|---|
| `filename` | `string` | |
| `existing_item_id` | `string` (uuid) | |

## UploadResult (resposta 201)

| Campo | Tipo | Notas |
|---|---|---|
| `created` | `{ id, filename, source_type }[]` | Itens novos |
| `replaced` | `{ id, filename, source_type }[]` | Itens substituídos (modo replace, ou resolução "replace" de duplicidade) |

## Validação client-side (Zod, antes de qualquer chamada à API)

- Arquivo: extensão em `.pdf`/`.xls`/`.xlsx`/`.csv` (case-insensitive) e tamanho ≤ 10MB.
- Texto colado: não vazio após `trim()`.
- Submissão: pelo menos 1 arquivo válido OU 1 texto válido presente.

## Relação com entidades existentes

- `KnowledgeBaseItem` é o novo nível de granularidade abaixo de `KnowledgeBase` (tipo já existente em `pythonBackend.types.ts`, que representa o `content` consolidado do tenant). `KnowledgeBase.content` continua sendo a concatenação server-side dos itens ativos — nenhuma mudança de tipo necessária nesse contrato existente.
