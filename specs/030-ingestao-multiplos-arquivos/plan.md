# Implementation Plan: Ingestão de Dados por Múltiplos Arquivos

**Branch**: `edilsonaandrade/edi-39-permitir-ingestao-de-dados-por-multiplos-arquivos` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/030-ingestao-multiplos-arquivos/spec.md` (Linear EDI-39)

**Escopo deste repositório (interasisai-web)**: este é o frontend Next.js do painel administrativo. A extração de arquivo, o banco de dados (`tenant_knowledge_base_items`) e a reindexação vetorial vivem no serviço Python backend consumido via `src/services/pythonBackend.ts` — implementação fora deste repositório. Este plano cobre a UI, os hooks e o client HTTP que consomem o contrato de API já definido em EDI-39 (ver [contracts/knowledge-base-items-api.md](./contracts/knowledge-base-items-api.md)).

## Summary

Estender a tela de "Ingestão Tenant" (hoje um único textarea via `KnowledgeBaseEditor.tsx`) para suportar upload de múltiplos arquivos (PDF/XLS/XLSX/CSV) e texto colado como itens individuais de uma grid, com toggle substituir/adicionar, confirmação obrigatória para toda ação destrutiva, detecção de nome duplicado, e gerenciamento por item (ver conteúdo completo, substituir arquivo, excluir). A tela de preview consolidado atual continua funcionando sem quebra de contrato.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19
**Primary Dependencies**: `sonner` (toasts), `lucide-react` (ícones), `framer-motion` (transições de modal), `react-hook-form` + `zod` (validação client-side), `clsx` + `tailwind-merge` (composição de estilo)
**Storage**: N/A neste repositório — persistência e vetorização ficam no serviço Python backend; este repo só consome os endpoints REST via `pythonBackend.ts`
**Testing**: Jest + React Testing Library, padrão AAA, mocks de `pythonBackend` para chamadas externas (mesmo padrão de `useKnowledgeBase.test.ts` e `KnowledgeBaseEditor.test.tsx`)
**Target Platform**: Web — painel administrativo (rota autenticada), desktop-first responsivo
**Project Type**: Web app single-project (Next.js) — sem diretório `backend/` neste repo; contrato de API tratado como fronteira externa
**Performance Goals**: Grid deve renderizar instantaneamente para o volume esperado (dezenas de itens por tenant); upload e reindexação não podem bloquear a UI (reindex roda em background no backend, conforme contrato)
**Constraints**: Validação client-side de tamanho (10MB) e extensão (.pdf/.xls/.xlsx/.csv) antes do upload; sem `any`; sem `dangerouslySetInnerHTML` (conteúdo extraído é texto não confiável); todas as ações destrutivas exigem confirmação
**Scale/Scope**: Uso interno por administradores; poucas dezenas de itens por tenant é o caso comum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Hooks & UI | PASS — lógica de fetch/upload/estado fica em `useKnowledgeBaseItems` (novo hook); componentes só consomem retorno do hook. |
| II. Context API | PASS — estado é local à tela de administração do tenant (não é estado global); `useState` local é apropriado para abrir/fechar modais e seleção de item. Nenhum novo Context necessário. |
| III. DRY / Componentização | PASS — as 4 confirmações (substituir tudo, adicionar, substituir item, excluir item) reutilizam um único `ConfirmActionDialog` genérico, seguindo o padrão já existente em `KnowledgeBaseDeleteDialog.tsx`. |
| IV. Testes | PASS — `renderHook` para `useKnowledgeBaseItems`; RTL com `getByRole`/`getByLabelText` para grid, modais e formulário de upload; mocks de `pythonBackend`. |
| V. TypeScript & erros | PASS — novos tipos em `pythonBackend.types.ts` (sem `any`); falhas de API viram `toast.error` + estado de erro no hook, mesmo padrão atual. |
| VI. Identidade visual | PASS — Tailwind + `framer-motion` para entrada/saída dos modais; glass/blur consistente com `KnowledgeBaseEditor.tsx`. |
| VII. SEO/Semântica/A11y | PASS — nenhuma rota nova é criada (feature vive dentro da página de admin do tenant já existente); grid usa tabela/lista semântica, modais usam `role="dialog"`, foco gerenciado. |
| VIII. Segurança | PASS — validação Zod client-side de extensão/tamanho antes do POST; conteúdo extraído renderizado como texto puro (`whitespace-pre-wrap`), nunca HTML. |

Nenhuma violação — Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/030-ingestao-multiplos-arquivos/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── knowledge-base-items-api.md
└── tasks.md              # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── components/admin/
│   ├── KnowledgeBaseEditor.tsx              # existente — passa a orquestrar preview + grid + upload
│   ├── KnowledgeBaseEditor.test.tsx         # existente — estender cobertura
│   ├── KnowledgeBaseDeleteDialog.tsx        # existente — apagar TUDO (endpoint já existente, sem mudança)
│   ├── knowledgeBaseItems/
│   │   ├── KnowledgeBaseItemsGrid.tsx       # NOVO — grid com preview de 1000 chars por item
│   │   ├── KnowledgeBaseItemsGrid.test.tsx
│   │   ├── KnowledgeBaseItemDetailModal.tsx # NOVO — modal com conteúdo completo + scroll
│   │   ├── KnowledgeBaseItemDetailModal.test.tsx
│   │   ├── KnowledgeBaseUploadForm.tsx      # NOVO — N arquivos + texto + toggle append/replace
│   │   ├── KnowledgeBaseUploadForm.test.tsx
│   │   ├── KnowledgeBaseDuplicateDialog.tsx # NOVO — resolve conflitos 409 por arquivo
│   │   ├── KnowledgeBaseDuplicateDialog.test.tsx
│   │   └── ConfirmActionDialog.tsx          # NOVO — modal de confirmação genérico reusado pelas 4 ações
│   │       ConfirmActionDialog.test.tsx
├── hooks/
│   ├── useKnowledgeBase.ts                  # existente — mantido para o preview consolidado (GET/DELETE geral)
│   ├── useKnowledgeBaseItems.ts             # NOVO — list/upload/replace-file/edit/delete de itens
│   └── useKnowledgeBaseItems.test.ts
└── services/
    ├── pythonBackend.ts                     # estender com os 6 novos endpoints de items
    └── pythonBackend.types.ts               # estender com KnowledgeBaseItem e tipos relacionados
```

**Structure Decision**: Projeto único Next.js (sem separação frontend/backend neste repositório). Testes colocados junto ao código (`*.test.ts(x)` ao lado do arquivo), seguindo a convenção já usada por `useKnowledgeBase.ts`/`useKnowledgeBase.test.ts` e `KnowledgeBaseEditor.tsx`/`KnowledgeBaseEditor.test.tsx` — não se usa o diretório `tests/` do template genérico. Novos componentes de item agrupados em `src/components/admin/knowledgeBaseItems/` para não sobrecarregar `src/components/admin/` com 6+ arquivos novos soltos.

## Complexity Tracking

*Não se aplica — nenhuma violação do Constitution Check.*
