# Data Model: Exclusão com confirmação de impacto, edição e atalho WhatsApp

Nenhuma entidade nova é persistida no frontend (sem storage local além do estado de UI). As estruturas abaixo são tipos TypeScript consumidos das respostas da API.

## TenantDeleteImpact (novo — `pythonBackend.types.ts`)

Resposta de `GET /tenants/{id}/delete-impact` (contrato definido no EDI-45).

```ts
export type TenantDeleteImpactPromptItem = {
  id: string;
  titulo: string;
  node_type?: NodeType; // presente apenas em prompts_to_delete
};

export type TenantDeleteImpactGuardrailItem = {
  id: string;
  titulo: string;
  is_global?: boolean; // presente apenas em guardrails_to_unlink_only
};

export type TenantDeleteImpact = {
  tenant_id: string;
  prompts_to_delete: TenantDeleteImpactPromptItem[];
  prompts_to_unlink_only: TenantDeleteImpactPromptItem[];
  guardrails_to_delete: TenantDeleteImpactGuardrailItem[];
  guardrails_to_unlink_only: TenantDeleteImpactGuardrailItem[];
};

export type TenantDeleteImpactResult =
  | { ok: true; status: number; data: TenantDeleteImpact }
  | TenantOperationFailure; // reaproveita o tipo de falha já existente
```

**Regras de validação**:
- Todo array é sempre uma lista (vazia é um resultado válido, não erro) — mesma convenção de `TenantSearchSuccess.tenants`.
- `is_global` só é relevante em `guardrails_to_unlink_only`: um guardrail em `guardrails_to_delete` é por definição exclusivo (nunca global — global nunca é excluído de fato, apenas desvinculado).
- `node_type` em `prompts_to_delete` é informativo (para agrupar visualmente), não usado em lógica de decisão no frontend — a decisão excluir/desvincular já vem pronta do backend.

## TenantPromptDetail por node_type (reaproveitado, sem mudança de forma)

Já existe (`promptManager.types.ts::TenantPromptDetail`). Usado três vezes (uma por `node_type`) pelo novo hook `useTenantNodePrompts`, mantendo a mesma forma:

```ts
export interface TenantPromptDetail {
  tenant_id: string;
  node_type: NodeType;
  prompt_id: string;
  is_active: boolean;
  custom_content_override: string | null;
  prompt_titulo: string;
  prompt_conteudo: string;
  is_default_prompt: boolean;
  guardrails_associados: Guardrail[];
}
```

**Estado por node_type** (mesmo vocabulário de `useTenantPromptBinding`): `idle | loading | linked | missing | error`. Para `institutional`/`chitchat`, o estado `missing` é exibido como informação neutra ("nenhum prompt vinculado"), sem o alerta de erro nem o CTA de correção que o `operational` mantém (esse fluxo é exclusivo do vínculo obrigatório do EDI-44).

## Estado local do fluxo de exclusão (não persistido, vive nos hooks/componentes)

```ts
type TenantDeleteImpactState = "idle" | "loading" | "loaded" | "error";

type TenantDeleteDialogLocalState = {
  confirmText: string; // o que o admin digitou
};
```

**Regra de habilitação do botão Confirmar**: `confirmText.trim() === tenant.name` (comparação exata, sensível a maiúsculas/minúsculas — ver `research.md` item 6) **e** `impactState === "loaded"`.

## TenantGridItem (novo — `pythonBackend.types.ts`, US4)

Item de resposta de `GET /tenants/list` (endpoint novo e separado de `GET /tenants`, ver `research.md` item 10).

```ts
export type TenantGridPromptTag = { id: string; titulo: string; node_type: NodeType };
export type TenantGridGuardrailTag = { id: string; titulo: string; is_global: boolean };

export type TenantGridItem = {
  id: string;
  name: string;
  google_calendar_id: string;
  allowed_domains: string[];
  created_at: string;
  updated_at: string | null;
  prompts: TenantGridPromptTag[];
  guardrails: TenantGridGuardrailTag[];
};

export type TenantListResult =
  | { ok: true; status: number; items: TenantGridItem[]; total: number }
  | { ok: false; status: number; message: string; retryable: boolean };
```

**Nota de uso**: `prompts`/`guardrails` existem na resposta mas **não são renderizados no grid** — por decisão explícita do usuário, o grid mostra só `id` e `name`; o detalhe completo (incluindo esses vínculos, via `useTenantNodePrompts`) só é buscado ao clicar na linha, reaproveitando o mesmo caminho da busca manual por ID.

**Estado de paginação** (não persistido, vive em `useTenantGrid`): `offset`, `limit` (fixo em 20), `total` — `hasPrevious = offset > 0`, `hasNext = offset + limit < total`.

## Sem mudança de forma

- `Tenant` (`pythonBackend.types.ts`) — inalterado.
- `DELETE /tenants/{id}` — resposta de sucesso continua consumida apenas como `{ ok: true, status }`, sem novos campos exigidos pelo frontend (a mensagem de sucesso já é fixa na UI, ver `useTenantManagement.remove()`).
- `GET /tenants` (busca por `q`, usada pela Base de Conhecimento) — inalterado, contrato revertido pelo backend ao formato original (array puro, `q` obrigatório).
