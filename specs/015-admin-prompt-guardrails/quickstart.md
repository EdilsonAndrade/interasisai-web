# Quickstart: Administração de Prompts e Guardrails

**Feature**: 015-admin-prompt-guardrails
**Date**: 2026-08-10

## Pré-requisitos

- Node.js 20+
- Backend Python/FastAPI rodando em `http://localhost:8000` (ou URL configurada em `NEXT_PUBLIC_PYTHON_BACKEND_URL`)
- Sessão admin ativa (login via `/admin`)

## Setup Rápido

### 1. Instalar novas dependências

```bash
npm install sonner rehype-sanitize
```

- `sonner`: Toast notifications (FR-032, FR-033)
- `rehype-sanitize`: Sanitização XSS no preview Markdown (FR-025, Constitution VIII)

### 2. Criar estrutura de diretórios

```bash
mkdir -p src/app/\[locale\]/admin/prompt-manager
mkdir -p src/components/admin/prompt-manager
mkdir -p src/hooks
```

### 3. Arquivos a criar/modificar (ordem sugerida)

| # | File | Type | Purpose |
|---|------|------|---------|
| 1 | `src/services/promptManager.types.ts` | New | TypeScript interfaces para API |
| 2 | `src/lib/promptManagerSchemas.ts` | New | Zod schemas + inferred types |
| 3 | `src/services/promptManager.ts` | New | API service layer (fetch wrapper) |
| 4 | `src/hooks/useGuardrails.ts` | New | Hook: CRUD + state guardrails |
| 5 | `src/hooks/usePrompts.ts` | New | Hook: CRUD + state prompts |
| 6 | `src/hooks/useTenantLink.ts` | New | Hook: tenant-prompt link |
| 7 | `src/components/admin/prompt-manager/Tabs.tsx` | New | Reusable tabs component |
| 8 | `src/components/admin/prompt-manager/MarkdownEditorCustom.tsx` | New | Markdown editor (3 modes) |
| 9 | `src/components/admin/prompt-manager/GuardrailList.tsx` | New | Guardrail list component |
| 10 | `src/components/admin/prompt-manager/GuardrailFormModal.tsx` | New | Guardrail create/edit modal |
| 11 | `src/components/admin/prompt-manager/PromptList.tsx` | New | Prompt list component |
| 12 | `src/components/admin/prompt-manager/PromptFormModal.tsx` | New | Prompt create/edit modal |
| 13 | `src/components/admin/prompt-manager/TenantLinkSection.tsx` | New | Tenant-prompt link form |
| 14 | `src/components/admin/prompt-manager/PromptManagerPage.tsx` | New | Main orchestrator (tabs + state) |
| 15 | `src/components/admin/prompt-manager/types.ts` | New | Component-level types |
| 16 | `src/app/[locale]/admin/prompt-manager/page.tsx` | New | Server component (route) |
| 17 | `src/components/admin/AdminNavigation.tsx` | Modify | Add nav item |

### 4. Verificar integração

1. Acesse `/admin` e faça login
2. Clique em "Prompts & Guardrails" na navegação
3. A aba "Guardrails" deve carregar listagem (vazia no primeiro acesso)
4. Crie um guardrail → toast "Guardrail criado com sucesso"
5. Acesse aba "Prompts Base" → crie prompt selecionando guardrails
6. Acesse aba "Vincular Tenant" → associe tenant a prompt

### 5. Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| 404 nas chamadas de API | Backend não está rodando ou rota incorreta | Verifique `NEXT_PUBLIC_PYTHON_BACKEND_URL` no `.env.local` |
| Erro ao criar guardrail/prompt | Backend pode não ter os endpoints | Verifique logs do backend; frontend exibirá toast com erro |
| Toast não aparece | `sonner` não instalado ou `<Toaster />` não adicionado | Instale `sonner` e adicione `<Toaster richColors />` no `PromptManagerPage` |
| Preview Markdown quebrado | `rehype-sanitize` não instalado | `npm install rehype-sanitize` |
| Erro de tipo Zod | Zod v4 API diferente da v3 | Use `.min(1)` em vez de `.nonempty()`; veja `promptManagerSchemas.ts` |

## Convenções do Projeto

- **Idioma da UI**: Português (Brasil)
- **Design Tokens**: `text-text-strong`, `bg-surface-base`, `border-brand-primary`, `rounded-card` — definidos em `src/theme/`
- **Ícones**: `lucide-react` (importar de `lucide-react`)
- **Estado de loading**: Componentes devem exibir skeleton ou spinner durante fetch
- **Erro de rede**: Toast com "Não foi possível conectar ao servidor. Verifique sua conexão."
- **Formulários**: `react-hook-form` + `zodResolver` + design tokens nos inputs
- **Submissão**: Botão desabilitado com `isSubmitting` do react-hook-form, texto "Salvando..."

## Notas para o Desenvolvedor

- O diretório `src/hooks/` é novo — crie-o se não existir
- O componente `AdminDialog` existente (`src/components/admin/AdminDialog.tsx`) deve ser reutilizado para modais
- `AdminNavigation` deve ser modificado para adicionar apenas 1 item (não reescrever o componente inteiro)
- Todos os componentes são `"use client"` exceto `page.tsx` (server component)
- `page.tsx` deve exportar `metadata` para SEO (Constitution VII)
- Nenhum `any` é permitido (Constitution V)
- Nenhum `dangerouslySetInnerHTML` (Constitution VIII) — usar `react-markdown`
