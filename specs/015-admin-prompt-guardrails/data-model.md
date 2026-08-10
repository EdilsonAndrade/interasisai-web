# Data Model: Administração de Prompts e Guardrails

**Feature**: 015-admin-prompt-guardrails
**Date**: 2026-08-10

## Entities

### Guardrail

Regra de segurança ou comportamento que restringe/orienta as respostas da IA.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | Identificador único, gerado pelo backend |
| `titulo` | `string` | ✅ | Nome descritivo do guardrail (ex: "Proibido falar sobre política") |
| `conteudo` | `string` (Markdown) | ✅ | Corpo da regra em formato Markdown |
| `is_global` | `boolean` | ✅ | Se `true`, aplica-se a todos os prompts; se `false`, escopo específico |

**Validation Rules**:
- `titulo`: obrigatório, não vazio após trim, sem limite de tamanho imposto pelo frontend
- `conteudo`: obrigatório, não vazio após trim, Markdown válido (qualquer string é válida como Markdown)
- `is_global`: obrigatório, booleano, default `false`

**Relationships**:
- Pertence a N Prompts (relação N:N via `guardrail_ids` no Prompt)

---

### Prompt

Modelo/template de prompt do sistema que define o comportamento base da IA.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | Identificador único, gerado pelo backend |
| `titulo` | `string` | ✅ | Nome descritivo do prompt (ex: "Atendimento Inicial") |
| `conteudo` | `string` (Markdown) | ✅ | Template do prompt em formato Markdown |
| `is_default` | `boolean` | ✅ | Se `true`, é o prompt padrão do sistema |
| `guardrail_ids` | `string[]` | ❌ | Array de IDs de guardrails vinculados (pode ser vazio) |

**Validation Rules**:
- `titulo`: obrigatório, não vazio após trim
- `conteudo`: obrigatório, não vazio após trim, Markdown válido
- `is_default`: obrigatório, booleano, default `false`
- `guardrail_ids`: opcional, array de strings (UUIDs válidos), pode ser vazio (nenhum guardrail vinculado)

**Relationships**:
- Possui N Guardrails (relação N:N via `guardrail_ids`)
- Associado a N Tenants (via `link-tenant`)

---

### Vínculo Tenant-Prompt (TenantLink)

Associação entre um tenant/organização e um prompt, com override de conteúdo opcional.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenant_id` | `string` | ✅ | Identificador do tenant |
| `prompt_id` | `string` | ✅ | Identificador do prompt a ser vinculado |
| `custom_content_override` | `string` (Markdown) \| `undefined` | ❌ | Conteúdo customizado que sobrescreve o `conteudo` do prompt para este tenant específico |

**Validation Rules**:
- `tenant_id`: obrigatório, não vazio após trim
- `prompt_id`: obrigatório, não vazio (deve ser um ID existente de prompt)
- `custom_content_override`: opcional, se fornecido deve ser string não vazia

---

## State Transitions (Frontend)

### Guardrail / Prompt List State

```
┌──────────┐    fetch()    ┌──────────┐
│  idle    │ ────────────→ │ loading  │
└──────────┘               └────┬─────┘
                                │
                    ┌───────────┼───────────┐
                    ↓           ↓           ↓
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ success  │ │  error   │ │  empty   │
              │ (data[]) │ │ (message)│ │ (data[]) │
              └──────────┘ └──────────┘ └──────────┘
```

### Form Modal State

```
┌──────────┐   open/create   ┌──────────────┐
│  closed  │ ──────────────→ │   editing    │
└──────────┘                 │ (create mode) │
       ↑                     └──────┬───────┘
       │                            │ submit
       │                     ┌──────↓───────┐
       │                     │ submitting   │
       │                     └──────┬───────┘
       │                            │
       │              ┌─────────────┼──────────────┐
       │              ↓             ↓              ↓
       │        ┌──────────┐ ┌──────────┐  ┌──────────────┐
       └────────│ success  │ │  error   │  │ fieldErrors  │
                │ (toast)  │ │ (toast)  │  │ (form stays) │
                └──────────┘ └──────────┘  └──────────────┘
```

### Delete Confirmation State

```
┌──────────┐   click delete   ┌──────────────┐
│  idle    │ ───────────────→ │  confirming  │
└──────────┘                  │  (dialog)    │
       ↑                      └──────┬───────┘
       │                             │
       │                   ┌─────────┼──────────┐
       │                   ↓         ↓          ↓
       │             ┌────────┐ ┌────────┐ ┌──────────┐
       │             │cancel  │ │confirm │ │  error   │
       │             └────────┘ └───┬────┘ │ (dialog  │
       │                           │      │  stays)  │
       │                     ┌─────↓────┐ └──────────┘
       │                     │ deleting │
       │                     └─────┬────┘
       │                           │
       │              ┌────────────┼───────────┐
       │              ↓            ↓           │
       │        ┌──────────┐ ┌──────────┐     │
       └────────│ success  │ │  error   │←────┘
                │ (toast)  │ │ (toast)  │
                └──────────┘ └──────────┘
```

## TypeScript Interfaces

```ts
// ── API Response Types (src/services/promptManager.types.ts) ──

export interface Guardrail {
  id: string;
  titulo: string;
  conteudo: string;
  is_global: boolean;
}

export interface Prompt {
  id: string;
  titulo: string;
  conteudo: string;
  is_default: boolean;
  guardrail_ids: string[];
  guardrails?: Guardrail[]; // populated on GET /prompts (resolved relations)
}

// ── API Request Types ──

export interface GuardrailCreateInput {
  titulo: string;
  conteudo: string;
  is_global: boolean;
}

export interface GuardrailUpdateInput extends GuardrailCreateInput {}

export interface PromptCreateInput {
  titulo: string;
  conteudo: string;
  is_default: boolean;
  guardrail_ids: string[];
}

export interface PromptUpdateInput extends PromptCreateInput {}

export interface TenantLinkInput {
  tenant_id: string;
  prompt_id: string;
  custom_content_override?: string;
}

// ── Union Types for API results ──

export type PromptManagerResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string>; retryable: boolean };

export type GuardrailListResult = PromptManagerResult<Guardrail[]>;
export type GuardrailSingleResult = PromptManagerResult<Guardrail>;
export type PromptListResult = PromptManagerResult<Prompt[]>;
export type PromptSingleResult = PromptManagerResult<Prompt>;
export type TenantLinkResult = PromptManagerResult<null>;
export type DeleteResult = PromptManagerResult<null>;
```

## Zod Schemas

```ts
// ── src/lib/promptManagerSchemas.ts ──

import { z } from "zod";

export const guardrailFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório"),
  is_global: z.boolean(),
});

export const promptFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório"),
  is_default: z.boolean(),
  guardrail_ids: z.array(z.string()),
});

export const tenantLinkSchema = z.object({
  tenant_id: z.string().min(1, "ID do tenant é obrigatório"),
  prompt_id: z.string().min(1, "Prompt é obrigatório"),
  custom_content_override: z.string().optional(),
});

// Inferred types
export type GuardrailFormData = z.infer<typeof guardrailFormSchema>;
export type PromptFormData = z.infer<typeof promptFormSchema>;
export type TenantLinkFormData = z.infer<typeof tenantLinkSchema>;
```
