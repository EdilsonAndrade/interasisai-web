# Data Model: Busca de Tenant e Gestão da Base de Conhecimento

Tipos TypeScript a adicionar/alterar em `src/services/pythonBackend.types.ts` e `src/services/promptManager.types.ts`, seguindo o padrão union-type (`{ ok, status, ... }`) já estabelecido no projeto. Nenhum destes é persistido no frontend — todos refletem a resposta do backend descrita em [contracts/admin-api-contract.md](contracts/admin-api-contract.md).

## TenantSearchResult (novo, `pythonBackend.types.ts`)

Item retornado por `GET /tenants?q=`. Reaproveita o formato do tipo `Tenant` já existente (mesmos campos de `getTenantById`).

```ts
export type TenantSearchItem = Tenant; // id, name, google_calendar_id, allowed_domains, created_at, updated_at

export type TenantSearchSuccess = {
  ok: true;
  status: number;
  tenants: TenantSearchItem[]; // pode ser [] — resultado vazio é válido, não erro
};

export type TenantSearchFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
};

export type TenantSearchResult = TenantSearchSuccess | TenantSearchFailure;
```

**Validation rules**: `q` não pode ser vazio/apenas espaços antes do envio (Zod, `tenantSearchSchema` em `lib/tenantSchemas.ts`). `limit` fixo em 20 no cliente (não configurável pela UI nesta feature — o contrato aceita até 100, mas nenhuma US pede paginação).

**State transitions**: idle → loading → (success com `tenants: []` | success com `tenants: [...]` | failure). Selecionar um item da lista não muta este estado — dispara `useTenantContext`/`useKnowledgeBase` para o `tenant_id` escolhido.

## TenantPromptDetail (alterado, `promptManager.types.ts`)

```ts
export interface TenantPromptDetail {
  tenant_id: string;
  prompt_id: string;
  prompt_titulo: string;
  prompt_conteudo: string;
  custom_content_override: string | null;
  is_default_prompt: boolean; // NOVO — true quando não há vínculo customizado (fallback ao prompt padrão)
  guardrails_associados: Array<{
    id: string;
    titulo: string;
    conteudo: string;
    is_global: boolean;
  }>;
}
```

**Validation rules**: nenhuma no frontend — campo somente-leitura, consumido diretamente da resposta de `fetchTenantPromptDetail`.

**Relationships**: um `TenantPromptDetail` está associado a exatamente um `tenant_id`, retornado pela seleção feita em `TenantSearchResult`.

## KnowledgeBase (novo, `pythonBackend.types.ts`)

```ts
export type KnowledgeBase = {
  tenant_id: string;
  content: string | null; // null = nenhuma base cadastrada ainda (estado normal, não erro)
  updated_at: string | null;
};

export type KnowledgeBaseReadSuccess = {
  ok: true;
  status: number;
  data: KnowledgeBase;
};

export type KnowledgeBaseWriteSuccess = {
  ok: true;
  status: number;
  data: KnowledgeBase; // updated_at sempre presente após um PUT bem-sucedido
};

export type KnowledgeBaseDeleteSuccess = {
  ok: true;
  status: number;
  message: string;
};

export type KnowledgeBaseFailure = {
  ok: false;
  status: number;
  message: string;
  fieldErrors?: { content?: string }; // populado em 422 (content ausente/vazio)
  retryable: boolean;
};

export type KnowledgeBaseReadResult = KnowledgeBaseReadSuccess | KnowledgeBaseFailure;
export type KnowledgeBaseWriteResult = KnowledgeBaseWriteSuccess | KnowledgeBaseFailure;
export type KnowledgeBaseDeleteResult = KnowledgeBaseDeleteSuccess | KnowledgeBaseFailure;
```

**Validation rules**:
- Escrita (`content`): obrigatório após trim (regra do backend, 422 se vazio); limite de 100.000 caracteres imposto no frontend como salvaguarda de UI (não exigido pelo contrato, mas consistente com o limite já usado no fluxo de ingestão anterior).
- Leitura: `content: null` é um estado válido — não trata como erro nem como 404.
- Exclusão: só disponível na UI quando `content` não é `null` (espelha o `404` do backend para "nada a excluir").

**State transitions**: por tenant selecionado — idle → loading (GET) → (loaded com `content` preenchido | loaded com `content: null`). Salvar: idle → saving → (success, atualiza `content`/`updated_at` local | failure, preserva o texto editado). Excluir: idle → deleting → (success, `content` volta a `null` | failure, mantém `content` anterior).

**Concurrency rule (FR-023)**: cada hook (`useTenantContext`, `useKnowledgeBase`) deve descartar respostas cuja requisição não corresponda ao `tenant_id` selecionado no momento em que a resposta chega (guarda por closure/ref ou `AbortController` por seleção), evitando que uma resposta atrasada de um tenant anterior sobrescreva o estado do tenant atual.
