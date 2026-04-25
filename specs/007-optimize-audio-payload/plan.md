# Implementation Plan: Otimização de Payload de Áudio e Integração BFF (EDI-25)

**Branch**: `007-create-feature-branch` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-optimize-audio-payload/spec.md`

## Summary

Implementar envio de mensagens por texto e voz para o BFF em canal único, garantindo que voz passe por otimização de duração (time-stretch) antes do envio, com preservação de inteligibilidade, observabilidade da redução e tratamento robusto de falhas sem regressão no fluxo textual.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.4, Next.js 16.2.4  
**Primary Dependencies**: APIs nativas de browser (`MediaRecorder`, `AudioContext`/`OfflineAudioContext`, `fetch`, `FormData`), `framer-motion`, `lucide-react`  
**Storage**: N/A (dados de áudio mantidos em memória no frontend durante a sessão)  
**Testing**: Jest 30 + React Testing Library (mocks de `MediaRecorder`, `AudioContext`, `fetch`)  
**Target Platform**: Frontend web (browsers modernos com suporte a captura de áudio)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: cumprir SC-001 e SC-005; manter feedback de erro em até 2s (SC-004)  
**Constraints**: sem regressão do fluxo textual; inclusão de credenciais em todas as requisições; não enviar payload de voz inválido  
**Scale/Scope**: mudança concentrada em hook de chat, componente de chat, serviço de integração e testes de hook/componente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Observação |
|-----------|--------|-----------|
| I. Separação Hooks/UI | PASS | Lógica de otimização e envio permanece em hook/serviço; componentes continuam apresentacionais |
| II. Context API | PASS | Não exige novo estado global; sem prop-drilling adicional |
| III. DRY e componentização | PASS | Contratos de payload e tratamento de erro centralizados para voz/texto |
| IV. Testes obrigatórios | PASS | Plano inclui cobertura para sucesso, erro de otimização, erro de integração e retry |
| V. TypeScript e erros | PASS | Tipagem explícita para payload/resultados; erros não silenciosos |
| VI. Estilo/animação | PASS | Sem mudanças de stack visual; UI mantém padrões existentes |
| VII. Acessibilidade/semântica | PASS | Feedback de erro continuará acessível (`aria-live`) no chat |
| VIII. Segurança | PASS | Sem `dangerouslySetInnerHTML`; uso de credenciais conforme política; sem exposição de segredo no cliente |

**Result**: gates aprovados para seguir à Fase 0.

## Project Structure

### Documentation (this feature)

```text
specs/007-optimize-audio-payload/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── audio-payload-bff-verification.md
├── checklists/
│   └── requirements.md
└── tasks.md  # gerado por /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   └── chat/
│       └── ChatWidget.tsx
├── hooks/
│   ├── useChatAssistant.ts
│   └── useChatAssistant.test.ts
└── services/
    └── chatGateway.ts                # novo (planejado)
```

**Structure Decision**: manter arquitetura frontend existente e adicionar uma camada de serviço HTTP para o BFF, reduzindo acoplamento no hook e facilitando testes.

## Phase 0: Research Output

Arquivo gerado: `research.md`.

Principais decisões consolidadas:
1. Time-stretch no cliente com Web Audio API para reduzir duração sem dependência pesada.
2. Canal único de integração BFF com diferenciação de payload por tipo (voz/texto).
3. Metadados de duração original/otimizada para evidência de redução (observabilidade).
4. Estratégia clara de tratamento de falhas com retry e sem fallback silencioso inválido.

## Phase 1: Design & Contracts Output

Arquivos gerados:
1. `data-model.md`
2. `quickstart.md`
3. `contracts/audio-payload-bff-verification.md`

Escopo de design:
1. Definição de entidades funcionais (captura, áudio otimizado, payload de integração, resultado de envio).
2. Regras de validação para bloquear payload inválido.
3. Contrato de integração BFF para texto (`application/json`) e voz (`multipart/form-data`).

## Implementation Phases (for /speckit.tasks)

### Fase A - Serviço de integração BFF

1. Criar módulo de serviço para envio de texto e voz.
2. Implementar tipagem de request/response e normalização de erro.
3. Garantir `credentials` em todas as requisições.

### Fase B - Otimização e envio de voz no hook

1. Aplicar pipeline de otimização de áudio antes do envio.
2. Validar duração otimizada < duração original antes de construir payload.
3. Enviar `FormData` com áudio e metadados de duração.

### Fase C - Fluxo textual no mesmo canal

1. Migrar envio textual para o mesmo gateway BFF.
2. Preservar comportamento atual de UX e estado do chat.

### Fase D - Tratamento de falhas e UX

1. Cobrir falhas de otimização com feedback imediato.
2. Cobrir falhas de integração (voz/texto) com retry.
3. Garantir não regressão de estabilidade da interface.

### Fase E - Testes automatizados

1. Testes de hook para sucesso e falhas de voz/texto.
2. Testes de contrato de payload (campos e credenciais).
3. Testes de componente para feedback de erro e continuidade de interação.

## Post-Design Constitution Re-Check

| Princípio | Verificação pós-design | Status |
|-----------|------------------------|--------|
| I. Hooks/UI | Serviço + hook concentram lógica; componente apenas renderiza/aciona ações | PASS |
| II. Context API | Sem necessidade de novo provider global | PASS |
| III. DRY | Contratos únicos para payload e erro | PASS |
| IV. Testes | Cobertura explícita em todos os fluxos críticos | PASS |
| V. TypeScript | Tipos dedicados para payload e resultado de envio | PASS |
| VI. Visual | Sem alteração de padrão de estilização | PASS |
| VII. A11y/SEO | Interações do chat continuam com mensagens acessíveis | PASS |
| VIII. Segurança | Sem HTML inseguro; credenciais e validações previstas | PASS |

**Result**: ALL GATES PASS - pronto para `/speckit.tasks`.

## Complexity Tracking

Nenhuma violação da constituição identificada.
