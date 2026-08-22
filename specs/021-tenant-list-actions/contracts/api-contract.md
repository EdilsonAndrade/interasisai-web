# API Contract consumido pelo frontend (EDI-46)

Fonte: ticket EDI-45 (backend, em desenvolvimento em paralelo). Este contrato é tratado como estável para a implementação do frontend; a validação ponta a ponta acontece via `quickstart.md` quando o backend estiver disponível.

## `GET /api/v1/tenants/{tenant_id}/delete-impact`

Pré-visualização do impacto de excluir o tenant. Chamado ao abrir o modal de exclusão, antes de qualquer ação destrutiva.

**200 OK**

```json
{
  "tenant_id": "string",
  "prompts_to_delete": [{ "id": "string", "titulo": "string", "node_type": "operational" }],
  "prompts_to_unlink_only": [{ "id": "string", "titulo": "string" }],
  "guardrails_to_delete": [{ "id": "string", "titulo": "string" }],
  "guardrails_to_unlink_only": [{ "id": "string", "titulo": "string", "is_global": false }]
}
```

**404** — `{ "detail": { "code": "TENANT_NOT_FOUND", "message": "...", "blockers": [] } }` (código já conhecido em `apiError.ts`).
**5xx / rede** — tratado como erro genérico retryable (padrão `normalizeApiError`).

**Efeito no frontend**: se a chamada falhar, o modal mostra o erro e **não libera** o campo de confirmação por nome (FR-008) — sem visibilidade do impacto real, a exclusão não pode prosseguir.

## `DELETE /api/v1/tenants/{tenant_id}`

Inalterado do ponto de vista do frontend — mesma chamada já existente em `deleteTenant()`. O que muda é a orquestração no backend (cascata de prompts/guardrails); a resposta de sucesso continua sendo tratada como `{ ok: true, status }` pelo frontend, sem depender de campos novos no corpo.

**Efeito no frontend**: só é chamado depois que o admin confirma o nome exato do tenant no modal (FR-003/FR-004/FR-006).

## `GET /api/v1/tenants/list` (novo — US4, grid de tenants)

Endpoint dedicado para o grid inicial da tela de tenants. **Separado** de `GET /api/v1/tenants` (busca por `q`, usada pela Base de Conhecimento) para não alterar o contrato já consumido por aquela feature — ver `research.md` item 10.

**Query params**: `q` (opcional — ausente/vazio lista todos, ordenado por nome), `limit` (padrão 20, máx 100), `offset` (padrão 0).

**200 OK**

```json
{
  "items": [
    {
      "id": "acme",
      "name": "Acme Barbearia",
      "google_calendar_id": "cal@x",
      "allowed_domains": ["acme.com.br"],
      "created_at": "...",
      "updated_at": null,
      "prompts": [{ "id": "p1", "titulo": "...", "node_type": "operational" }],
      "guardrails": [{ "id": "g1", "titulo": "...", "is_global": true }]
    }
  ],
  "total": 1
}
```

**Efeito no frontend**: `items` alimenta o grid (só `id`+`name` são renderizados por decisão do usuário; `prompts`/`guardrails` ficam no tipo mas não são exibidos ali). `total` decide `hasNext`/`hasPrevious` da paginação. Clicar numa linha chama `management.lookup(id)` — o mesmo caminho da busca manual — em vez de usar os dados do item de grid diretamente, para nunca divergir do card de detalhe.

## `GET /api/v1/tenants?q=...` (inalterado — busca da Base de Conhecimento)

Revertido pelo backend ao contrato original: array puro, `q` obrigatório. Não é tocado por esta feature — `searchTenants()`/`useTenantSearch` (feature 017) continuam consumindo exatamente como antes.

## `GET /api/v1/prompt-manager/tenant/{tenant_id}?node_type=...` (já existente, reaproveitado)

Sem mudança de contrato. Passa a ser chamado três vezes por consulta de tenant (uma por `node_type`: `operational`, `institutional`, `chitchat`) para popular os grupos de prompts/guardrails exibidos no card do tenant (US2).
