# Phase 1 — Data Model: Vínculo obrigatório de prompt no tenant

**Feature**: `specs/020-tenant-prompt-binding/` | **Date**: 2026-08-22

Modelo de dados **do frontend** — tipos TypeScript que atravessam serviço, hook e componente. O armazenamento é do backend; aqui interessa a forma dos dados em trânsito e as regras de validação aplicadas antes de cada chamada.

---

## 1. Tipos novos

### `ApiError` — envelope normalizado (`src/lib/apiError.ts`)

```ts
export type ApiErrorCode =
  | "PROMPT_NOT_FOUND"
  | "PROMPT_NODE_TYPE_INVALID"
  | "PROMPT_IN_USE_BY_TENANTS"
  | "GUARDRAIL_IS_GLOBAL"
  | "GUARDRAIL_IN_USE_BY_TENANTS"
  | "TENANT_NOT_FOUND";

export type Blocker = {
  type: "tenant" | "prompt";
  id: string;
  name?: string;         // ausente em alguns TENANT_NOT_FOUND
  tenant_count?: number; // só em bloqueadores do tipo prompt
};

export type ApiError = {
  status: number;
  code?: ApiErrorCode;                    // undefined nos formatos lista e string
  message: string;                        // sempre presente (fallback por status)
  blockers: Blocker[];                    // sempre array, possivelmente vazio
  fieldErrors?: Record<string, string>;   // só no 422
  retryable: boolean;
};
```

**Invariantes**:
- `message` nunca é vazio — há fallback por status quando o payload não traz texto.
- `blockers` nunca é `undefined` — ausente no payload vira `[]`, para o consumidor não precisar checar.
- `code` desconhecido (não previsto na union) é tratado como `undefined`: cai no comportamento genérico em vez de quebrar.
- Decisão de fluxo **sempre** por `code`, nunca por `message` (FR-032).

### `PromptTenantsResponse` (`promptManager.types.ts`)

```ts
export type PromptTenant = { id: string; name: string };

export type PromptTenantsResponse = {
  prompt_id: string;
  node_type: NodeType;
  tenants: PromptTenant[];
};
```

`PromptTenant` é estruturalmente compatível com `Blocker` do tipo tenant — reuso deliberado (FR-038).

### `BulkTenantLinkInput` / `BulkTenantLinkResponse`

```ts
export type BulkTenantLinkInput = {
  prompt_id: string;
  tenant_ids: string[];              // min 1
  custom_content_override?: string;
};

export type BulkTenantLinkResponse = {
  prompt_id: string;
  node_type: NodeType;
  linked_count: number;
  tenant_ids: string[];
};
```

### `BulkLinkDiff` — derivado no cliente (`useBulkTenantLink`)

```ts
export type BulkLinkDiff = {
  unchanged: PromptTenant[];  // selecionados que já usam o prompt
  changing: PromptTenant[];   // selecionados que terão o vínculo substituído
};
```

Não vem da API. É a diferença de conjuntos entre a seleção e o retorno de `GET /prompts/{id}/tenants` (R-005).

---

## 2. Tipos alterados

### `TenantCreateInput` (`pythonBackend.types.ts`)

```ts
export type TenantCreateInput = TenantWriteInput & {
  tenant_id: string;
  prompt_id: string;   // NOVO — obrigatório, nó operacional
};
```

`TenantWriteInput` (usado na edição) **não** muda — a edição não mexe em prompt (FR-011).

### `TenantCreateIntent` — entrada do fluxo composto (`useTenantManagement`)

```ts
export type TenantCreateIntent =
  | { mode: "existing"; prompt_id: string }
  | { mode: "new"; prompt: PromptCreateInput };
```

Discriminated union: o hook decide se cria o prompt antes (R-003). O componente não sabe quantas chamadas acontecem.

---

## 3. Estados derivados

### Estado de vínculo do tenant

Um único predicado (`src/lib/promptBinding.ts`, R-002):

| Condição | Estado | Apresentação |
|---|---|---|
| `node_type === "operational"` e `is_default_prompt === true` | **missing** | Alerta vermelho + CTA "Vincular prompt"; conteúdo do prompt **suprimido** (FR-015); guardrails exibidos (FR-016) |
| Qualquer outro caso no nó operacional | **linked** | Título do prompt, sem alerta |

Nós institucional e chitchat estão fora do escopo — o helper retorna `false` para eles por guarda explícita, não por omissão.

### Origem das proteções na visão do tenant

`guardrails_associados` já chega com `is_global`. A partição é local:

| `is_global` | Seção | Comportamento |
|---|---|---|
| `true` | "Proteções globais" | Nota de que são somadas automaticamente e não removíveis dali (FR-021) |
| `false` | "Proteções do prompt" | Vinculadas ao prompt |

---

## 4. Regras de validação (Zod, antes de qualquer chamada)

### `tenantCreateSchema` (alterado, `src/lib/tenantSchemas.ts`)

| Campo | Regra | Mensagem |
|---|---|---|
| `prompt_id` | `.trim().min(1)` | "Selecione o prompt que este tenant vai usar. Sem prompt vinculado, o atendimento não funciona." |

Os demais campos permanecem inalterados. A mensagem explica a razão, não só a falta (FR-002).

### `bulkTenantLinkSchema` (novo, `src/lib/promptManagerSchemas.ts`)

| Campo | Regra | Mensagem |
|---|---|---|
| `prompt_id` | `.min(1)` | "Prompt é obrigatório" |
| `tenant_ids` | `.array(...).min(1)` | "Selecione ao menos um tenant." |
| `custom_content_override` | opcional | — |

### `promptFormSchema` (inalterado)

O marcador `{guardrails}` **não** entra como regra Zod — é aviso não bloqueante (R-004), verificado por `hasGuardrailsPlaceholder` e exibido pela UI.

---

## 5. Transições de estado

### Cadastro de tenant

```
[form vazio]
   └─ prompt não escolhido ──> submit bloqueado (Zod) ──> [form vazio + erro]
   └─ prompt existente ──────> POST /tenants ──> ok ──> [tenant criado + vinculado]
   │                                        └─ erro ──> [form preenchido + erro]
   └─ prompt novo ───────────> POST /prompts ──> ok ──> POST /tenants
                                            │                ├─ ok ──> [tenant criado + prompt novo na biblioteca]
                                            │                └─ erro ─> [form preenchido + erro + prompt PERMANECE
                                            │                            disponível para nova tentativa]  (FR-010)
                                            └─ erro ──> [form preenchido + erro; nada criado]
```

Na retentativa após falha do passo 2, o formulário passa a operar em modo `existing` com o prompt já criado — evita gerar um segundo órfão a cada tentativa.

### Correção in-place do vínculo

```
[tenant missing] ──> abre ação ──> escolhe prompt ──> POST /link-tenant
                                                        ├─ ok ───> re-busca overview ──> [tenant linked]
                                                        └─ erro ─> [tenant missing + mensagem]
```

O estado pós-sucesso vem de nova leitura do servidor, nunca de suposição local (FR-018).

### Associação em massa

```
[prompt selecionado] ──> GET /prompts/{id}/tenants ──> [lista de já vinculados]
   └─ busca + seleção ──> [diff calculado: unchanged / changing]
        └─ confirma ──> POST /link-tenants
                          ├─ 200 ─────────────> [sucesso: linked_count]
                          ├─ 404 TENANT_NOT_FOUND ──> [erro + blockers; NADA aplicado]
                          └─ 404 PROMPT_NOT_FOUND ──> [erro; recarregar lista de prompts]
```

---

## 6. Mapa de códigos de erro → comportamento de UI

| `code` | HTTP | Onde | Comportamento |
|---|---|---|---|
| `PROMPT_NOT_FOUND` | 404 | criação de tenant, massa | Mensagem + recarregar lista de prompts (o prompt sumiu entre a abertura e o envio) |
| `PROMPT_NODE_TYPE_INVALID` | 400 | criação de tenant | Erro no campo de prompt: tipo de nó incompatível |
| `PROMPT_IN_USE_BY_TENANTS` | 409 | excluir prompt | `BlockerList` de tenants, cada um com caminho para o vínculo (FR-035) |
| `GUARDRAIL_IS_GLOBAL` | 409 | excluir guardrail | Ação combinada "Desmarcar global e excluir" (FR-036). Tem precedência sobre o código abaixo |
| `GUARDRAIL_IN_USE_BY_TENANTS` | 409 | excluir guardrail | `BlockerList` de prompts com `tenant_count` (FR-037) |
| `TENANT_NOT_FOUND` | 404 | massa | `BlockerList` + aviso explícito de que nenhum vínculo foi aplicado (FR-030) |
| *(indefinido)* | qualquer | qualquer | `message` normalizada em toast/estado de erro; nunca tela quebrada (FR-033) |

---

## 7. Entidades e relações

```
Tenant ──1:N── VínculoTenantPrompt ──N:1── Prompt ──N:N── Guardrail
                     │                                        │
                 (por node_type;                        is_global = TRUE
                  operational é o                       aplica-se a todos,
                  único obrigatório)                    sem associação
```

- **Prompt → Tenant** é N:N via vínculo; um prompt serve muitos tenants (base da associação em massa).
- **Guardrail global** não participa de associação — entra por regra, não por vínculo. Por isso aparece em seção própria e não é removível pela tela do tenant.
- **`is_default`** no prompt passa a ser rótulo informativo. Não é mecanismo de resolução e não pré-seleciona nada (FR-004/FR-005).
