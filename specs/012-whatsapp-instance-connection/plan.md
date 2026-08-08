# Implementation Plan: Conexão de Instâncias WhatsApp

**Branch**: `Edilson-31-Dev` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-whatsapp-instance-connection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Adicionar ao painel administrativo um fluxo para criar uma instância WhatsApp vinculada a um tenant e recuperar o QR Code de uma instância existente. A integração estenderá o cliente tipado da API Python já usado pelo projeto; estado, concorrência e navegação ficarão em hook/context dedicados, enquanto formulários usarão React Hook Form + Zod. O QR Code será mantido apenas em memória entre rotas e reconsultado após refresh. A autenticação administrativa atual será movida de credenciais públicas no cliente para uma sessão curta em cookie `httpOnly` assinado no servidor, necessária para proteger a nova rota de QR Code.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router)  
**Primary Dependencies**: Next.js, React, Tailwind CSS 3.4, Lucide React, React Hook Form + Zod + `@hookform/resolvers` (novas dependências de validação), Node.js `crypto` para sessão assinada  
**Storage**: Sem persistência de domínio no frontend; cookie de sessão administrativa `httpOnly` e QR Code efêmero somente em memória  
**Testing**: Jest 30 + React Testing Library 16, mocks de `fetch`, navegação, cookies e tempo  
**Target Platform**: Web responsiva, navegadores modernos em desktop e mobile
**Project Type**: Aplicação web frontend Next.js com integração HTTP direta à API Python  
**Performance Goals**: loading visível em até 300 ms; QR Code exibido em até 5 s quando o backend responde normalmente; sem layout shift no quadro do QR  
**Constraints**: nenhuma chamada à Evolution API; sem QR Code em URL, localStorage ou logs; PNG `data:` validado; ações duplicadas bloqueadas; resposta obsoleta ignorada/cancelada; páginas administrativas protegidas  
**Scale/Scope**: 2 operações HTTP da API Python, 2 novas páginas administrativas, 1 fluxo de formulário, 1 visualização de QR Code e endurecimento da autenticação administrativa existente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Separação Hook/UI | PASS | `useWhatsAppConnection` e serviço tipado concentram chamadas, validação de resposta, loading e concorrência; componentes apenas renderizam e encaminham eventos |
| II. Context API | PASS | Provider granular sob a área admin mantém o QR efêmero e a solicitação ativa entre formulário e rota dedicada, sem prop drilling |
| III. DRY & Componentização | PASS | Estados de feedback e botões reutilizam os padrões admin existentes; contrato HTTP compartilha configuração e parser do cliente Python |
| IV. Testes Unitários | PASS | Planejados testes isolados para serviço, hook/context, sessão e interações das duas páginas com APIs externas mockadas |
| V. TypeScript & Erros | PASS | Payloads e resultados usam uniões discriminadas sem `any`; toda falha gera estado amigável e preserva campos editáveis |
| VI. Identidade Visual | PASS | Componentes usarão Tailwind e tokens existentes, Lucide para ações e escala de hover máxima já adotada |
| VII. SEO & Acessibilidade | PASS | Cada `page.tsx` será wrapper de servidor com metadata; formulário terá labels, erros associados e estados `aria-live`; QR usará `next/image` com `alt` |
| VIII. Segurança | PASS | Zod + React Hook Form validam entrada; PNG data URL é validado; QR fica só em memória; credenciais admin deixam de ser públicas e a sessão usa cookie assinado `httpOnly` |

**Gate Result (Pre-Design)**: PASS

### Post-Design Re-evaluation

| Principle | Status | Post-Design Verification |
|---|---|---|
| I. Separação Hook/UI | PASS | Contratos de UI deixam componentes apresentacionais; serviço e hook/provider possuem validação, rede, concorrência e transições |
| II. Context API | PASS | `data-model.md` limita o provider à árvore `/admin/whatsapp` e mantém apenas estado efêmero necessário entre rotas |
| III. DRY & Componentização | PASS | `research.md` confirma extensão do cliente Python e reuso dos padrões admin, sem cliente ou feedback duplicado |
| IV. Testes Unitários | PASS | `quickstart.md` exige suites focadas para serviço, sessão, hook/context, formulário, QR e proteção de rota com dependências mockadas |
| V. TypeScript & Erros | PASS | Modelo e OpenAPI definem payloads completos e resultados discriminados; contratos cobrem erros HTTP, rede e resposta inválida |
| VI. Identidade Visual | PASS | Contrato de UI preserva tokens Tailwind, ícones Lucide e quadro responsivo estável |
| VII. SEO & Acessibilidade | PASS | Contrato de rotas exige metadata server-side, labels, erros associados, `aria-live`, alt e navegação por teclado |
| VIII. Segurança | PASS | Research elimina credenciais públicas, define cookie assinado `httpOnly`, validação Zod, allowlist PNG e proíbe persistência/log do QR |

**Gate Result (Post-Design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/012-whatsapp-instance-connection/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- whatsapp-api.openapi.yaml
|   |-- admin-session.md
|   `-- ui-routes.md
`-- tasks.md  # Criado posteriormente por /speckit.tasks
```

### Source Code (repository root)
```text
src/
|-- app/
|   |-- api/admin/session/route.ts
|   `-- admin/
|       |-- page.tsx
|       `-- whatsapp/
|           |-- layout.tsx
|           |-- page.tsx
|           `-- [instanceName]/qrcode/page.tsx
|-- components/admin/
|   |-- AdminLoginForm.tsx
|   |-- WhatsAppInstanceForm.tsx
|   `-- WhatsAppQrCodeView.tsx
|-- context/
|   `-- WhatsAppConnectionContext.tsx
|-- hooks/
|   |-- useAdminAuth.ts
|   `-- useWhatsAppConnection.ts
|-- lib/
|   |-- adminSession.ts
|   `-- whatsappSchemas.ts
`-- services/
  |-- pythonBackend.ts
  `-- pythonBackend.types.ts

Tests remain colocated as `*.test.ts` and `*.test.tsx` beside each touched service,
hook, context helper, component, and route handler.
```

**Structure Decision**: Manter o projeto Next.js único e os testes colocalizados, seguindo o padrão atual. O cliente Python existente recebe as novas operações. O provider é limitado ao layout/árvore administrativa; páginas são wrappers de servidor responsáveis por metadata e verificação de sessão, delegando interação a componentes cliente.

## Complexity Tracking

Nenhuma violação constitucional identificada.
