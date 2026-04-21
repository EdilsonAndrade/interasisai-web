<!--
  SYNC IMPACT REPORT
  Version change: N/A (initial) → 1.0.0
  Modified principles: none (initial adoption)
  Added sections:
    - Core Principles (8 principles)
    - Visual Identity Standards
    - Quality Gates & Definition of Done
    - Governance
  Removed sections: none
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ aligned (Constitution Check gates apply)
    - .specify/templates/spec-template.md ✅ aligned (scope / requirements sections apply)
    - .specify/templates/tasks-template.md ✅ aligned (test tasks reflect principle IV)
  Follow-up TODOs: none
-->

# Interasis AI Frontend Constitution

## Core Principles

### I. Separação de Responsabilidades — Hooks & UI

UI components MUST be "dumb" (presentational only). Business logic, API calls,
and complex state manipulation MUST NOT live inside `.tsx` component files.

- Custom Hooks are mandatory for any non-trivial logic (e.g., `useContactForm.ts`,
  `useAiChat.ts`). Direct `fetch` calls inside components are prohibited.
- Components MUST only consume hook return values (data, loading states, action
  functions) and render accordingly — Inversion of Control is required.
- Single Responsibility Principle (SRP): any component or hook doing more than one
  thing MUST be refactored into smaller, focused units before merging.

### II. Gerenciamento de Estado — Context API

Application state MUST be predictable and free from prop-drilling.

- Global state (theme, chatbot session, user/lead data) MUST use React's native
  Context API. Third-party state managers (Redux, Zustand) are not the default and
  require explicit justification.
- Local `useState` is permitted only for component-exclusive UI behaviours (e.g.,
  isolated dropdown open/close).
- Context Providers MUST be granular (`ChatProvider`, `ThemeProvider`, etc.). A
  single monolithic global Provider is prohibited to prevent unnecessary re-renders.

### III. Reusabilidade — DRY & Componentização

Code duplication — logic or UI — is not tolerated.

- Repeated visual patterns MUST become atomic components (e.g., `<GlowButton />`,
  `<GlassCard />`).
- Reusable components that accept a `className` prop MUST compose styles using
  `clsx` + `tailwind-merge` to prevent Tailwind specificity conflicts.
- Framer Motion effects MUST be encapsulated in reusable wrapper components
  (e.g., `<FadeInUp delay={0.2}>{children}</FadeInUp>`).

### IV. Testes Unitários — NON-NEGOTIABLE

No feature is "Done" without automated test coverage. Stack: Jest + React Testing Library.

- UI tests MUST simulate real user interactions (clicks, typing) using accessible
  queries (`getByRole`, `getByLabelText`). Testing implementation internals is
  prohibited.
- Custom Hooks MUST have isolated unit tests using `renderHook`, covering all
  state-change scenarios and error return paths.
- All tests MUST follow the AAA pattern: **Arrange → Act → Assert**.
- External dependencies (APIs, `MediaRecorder`, native browser APIs) MUST be
  mocked in test environments to guarantee deterministic, fast tests.

### V. Boas Práticas — TypeScript & Tratamento de Erros

- `any` is explicitly prohibited. All props, function returns, API payloads, and
  context values MUST have well-defined `interface` or `type` declarations.
- Errors MUST NOT fail silently. Service call failures MUST be captured and
  reflected in front-end error states, surfaced as toast notifications or
  user-friendly fallback UI.

### VI. Identidade Visual — Estilização & Animação

All visual interactions MUST preserve the project's "High-Tech" identity.

- **CSS**: Tailwind CSS is the sole styling solution. Inline styles and external
  CSS files are prohibited except for unavoidable global resets.
- **Animation engine**: Framer Motion is the standard. Entrance animations (fade-in,
  slide) MUST use smooth easing curves (`easeOut` or `anticipate`). Hover scale
  effects on buttons and cards MUST NOT exceed `scale(1.05)`.
- **Glassmorphism**: overlaid UI components MUST use `backdrop-blur` + transparency
  patterns.
- **Glow effects**: border or text glow MUST be implemented via Tailwind arbitrary
  shadow utilities (e.g., `shadow-[0_0_15px_rgba(var(--color-primary),0.5)]`).
- **Performance**: DOM-manipulating libraries (jQuery, legacy plugins) are prohibited.
  Complex animation calculations MUST be encapsulated in hooks and leverage GPU-
  composited CSS transforms.

### VII. SEO, Semântica e Acessibilidade

The site MUST be designed for maximum Google ranking and universal accessibility
from the first component.

- Every `page.tsx` MUST export a Next.js Metadata API object with optimised `title`,
  `description`, and `openGraph` fields for its specific route.
- Semantic HTML is required: `<div>` as a generic container is prohibited where a
  semantic element applies (`<nav>`, `<main>`, `<footer>`, `<article>`, etc.).
  Heading hierarchy (`<h1>` → `<h2>` → `<h3>`) MUST be strictly followed.
- All images MUST use the Next.js `<Image />` component (automatic WebP + lazy
  loading). The `alt` attribute is mandatory on every image.
- Heavy components (3D portfolio viewer, AI chat widget) MUST be loaded via
  `next/dynamic` to protect First Contentful Paint (FCP).

### VIII. Segurança e Proteção de Dados

- `dangerouslySetInnerHTML` is strictly prohibited throughout the application.
  AI-generated content rendered in the chat MUST be treated as plain text or
  sanitised through DOMPurify before rendering Markdown.
- All form and chat input data MUST be validated client-side with Zod schemas
  (in conjunction with `react-hook-form`) before any backend or Server Action call.
- API keys (OpenAI, Groq, Supabase) MUST NOT carry the `NEXT_PUBLIC_` prefix.
  Infrastructure secrets exist only on the server side.
- `next.config.js` MUST include strict Content Security Policy headers limiting
  script, iframe, and image sources to trusted domains (Vercel, project API,
  Google Fonts, etc.).

## Visual Identity Standards

Maintained as a living reference for design tokens and component contracts:

| Token | Value |
|---|---|
| Theme modes | Dark / Light / Tech Glow |
| Primary animation library | Framer Motion |
| CSS utility framework | Tailwind CSS v3+ |
| Style composition helpers | `clsx` + `tailwind-merge` |
| Max hover scale | `1.05` |
| Glow implementation | Tailwind arbitrary `shadow-[]` |
| Image component | `next/image` only |
| Lazy-loading strategy | `next/dynamic` for heavy components |

## Quality Gates & Definition of Done

A feature branch MUST satisfy ALL gates before merge:

1. **Hook/UI separation**: no business logic or fetch calls in `.tsx` files.
2. **Type safety**: zero `any` usages; all interfaces/types defined.
3. **Tests**: unit tests for every Custom Hook; RTL tests for every interactive
   component; all tests follow AAA pattern and mock external dependencies.
4. **Accessibility**: semantic HTML correct; all images have `alt`; interactive
   elements are keyboard-navigable.
5. **SEO**: `metadata` export present in every `page.tsx`.
6. **Security**: no `dangerouslySetInnerHTML`; inputs validated with Zod; no
   `NEXT_PUBLIC_` secrets; CSP headers configured.
7. **Performance**: `next/dynamic` applied to heavy components; no DOM-manipulating
   libraries imported.
8. **Style**: Tailwind-only styles; reusable components use `clsx` + `tailwind-merge`.

## Governance

This constitution supersedes all other development guidelines and ad-hoc conventions
in the Interasis AI Frontend repository. Any developer (human or AI agent) working
in this codebase MUST read and follow this document before making changes.

**Amendment procedure**:
- Amendments MUST be proposed via pull request with a written rationale.
- Version bump MUST follow semantic versioning (MAJOR/MINOR/PATCH as defined above).
- Breaking changes to existing principles require a migration plan covering affected
  components, hooks, and tests.
- All PRs/reviews MUST verify compliance with the Quality Gates listed above.
- Complexity beyond what is described here MUST be explicitly justified in the PR
  description.

**Version**: 1.0.0 | **Ratified**: 2026-04-21 | **Last Amended**: 2026-04-21
