# Contract: Backend Admin Endpoints (Tenant Search, Prompt/Guardrail Overview, Knowledge Base)

**Source**: Backend team's contract artifact, shared 2026-08-19 (their feature `001-admin-tenant-management`). Reproduced here for traceability with this frontend feature's spec/plan.

**Base URL**: `/api/v1`
**Format**: JSON
**Auth**: Contract specifies `Authorization: Bearer <admin JWT>` on every endpoint below. **Not implemented by this feature** — see Assumptions in [../spec.md](../spec.md). Today's `/admin` gate is the existing env-based session (`ADM_USER`/`ADM_PWD`, see `.env.example`); JWT issuance is deferred to a future admin-login feature.

## Summary

| Method | Path | Status | Purpose |
|---|---|---|---|
| GET | `/tenants?q=&limit=` | NEW | Search tenants by partial name or id |
| GET | `/tenants/{tenant_id}` | CHANGED | Now requires admin auth (response unchanged) |
| GET | `/prompt-manager/tenant/{tenant_id}` | CHANGED | No longer 404s without a custom link — falls back to default prompt |
| GET | `/tenants/{tenant_id}/knowledge-base` | NEW | View current knowledge base content |
| PUT | `/tenants/{tenant_id}/knowledge-base` | NEW | Upsert (create or replace) knowledge base content |
| DELETE | `/tenants/{tenant_id}/knowledge-base` | NEW | Remove knowledge base content |

## GET /tenants?q={term}&limit={n}

Partial, case-insensitive match on `id` or `name`. Never 404s for no match — an empty array is a valid response.

- `q`: string, required, min 1 char
- `limit`: int, optional, default 20, max 100

```json
[
  {
    "id": "1234",
    "name": "Barbearia Central",
    "google_calendar_id": "abc@group.calendar.google.com",
    "allowed_domains": ["barbeariacentral.com.br"],
    "created_at": "2026-01-10T12:00:00Z",
    "updated_at": null
  }
]
```

Errors: `401` (missing/invalid admin token), `422` (`q` missing/empty).

## GET /tenants/{tenant_id}

Unchanged response shape from the existing endpoint. Only change: now requires the admin token (previously open). Errors: `401`, `404` (tenant doesn't exist).

## GET /prompt-manager/tenant/{tenant_id}

**Behavior change**: previously 404'd when the tenant had no custom prompt link. Now always returns `200` — falls back to the default prompt + global guardrails when there's no custom link. New field `is_default_prompt` distinguishes the two cases.

```json
// custom link
{
  "tenant_id": "1234",
  "prompt_id": "b3f1...",
  "prompt_titulo": "Atendimento Barbearia",
  "prompt_conteudo": "...",
  "custom_content_override": null,
  "is_default_prompt": false,
  "guardrails_associados": [
    { "id": "g1", "titulo": "Confirmação de agenda", "conteudo": "...", "is_global": false }
  ]
}

// fallback (no link)
{
  "tenant_id": "5678",
  "prompt_id": "d9a2...",
  "prompt_titulo": "Prompt Padrão",
  "prompt_conteudo": "...",
  "custom_content_override": null,
  "is_default_prompt": true,
  "guardrails_associados": [
    { "id": "gG1", "titulo": "Guardrail Global 1", "conteudo": "...", "is_global": true }
  ]
}
```

Errors: `401`, `404` (tenant doesn't exist), `500` (no default prompt configured — config failure, not a normal path).

## GET /tenants/{tenant_id}/knowledge-base

```json
// with content
{ "tenant_id": "1234", "content": "Regra: o barbeiro Lucas atende...", "updated_at": "2026-08-19T10:00:00Z" }

// empty (normal state — not an error)
{ "tenant_id": "1234", "content": null, "updated_at": null }
```

Errors: `401`, `404` (tenant doesn't exist).

## PUT /tenants/{tenant_id}/knowledge-base

Single upsert endpoint — creates when absent, replaces when present. Same endpoint for both "add" and "edit".

Request: `{ "content": "..." }` — `content` string, required, min 1 char (empty/whitespace-only rejected).

Response `200`: `{ "tenant_id": "1234", "content": "...", "updated_at": "2026-08-19T10:05:00Z" }`

The response returns as soon as the text is saved — it does not wait for background revectorization to finish (up to ~5 min worst case). A `GET` immediately after already shows the new text; the underlying AI behavior catches up asynchronously.

Errors: `401`, `404` (tenant doesn't exist), `422` (`content` missing/empty).

## DELETE /tenants/{tenant_id}/knowledge-base

Destructive-action confirmation ("are you sure?") is the frontend's responsibility — the endpoint executes immediately with no intermediate step.

Response `200`: `{ "tenant_id": "1234", "message": "Base de conhecimento removida com sucesso." }`

Errors: `401`, `404` (tenant doesn't exist, **or** no knowledge base exists to delete).

## Out of scope (per contract)

Tenant create/edit/delete (`POST`/`PUT`/`DELETE /tenants/{id}`) and the entire `/prompt-manager/*` CRUD (prompts, guardrails, tenant-prompt linking) are untouched by this contract — they remain exactly as they are today, unauthenticated, unchanged response shape.
