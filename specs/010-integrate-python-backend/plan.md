# Implementation Plan: Integração com Backend Python de Agendamento IA

**Branch**: `Edilson-30-Dev` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-integrate-python-backend/spec.md`

## Summary

Substituir o backend do chat (atual BFF NestJS em `localhost:3001`) pelo novo backend Python de Agendamento IA (`POST /api/v1/chat` com `X-Tenant-ID` e `thread_id`), preservando 100% da UI existente do widget. Adicionar nova página `/admin` para ingestão de regras de negócio no banco vetorial RAG. Desabilitar áudio temporariamente (código mantido comentado). Sem autenticação no painel admin na v1.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2.4, Next.js 16.2.4 (App Router)  
**Primary Dependencies**: framer-motion 12.38.0, lucide-react 1.8.0, tailwind-merge 3.5.0, clsx 2.1.1  
**Storage**: localStorage (client-side, `chat_thread_id` key), variáveis de ambiente (`.env` — `NEXT_PUBLIC_PYTHON_BACKEND_URL`, `NEXT_PUBLIC_TENANT_ID`)  
**Testing**: Jest 30.0.5 + React Testing Library 16.3.0 + jest-environment-jsdom  
**Target Platform**: Web browser (desktop ≥768px, mobile <768px)  
**Project Type**: Web application (Next.js App Router, client components)  
**Performance Goals**: Resposta do chat visível em <10s (incluindo latência de rede), animações 60fps, FCP protegido via `next/dynamic`  
**Constraints**: Sem áudio na v1 (código comentado), tenant ID fixo por deploy (env var), painel admin sem auth na v1, sem `dangerouslySetInnerHTML` (constitutional), localStorage pode estar indisponível (fallback em memória)  
**Scale/Scope**: Single tenant por deploy, admin interno, ~5 componentes refatorados, 1 nova página, ~3 novos tipos TypeScript

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Hook/UI Separation | ✅ PASS | `useChatAssistant` mantém lógica; admin terá hook próprio (`useAdminIngest`); componentes seguem "dumb" |
| II. Context API | ✅ PASS | `ChatContext` existente reutilizado sem alterações estruturais; admin usa estado local (sem necessidade de Context por ser página única) |
| III. DRY & Componentização | ✅ PASS | Admin reutiliza tokens de design existentes (glassmorphism, `GlowButton` pattern); `ChatWidget` visual inalterado |
| IV. Testes Unitários | ✅ PASS | Novos hooks terão testes isolados (`renderHook`); testes existentes do chatGateway atualizados; AAA pattern mantido |
| V. TypeScript & Erros | ✅ PASS | Novos tipos em `chatGateway.types.ts` (zero `any`); erros do backend Python mapeados e exibidos ao usuário |
| VI. Identidade Visual | ✅ PASS | Admin segue tema Tech/Glow com glassmorphism; Tailwind exclusivo; framer-motion para entradas |
| VII. SEO & Acessibilidade | ✅ PASS | Admin `page.tsx` exporta Metadata; semantic HTML (`<main>`, `<form>`, `<section>`); `alt` em imagens |
| VIII. Segurança | ✅ PASS | Sem `dangerouslySetInnerHTML`; conteúdo da IA tratado como plain text (sanitização existente); `NEXT_PUBLIC_TENANT_ID` é config, não secret |

**Gate Result (Pre-Design)**: ALL PASS — Nenhuma violação.

### Post-Design Re-evaluation (Phase 1 Complete)

| Principle | Status | Post-Design Verification |
|-----------|--------|--------------------------|
| I. Hook/UI Separation | ✅ PASS | `useChatAssistant` refatorado mantém separação; `useAdminIngest` é hook puro; `IngestForm` é dumb component que consome hook |
| II. Context API | ✅ PASS | `ChatContext` reutilizado sem alterações; admin usa `useState` local (correto: estado não compartilhado globalmente) |
| III. DRY & Componentização | ✅ PASS | Admin reusa tokens e padrões glassmorphism; sem duplicação de lógica de fetch (centralizado em `pythonBackend.ts`) |
| IV. Testes Unitários | ✅ PASS | Cobertura planejada para `pythonBackend.test.ts`, `sessionManager.test.ts`, `useAdminIngest.test.ts`, `useChatAssistant.test.ts` atualizado |
| V. TypeScript & Erros | ✅ PASS | `pythonBackend.types.ts` com todos os tipos explícitos; erros HTTP mapeados com mensagens amigáveis; zero `any` |
| VI. Identidade Visual | ✅ PASS | Admin page com glassmorphism (`backdrop-blur`), Tailwind-only, framer-motion para entrada |
| VII. SEO & Acessibilidade | ✅ PASS | Admin `page.tsx` exporta Metadata; semantic HTML (`<main>`, `<form>`, `<label>`) |
| VIII. Segurança | ✅ PASS | Sem `dangerouslySetInnerHTML`; `NEXT_PUBLIC_TENANT_ID` é config (não secret); sem exposição de secrets |

**Gate Result (Post-Design)**: ALL PASS — Design consistente com a constituição.

## Project Structure

### Documentation (this feature)

```text
specs/010-integrate-python-backend/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── admin/
│   │   └── page.tsx              # NOVA: Painel admin /admin
│   ├── globals.css               # Sem alterações
│   ├── layout.tsx                # Sem alterações (ChatWidget já integrado)
│   └── page.tsx                  # Sem alterações
├── components/
│   ├── chat/
│   │   ├── ChatWidget.tsx        # ALTERADO: comentar botão de microfone
│   │   ├── ChatInput.tsx         # ALTERADO: remover/desabilitar microfone da UI
│   │   ├── ChatMessages.tsx      # Sem alterações (renderização preservada)
│   │   └── ChatStatus.tsx        # Sem alterações
│   ├── admin/
│   │   └── IngestForm.tsx        # NOVO: formulário de ingestão
│   └── ui/                       # Sem alterações (reuso de GlassCard etc.)
├── hooks/
│   ├── useChatAssistant.ts       # ALTERADO: novo contrato Python, desabilitar áudio
│   ├── useChatAssistant.test.ts  # ALTERADO: atualizar para novo contrato
│   ├── useAdminIngest.ts         # NOVO: hook de ingestão
│   └── useAdminIngest.test.ts    # NOVO: testes do hook de ingestão
├── services/
│   ├── pythonBackend.ts          # NOVO: cliente HTTP para backend Python
│   ├── pythonBackend.types.ts    # NOVO: tipos do contrato Python
│   ├── pythonBackend.test.ts     # NOVO: testes do cliente Python
│   ├── chatGateway.ts            # ALTERADO: delegar para pythonBackend ou manter compat
│   ├── chatGateway.types.ts      # ALTERADO: adicionar tipos Python
│   ├── chatGateway.test.ts       # ALTERADO: atualizar testes
│   ├── sessionManager.ts         # NOVO: gerenciamento de thread_id (localStorage)
│   ├── sessionManager.test.ts    # NOVO: testes do sessionManager
│   ├── audioOptimization.ts      # Sem alterações (código preservado)
│   ├── audioFromBase64.ts        # Sem alterações (código preservado)
│   ├── chatResponseCache.ts      # Sem alterações (reuso se compatível)
│   └── index.ts                  # ALTERADO: exportar novos módulos
└── theme/                        # Sem alterações
```

**Structure Decision**: Estrutura de projeto único Next.js App Router existente. Novos arquivos seguem a organização atual: `services/` para lógica de rede, `hooks/` para estado/lógica, `components/` para UI. Nova página em `app/admin/`. Sem alterações em `layout.tsx` ou componentes existentes além do mínimo necessário (comentar áudio, atualizar contrato de rede).

## Complexity Tracking

> Nenhuma violação constitucional detectada. Seção aplicável apenas se houver justificativas de complexidade.