# Implementation Plan: Guia de onboarding para cadastro de tenant

**Branch**: `edilsonaandrade/edi-49-adicionar-tutorial-guiado-para-cadastro-de-tenant` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/022-tenant-onboarding-guide/spec.md`
**Ticket**: [EDI-49](https://linear.app/edilsonandrade/issue/EDI-49/adicionar-tutorial-guiado-para-cadastro-de-tenant)

## Summary

Painel lateral fixo (`OnboardingGuidePanel`) com checklist manual de 8 itens, exibido ao criar um tenant, cobrindo prompts (operacional/institucional/chitchat), guardrail de identidade, ajuste de guardrails, vínculo do tenant, base de conhecimento e teste no site do cliente. Ao clicar em "criar tenant" aparece um aviso não bloqueante perguntando se o prompt inicial e a base de conhecimento já existem. Todo o estado (guia ativo/desativado + progresso do checklist por tenant) é local ao navegador (localStorage), sem mudança de backend.

**Abordagem técnica**: nenhuma biblioteca de tour/wizard é adicionada (não há `react-joyride`/`driver.js` no projeto e o escopo — painel fixo, sem spotlight sobre elementos — não justifica a dependência). O painel é montado uma vez em `AdminLayout` via um `OnboardingGuideProvider` (Context API, Princípio II da constituição), o que garante que ele sobrevive à navegação entre `/admin/tenants` e `/admin/prompt-manager` dentro da área administrativa. O gatilho de abertura fica em `TenantForm.tsx` (aviso ao submeter) e no próprio `TenantManagement.tsx` (abrir o painel após criação bem-sucedida).

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router)
**Primary Dependencies**: framer-motion 12 (transições do painel), lucide-react (ícones), Tailwind 3.4 — nenhuma dependência nova
**Storage**: localStorage do navegador apenas (`onboarding_guide_disabled`, `onboarding_guide_progress:{tenantId}`); sem persistência em backend
**Testing**: Jest 30 + React Testing Library 16, jsdom; `npm test`
**Target Platform**: navegadores modernos; área administrativa em `/[locale]/admin`
**Project Type**: aplicação web (frontend puro; nenhuma mudança de API)
**Performance Goals**: nenhuma meta nova; painel client-side, sem chamadas de rede adicionais
**Constraints**: sem `any`; sem fetch em `.tsx`; leitura/escrita de localStorage sempre com fallback em memória (mesmo padrão de `sessionManager.ts`) para nunca quebrar em ambientes sem storage; aviso da US2 nunca bloqueia o submit do formulário
**Scale/Scope**: 1 Context Provider novo, 1 hook novo, ~3 componentes novos (painel + item de checklist + aviso), 2 componentes existentes alterados (`TenantForm.tsx`, `AdminLayout`)

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.*

| # | Princípio | Como o plano atende | Status |
|---|---|---|---|
| I | Separação hook/UI | Toda leitura/escrita de localStorage e lógica de progresso vive em `useOnboardingGuide.ts`; `OnboardingGuidePanel`/`OnboardingGuideItem` só recebem estado e callbacks do Context. | ✅ |
| II | Estado via Context API | `OnboardingGuideProvider` novo e granular (não é um Provider monolítico existente), montado em `AdminLayout`, expõe estado ativo/desativado e progresso do checklist para qualquer tela em `/admin`. | ✅ |
| III | DRY / componentização | `OnboardingGuideItem` reutilizado para os 8 itens; destaque piscando implementado como variante de `<GlowButton />`/utilitário Tailwind existente reaproveitado, não recriado. | ✅ |
| IV | Testes (não negociável) | `renderHook` para `useOnboardingGuide` (marcar item, desativar, reativar, fallback sem localStorage); RTL para `OnboardingGuidePanel` (itens piscando somem ao marcar, ordem correta) e para o aviso da US2 (não bloqueia submit). AAA em todos; `localStorage` mockado/limpo entre testes. | ✅ |
| V | TypeScript & erros | Tipos novos (`OnboardingGuideState`, `OnboardingStepId`) sem `any`; leitura de localStorage nunca lança — erros de parsing/quota são capturados e tratados como estado vazio, nunca falha silenciosa que quebre a tela. | ✅ |
| VI | Identidade visual | Tailwind + Framer Motion apenas; painel usa glassmorphism/`backdrop-blur` consistente com `AdminDialog`; entrada do painel com slide-in (`easeOut`); destaque piscando via `animate-pulse`/keyframe Tailwind, não JS de animação pesado. | ✅ |
| VII | SEO/semântica/a11y | Sem `page.tsx` novo (painel vive no layout). Painel usa `<aside>` semântico com `aria-label`; cada item do checklist é um `<button>`/checkbox real, navegável por teclado, com estado marcado exposto via `aria-checked`. | ✅ |
| VIII | Segurança | Sem `dangerouslySetInnerHTML`; nenhum dado sensível é persistido (apenas flags booleanas e IDs de tenant já visíveis na tela); nenhuma chamada nova a backend. | ✅ |

**Resultado**: nenhuma violação. Seção de Complexity Tracking omitida.

**Reavaliação pós-Fase 1**: nenhuma violação introduzida pelo design (ver `data-model.md` e `research.md`). O `OnboardingGuideProvider` foi mantido restrito a `/admin` (não promovido a um Provider global da aplicação), preservando o Princípio II (Providers granulares).

## Project Structure

### Documentation (this feature)

```text
specs/022-tenant-onboarding-guide/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── checklists/
│   └── requirements.md
└── tasks.md              # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/[locale]/admin/
│   └── layout.tsx                          # ALT — envolve children com <OnboardingGuideProvider>
├── context/
│   └── OnboardingGuideContext.tsx           # NOVO — Provider + hook de consumo do Context
├── hooks/
│   └── useOnboardingGuide.ts                # NOVO — lógica de estado/persistência (usado pelo Provider)
├── services/
│   └── onboardingGuideStorage.ts            # NOVO — leitura/escrita localStorage + fallback em memória (espelha sessionManager.ts)
└── components/admin/
    ├── onboarding/
    │   ├── OnboardingGuidePanel.tsx         # NOVO — painel lateral fixo, lista os 8 itens
    │   ├── OnboardingGuideItem.tsx          # NOVO — item individual do checklist (marcar/piscar)
    │   └── OnboardingGuideDisableNotice.tsx # NOVO — opção de desativar na primeira exibição + controle de reativação
    └── tenants/
        └── TenantForm.tsx                   # ALT — dispara aviso informativo (US2) e abre o guia após criar o tenant
```

Testes acompanham cada arquivo como `*.test.ts(x)` no mesmo diretório — convenção já vigente no repositório.

**Structure Decision**: reaproveita a estrutura existente (`src/hooks`, `src/services`, `src/components/admin`); único diretório novo é `src/context/` (ainda não existe no projeto) porque nenhum Context Provider foi extraído para lá até hoje — os providers atuais, se houver, vivem inline nos componentes que os usam. Como este é o primeiro Context reutilizável entre múltiplas rotas de `/admin`, criar `src/context/` evita que ele fique "escondido" dentro de `components/admin/onboarding/`.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Painel montado no layout do servidor (`AdminLayout` é `async`/Server Component) não pode usar hooks/localStorage diretamente | `OnboardingGuideProvider` é `"use client"` e é apenas importado/renderizado pelo layout, igual ao padrão já usado para `AdminNavigation`; nenhuma lógica de client entra no arquivo do layout. |
| Progresso salvo em localStorage divergir do estado real do tenant no backend (usuário marca sem realmente concluir) | Documentado explicitamente como limitação aceita em `spec.md` (FR-004, Assumptions) — decisão já validada com o usuário; fora de escopo desta versão. |
| Painel piscando/pulsante virar poluição visual ou distração | Limitar `animate-pulse` a um destaque sutil (opacidade/borda), nunca cor ou movimento agressivo — verificado manualmente no `quickstart.md`. |
| localStorage indisponível (modo privado restritivo, quota excedida) | `onboardingGuideStorage.ts` segue o mesmo fallback em memória de `sessionManager.ts`: nunca lança, guia funciona na sessão atual mesmo sem persistência entre reloads. |
