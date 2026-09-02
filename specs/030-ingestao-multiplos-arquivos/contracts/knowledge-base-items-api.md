# Contract: Knowledge Base Items API

Fronteira externa consumida por `src/services/pythonBackend.ts`. Implementação real (FastAPI, PostgreSQL, pgvector) fica no serviço Python backend — fora deste repositório. Contrato copiado do detalhamento técnico já validado na issue EDI-39; qualquer divergência encontrada durante a implementação deve ser resolvida com o time de backend antes de ajustar este arquivo.

Base: `${PYTHON_BACKEND_BASE_URL}/api/v1/tenants/{tenant_id}/knowledge-base`

## 1. `GET /items` — listar itens (grid)

200:
```json
[
  {
    "id": "uuid",
    "tenant_id": "string",
    "source_type": "file",
    "filename": "precos.xlsx",
    "content_preview": "primeiros 1000 caracteres...",
    "content_length": 4832,
    "created_at": "2026-09-01T12:00:00Z",
    "updated_at": "2026-09-01T12:00:00Z"
  }
]
```

## 2. `GET /items/{item_id}` — detalhe completo

200: mesma forma do item, com `content` completo no lugar de `content_preview`/`content_length`.
404: item não existe.

## 3. `POST /items` — upload em lote (`multipart/form-data`)

Campos: `files` (0..N; `.pdf`/`.xls`/`.xlsx`/`.csv`, 10MB máx cada), `texts` (0..N strings), `mode` (`"append" | "replace"`), `duplicate_resolutions` (opcional, JSON string).

- `mode=replace`: apaga todos os itens/vetores do tenant e recria. Front já confirmou via modal antes de chamar.
- `mode=append`: filename já existente sem resolução correspondente → **409** com `conflicts`.

201:
```json
{
  "created": [{ "id": "uuid", "filename": "precos.xlsx", "source_type": "file" }],
  "replaced": [{ "id": "uuid", "filename": "servicos.csv", "source_type": "file" }]
}
```

409:
```json
{
  "detail": "Alguns arquivos já existem na base de conhecimento deste tenant.",
  "conflicts": [{ "filename": "precos.xlsx", "existing_item_id": "uuid" }]
}
```

422: nenhum arquivo/texto enviado, extensão não suportada, ou texto vazio.

## 4. `PUT /items/{item_id}` — editar conteúdo manualmente

Body: `{ "content": "texto editado" }`. 200 com item atualizado. 422 se `content` vazio.

## 5. `PUT /items/{item_id}/file` — substituir arquivo de um item (`multipart/form-data`, campo `file`)

200 com item atualizado (`filename`, `content`, `updated_at` novos). 404 se não existir; 422 se extensão não suportada.

## 6. `DELETE /items/{item_id}` — excluir item individualmente

204. 404 se não existir. Não afeta os demais itens.

## Endpoints existentes — contrato preservado (sem mudança neste ticket)

- `GET /tenants/{tenant_id}/knowledge-base` — `{ tenant_id, content, updated_at }`, `content` agora derivado (concatenação dos itens).
- `PUT /tenants/{tenant_id}/knowledge-base` e `DELETE /tenants/{tenant_id}/knowledge-base` — inalterados.
