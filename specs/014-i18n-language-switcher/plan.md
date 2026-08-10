# Implementation Plan: Internacionalização com Seletor de Idiomas

**Branch**: `014-i18n-language-switcher` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-i18n-language-switcher/spec.md`

## Summary

Adicionar suporte completo a internacionalização (i18n) ao site Interasis AI, permitindo detecção automática de idioma via geo-IP (país da rede) e seleção manual entre Português (Brasil), Inglês e Espanhol via seletor de bandeiras no header. A implementação usará `next-intl` (biblioteca padrão para Next.js App Router) com middleware para roteamento baseado em locale, arquivos JSON de dicionário organizados por namespace, e reestruturação das rotas com prefixo de locale (`/pt/`, `/en/`, `/es/`). ~186 strings em ~37 arquivos serão extraídas para dicionários de tradução.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.4, React 19.2.4  
**Primary Dependencies**: next-intl (^4.x, compatível com Next.js 16), framer-motion 12.x, react-hook-form 7.x + zod 4.x, tailwindcss 3.x, clsx + tailwind-merge  
**Storage**: N/A (i18n é puramente front-end; dicionários JSON estáticos; preferência de idioma via cookie `NEXT_LOCALE`)  
**Testing**: Jest 29 + React Testing Library (conforme Constitution IV); testes devem cobrir hooks, componentes interativos, middleware de locale e fallback de geo-IP  
**Target Platform**: Browser (desktop + mobile), com renderização server-side (Next.js SSR/SSG) via Docker  
**Project Type**: Web application (Next.js App Router, single frontend project)  
**Performance Goals**: Detecção geo-IP não deve adicionar >500ms ao carregamento (SC-007); troca de idioma <2s (SC-003); sem regressão no Lighthouse score atual  
**Constraints**: Manter compatibilidade com Dockerfile existente; CSP headers existentes; não quebrar rotas de API existentes; preservar a identidade visual high-tech (glassmorphism, glow, framer-motion)  
**Scale/Scope**: 3 locales (pt-BR, en, es), ~186 strings para extrair/traduzir, 37 arquivos impactados, ~10 novos arquivos (middleware, config i18n, dicionários, componente LanguageSwitcher)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Hook/UI Separation | ✅ PASS | `LanguageSwitcher` será componente "dumb" consumindo `useLocale`/`useTranslations` do next-intl; lógica de troca via hook `useLanguageSwitch` |
| II. Context API (State) | ✅ PASS | next-intl já provê `NextIntlClientProvider` como Context Provider; nenhum estado global adicional necessário |
| III. DRY & Componentização | ✅ PASS | `LanguageSwitcher` será componente reutilizável único; strings extraídas para dicionários eliminam duplicação |
| IV. Testes Unitários | ✅ PASS | Testes para `useLanguageSwitch` hook, `LanguageSwitcher` componente, middleware `createMiddleware`, todos AAA + mocks |
| V. TypeScript & Erros | ✅ PASS | `any` proibido; tipos definidos para `Locale`, dicionários, props; fallback gracioso para geo-IP indisponível |
| VI. Identidade Visual | ✅ PASS | `LanguageSwitcher` usará Tailwind + framer-motion para dropdown, glassmorphism consistente, max hover scale 1.05 |
| VII. SEO & Acessibilidade | ✅ PASS | Metadata dinâmico por locale; `hreflang` tags; `lang` attr dinâmico; semantic HTML; bandeiras com `aria-label` |
| VIII. Segurança | ✅ PASS | Sem `dangerouslySetInnerHTML`; CSP headers mantidos; sem novas secrets; zod validation existente mantida |

**Result**: ALL GATES PASS — no violations. Nenhuma entrada necessária no Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/014-i18n-language-switcher/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── i18n-contract.md # Interface contract for translation dictionaries
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── [locale]/                    # NEW: locale-prefixed routes
│   │   ├── layout.tsx               # Locale-aware root layout
│   │   ├── page.tsx                 # Home page (i18n-aware)
│   │   ├── sobre/
│   │   │   └── page.tsx             # About (i18n-aware)
│   │   ├── politica-de-privacidade/
│   │   │   └── page.tsx             # Privacy (i18n-aware)
│   │   ├── termos/
│   │   │   └── page.tsx             # Terms (i18n-aware)
│   │   └── admin/                   # Admin area (single locale or locale-aware)
│   │       └── ...
│   └── api/                         # UNCHANGED: API routes stay outside [locale]
│       └── ...
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # MODIFIED: add LanguageSwitcher
│   │   ├── Footer.tsx               # MODIFIED: i18n-aware strings
│   │   ├── navigation.config.ts     # MODIFIED: i18n-aware labels
│   │   └── LanguageSwitcher.tsx     # NEW: language selector component
│   ├── chat/
│   │   ├── ChatWidget.tsx           # MODIFIED: i18n-aware strings
│   │   └── ChatStatus.tsx           # MODIFIED: i18n-aware strings
│   ├── ui/
│   │   ├── HeroChatCta.tsx          # MODIFIED: i18n-aware strings
│   │   ├── HeroCover.tsx            # MODIFIED: i18n-aware alt text
│   │   └── BrandLogo.tsx            # MODIFIED: i18n-aware aria-label
│   └── admin/                       # All admin components MODIFIED: i18n-aware
│       └── ...
├── content/
│   └── institutional-pages.ts       # MODIFIED: locale-aware content
├── context/
│   └── ChatContext.tsx              # UNCHANGED (no user-facing strings)
├── hooks/
│   ├── useLanguageSwitch.ts         # NEW: language switch logic
│   └── ...                          # MODIFIED: i18n-aware messages
├── i18n/                            # NEW: all i18n configuration
│   ├── config.ts                    # Locale list, default locale, routing config
│   ├── request.ts                   # next-intl request config for server
│   └── locales/                     # Translation dictionaries
│       ├── pt-BR/
│       │   ├── common.json          # Shared: nav, footer, CTAs, aria-labels
│       │   ├── home.json            # Landing page content
│       │   ├── about.json           # Sobre page content
│       │   ├── privacy.json         # Privacy policy content
│       │   ├── terms.json           # Terms of use content
│       │   ├── chat.json            # Chat widget UI strings
│       │   └── admin.json           # Admin panel strings
│       ├── en/
│       │   └── ... (same structure)
│       └── es/
│           └── ... (same structure)
├── lib/
│   ├── tenantSchemas.ts             # MODIFIED: i18n-aware Zod messages
│   └── whatsappSchemas.ts           # MODIFIED: i18n-aware Zod messages
├── middleware.ts                    # NEW: locale detection + geo-IP routing
└── theme/
    └── ...                          # UNCHANGED
```

**Structure Decision**: Single Next.js project (Option 1) with `[locale]` route group added. The existing flat routes (`/sobre`, `/page.tsx`, etc.) will be moved into `src/app/[locale]/` and a new `middleware.ts` at the project root will handle locale detection and prefix-based routing. API routes (`/api/*`) remain outside `[locale]` to avoid prefix conflicts. This follows the `next-intl` recommended structure for App Router.

## Complexity Tracking

> No violations — section intentionally empty.
