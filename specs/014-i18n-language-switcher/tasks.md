# Tasks: Internacionalização com Seletor de Idiomas

**Input**: Design documents from `/specs/014-i18n-language-switcher/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/i18n-contract.md, quickstart.md

**Tests**: Tests are included per Constitution IV (non-negotiable). Each US has at least unit tests for hooks and component tests for interactive elements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create directory scaffolding, and initialize empty dictionary files

- [x] T001 Install `next-intl@^4` via `npm install next-intl@^4` and verify in `package.json`
- [x] T002 [P] Create i18n directory structure: `src/i18n/`, `src/i18n/locales/pt-BR/`, `src/i18n/locales/en/`, `src/i18n/locales/es/`
- [x] T003 [P] Create 24 empty dictionary JSON placeholder files in `src/i18n/locales/{pt-BR,en,es}/` for namespaces: `common.json`, `home.json`, `about.json`, `privacy.json`, `terms.json`, `chat.json`, `admin.json`, `validation.json`
- [x] T004 [P] Create `src/i18n/types.ts` with `LocaleMeta` interface and `LocaleCode` type

**Checkpoint**: Dependencies installed, directory tree ready for configuration files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure — config, routing, middleware with geo-IP, locale-aware root layout, and route migration. MUST complete before ANY user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/i18n/config.ts` with `locales` array (`["pt-BR", "en", "es"]`), `defaultLocale` (`"en"`), and `localeMeta` record (flag emoji + nativeName per locale)
- [x] T006 [P] Create `src/i18n/routing.ts` using `defineRouting()` from `next-intl/routing` with `localePrefix: "always"`
- [x] T007 [P] Create `src/i18n/request.ts` using `getRequestConfig()` from `next-intl/server` with dynamic namespace loading based on request locale
- [x] T008 Create `src/middleware.ts` at project root with `next-intl` middleware integration, geo-IP country-to-locale mapping (`COUNTRY_TO_LOCALE`), infrastructure header checks (`x-vercel-ip-country`, `cf-ipcountry`, `x-geo-country`), Accept-Language fallback, and cookie persistence (`NEXT_LOCALE`), skipping `/api/`, `/_next/`, and static files
- [x] T009 Create `src/app/[locale]/` directory and subdirectories: `sobre/`, `politica-de-privacidade/`, `termos/`, `admin/`, `admin/tenants/`, `admin/whatsapp/[instanceName]/qrcode/`
- [x] T010 Create locale-aware root layout `src/app/[locale]/layout.tsx` with `NextIntlClientProvider`, dynamic `lang` attribute from locale param, `generateMetadata()` with locale-aware alternates + hreflang, and import of `src/app/globals.css`
- [x] T011 Move `src/app/page.tsx` → `src/app/[locale]/page.tsx` and `src/app/page.test.tsx` → `src/app/[locale]/page.test.tsx`; update all relative imports
- [x] T012 [P] Move `src/app/sobre/page.tsx` → `src/app/[locale]/sobre/page.tsx`
- [x] T013 [P] Move `src/app/politica-de-privacidade/page.tsx` → `src/app/[locale]/politica-de-privacidade/page.tsx`
- [x] T014 [P] Move `src/app/termos/page.tsx` → `src/app/[locale]/termos/page.tsx`
- [x] T015 [P] Move `src/app/admin/layout.tsx` → `src/app/[locale]/admin/layout.tsx` and `src/app/admin/page.tsx` → `src/app/[locale]/admin/page.tsx`
- [x] T016 [P] Move `src/app/admin/tenants/page.tsx` → `src/app/[locale]/admin/tenants/page.tsx`
- [x] T017 [P] Move `src/app/admin/whatsapp/layout.tsx` → `src/app/[locale]/admin/whatsapp/layout.tsx` and `src/app/admin/whatsapp/page.tsx` → `src/app/[locale]/admin/whatsapp/page.tsx`
- [x] T018 [P] Move `src/app/admin/whatsapp/[instanceName]/` → `src/app/[locale]/admin/whatsapp/[instanceName]/`
- [x] T019 Remove empty directories left after migration: `src/app/page.tsx` original, `src/app/sobre/`, `src/app/politica-de-privacidade/`, `src/app/termos/`, `src/app/admin/` (only empty dirs)
- [x] T020 Update `next.config.ts` to add `next-intl` plugin integration and verify CSP headers still apply to locale-prefixed routes

**Checkpoint**: Foundation ready — `npm run dev` should work with locale-prefixed URLs (`/en/`, `/pt-BR/`, `/es/`). Middleware redirects `/` to detected locale. All existing pages accessible.

---

## Phase 3: User Story 1 - Detecção automática de idioma por localização (Priority: P1) 🎯 MVP

**Goal**: Visitantes visualizam o site automaticamente no idioma do seu país via geo-IP, com Inglês como fallback. O atributo `lang` do HTML e metadados refletem o locale detectado.

**Independent Test**: Simular headers de geo-IP (`curl -H "x-vercel-ip-country: BR" http://localhost:3000/`) e verificar redirecionamento para `/pt-BR/`; testar com país não suportado (`DE`) e verificar fallback para `/en/`; testar sem headers e verificar Accept-Language fallback → `/en/`.

### Tests for User Story 1

- [x] T021 [P] [US1] Unit test for `COUNTRY_TO_LOCALE` mapping in `src/middleware.test.ts` — verify all country codes map to correct locale, unknown countries return undefined
- [x] T022 [P] [US1] Integration test for middleware locale detection in `src/middleware.test.ts` — mock geo-IP headers, verify redirect to correct locale prefix, verify cookie `NEXT_LOCALE` is set
- [x] T023 [P] [US1] Middleware test for fallback chain in `src/middleware.test.ts` — no geo-IP header → Accept-Language → default `en`

### Implementation for User Story 1

- [x] T024 [US1] Finalize geo-IP detection logic in `src/middleware.ts` — ensure correct precedence: cookie > geo-IP > Accept-Language > default `en`; handle missing/invalid headers gracefully; set `NEXT_LOCALE` cookie with 1-year maxAge
- [x] T025 [US1] Implement country-to-locale mapping constant `COUNTRY_TO_LOCALE` in `src/middleware.ts` with all hispanophone and anglophone countries per research.md Section 3
- [x] T026 [US1] Configure `next-intl` middleware `createMiddleware(routing)` in `src/middleware.ts` — ensure locale prefix validation, locale extraction from pathname, and passthrough for API/static routes
- [x] T027 [US1] Set dynamic `lang` attribute on `<html>` in `src/app/[locale]/layout.tsx` using the resolved locale from params
- [x] T028 [US1] Implement `generateMetadata()` in `src/app/[locale]/layout.tsx` with `alternates.languages` for `hreflang` tags (`pt-BR`, `en`, `es`)

**Checkpoint**: Geo-IP detection functional. Visiting site from different simulated countries shows correct locale. `lang` attr and `hreflang` tags dynamically set. Fallback to `en` works when detection is impossible.

---

## Phase 4: User Story 2 - Seleção manual de idioma com bandeiras (Priority: P1)

**Goal**: Visitante pode alternar manualmente entre Português, Inglês e Espanhol via dropdown com bandeiras no header (desktop + mobile), com destaque visual do idioma ativo, animação glassmorphism, e persistência da escolha.

**Independent Test**: Abrir o site, clicar no seletor de bandeiras no header, selecionar Espanhol, verificar que a página recarrega em `/es/` com conteúdo em espanhol. Testar que o idioma escolhido persiste ao navegar para outras páginas e ao fechar/reabrir o navegador.

### Tests for User Story 2

- [x] T029 [P] [US2] Unit test for `useLanguageSwitch` hook in `src/hooks/useLanguageSwitch.test.ts` — verify `switchTo()` calls router.replace with correct locale, verify no navigation when same locale
- [x] T030 [P] [US2] Component test for `LanguageSwitcher` in `src/components/layout/LanguageSwitcher.test.tsx` — mock `useLocale`/`useRouter`/`usePathname`, verify 3 options rendered with flags, verify current locale highlighted, verify click triggers locale switch
- [x] T031 [P] [US2] Accessibility test for `LanguageSwitcher` in `src/components/layout/LanguageSwitcher.test.tsx` — verify keyboard navigation (Tab, Enter, Escape), verify `aria-label` on buttons, verify `listbox`/`option` roles

### Implementation for User Story 2

- [x] T032 [US2] Create `src/hooks/useLanguageSwitch.ts` — hook encapsulating `useLocale()`, `useRouter()`, `usePathname()` from `next-intl`; exports `currentLocale` and `switchTo(newLocale)` function that calls `router.replace(pathname, { locale: newLocale })`
- [x] T033 [US2] Create `src/components/layout/LanguageSwitcher.tsx` — "use client" component rendering:
  - Trigger button showing current locale flag emoji + nativeName
  - Dropdown menu (`AnimatePresence` + framer-motion) with 3 items: 🇧🇷 Português, 🇺🇸 English, 🇪🇸 Español
  - Current locale highlighted with primary color + check icon
  - Glassmorphism styling (`backdrop-blur`, `bg-white/10`, `rounded-xl`, border)
  - Max hover scale `1.05` (Constitution VI)
  - `aria-label` for accessibility; keyboard-navigable
  - Click outside closes dropdown; Escape key closes dropdown
- [x] T034 [US2] Integrate `LanguageSwitcher` into `src/components/layout/Header.tsx` desktop layout — position between ThemeToggle and primary CTA button, aligned to the right
- [x] T035 [US2] Integrate `LanguageSwitcher` into `src/components/layout/Header.tsx` mobile menu — add as item inside the hamburger menu with inline flag display
- [x] T036 [US2] Handle locale switch navigation — when user selects a new locale, navigate to same page under new locale prefix (e.g., `/pt-BR/sobre` → `/en/about` if slugs differ, or keep slug if same)
- [x] T037 [US2] Ensure cookie persistence — verify `NEXT_LOCALE` cookie is set by middleware on navigation, and preferred locale survives browser restart

**Checkpoint**: LanguageSwitcher functional on desktop and mobile. User can click flag, see dropdown, select new locale, and page reloads in chosen language. Cookie persists preference. No layout breakage on any viewport.

---

## Phase 5: User Story 3 - Conteúdo traduzido completo para os três idiomas (Priority: P2)

**Goal**: Todos os textos estáticos da interface pública e admin estão traduzidos nos 3 idiomas. Nenhum texto hardcoded permanece. Dicionários completos e consistentes.

**Independent Test**: Alternar entre os 3 idiomas via seletor e verificar que toda página (home, sobre, privacidade, termos, admin, chat) exibe conteúdo no idioma selecionado, sem chaves de tradução expostas ou textos em idioma errado.

**Note**: Os dicionários pt-BR (source of truth) devem ser populados PRIMEIRO a partir das strings existentes no código. Depois os dicionários en e es são populados com traduções. As tasks de conversão de componentes podem rodar em paralelo por namespace.

### Populate pt-BR Dictionaries (Source of Truth)

- [ ] T038 [P] [US3] Populate `src/i18n/locales/pt-BR/common.json` with nav, footer, CTA, brand, theme, and menu strings — extract from `navigation.config.ts`, `Header.tsx`, `Footer.tsx`, `BrandLogo.tsx`, `HeroChatCta.tsx`
- [ ] T039 [P] [US3] Populate `src/i18n/locales/pt-BR/home.json` with home page strings — extract from `src/app/[locale]/page.tsx` (hero, services, portfolio sections)
- [ ] T040 [P] [US3] Populate `src/i18n/locales/pt-BR/about.json` with Sobre page strings — extract from `src/content/institutional-pages.ts`
- [ ] T041 [P] [US3] Populate `src/i18n/locales/pt-BR/privacy.json` with Privacy Policy strings — extract from `src/content/institutional-pages.ts`
- [ ] T042 [P] [US3] Populate `src/i18n/locales/pt-BR/terms.json` with Terms of Use strings — extract from `src/content/institutional-pages.ts`
- [ ] T043 [P] [US3] Populate `src/i18n/locales/pt-BR/chat.json` with chat widget strings — extract from `ChatWidget.tsx`, `ChatStatus.tsx`, `useChatAssistant.ts`
- [ ] T044 [P] [US3] Populate `src/i18n/locales/pt-BR/admin.json` with admin panel strings — extract from all admin components (`AdminDashboard`, `AdminLoginForm`, `AdminNavigation`, `TenantForm`, `TenantManagement`, `TenantDetails`, `TenantDeleteDialog`, `TenantLookupForm`, `WhatsAppInstanceForm`, `WhatsAppQrCodeView`, `IngestForm`, `AdminDialog`)
- [ ] T045 [P] [US3] Populate `src/i18n/locales/pt-BR/validation.json` with Zod validation messages — extract from `tenantSchemas.ts`, `whatsappSchemas.ts`, `audioOptimization.ts`

### Populate en and es Dictionaries (Translations)

- [ ] T046 [P] [US3] Populate `src/i18n/locales/en/common.json` with English translations matching all keys from `pt-BR/common.json`
- [ ] T047 [P] [US3] Populate `src/i18n/locales/es/common.json` with Spanish translations matching all keys from `pt-BR/common.json`
- [ ] T048 [P] [US3] Populate `src/i18n/locales/en/home.json` with English translations matching all keys from `pt-BR/home.json`
- [ ] T049 [P] [US3] Populate `src/i18n/locales/es/home.json` with Spanish translations matching all keys from `pt-BR/home.json`
- [ ] T050 [P] [US3] Populate `src/i18n/locales/en/about.json` with English translations matching all keys from `pt-BR/about.json`
- [ ] T051 [P] [US3] Populate `src/i18n/locales/es/about.json` with Spanish translations matching all keys from `pt-BR/about.json`
- [ ] T052 [P] [US3] Populate `src/i18n/locales/en/privacy.json` with English translations matching all keys from `pt-BR/privacy.json`
- [ ] T053 [P] [US3] Populate `src/i18n/locales/es/privacy.json` with Spanish translations matching all keys from `pt-BR/privacy.json`
- [ ] T054 [P] [US3] Populate `src/i18n/locales/en/terms.json` with English translations matching all keys from `pt-BR/terms.json`
- [ ] T055 [P] [US3] Populate `src/i18n/locales/es/terms.json` with Spanish translations matching all keys from `pt-BR/terms.json`
- [ ] T056 [P] [US3] Populate `src/i18n/locales/en/chat.json` with English translations matching all keys from `pt-BR/chat.json`
- [ ] T057 [P] [US3] Populate `src/i18n/locales/es/chat.json` with Spanish translations matching all keys from `pt-BR/chat.json`
- [ ] T058 [P] [US3] Populate `src/i18n/locales/en/admin.json` with English translations matching all keys from `pt-BR/admin.json`
- [ ] T059 [P] [US3] Populate `src/i18n/locales/es/admin.json` with Spanish translations matching all keys from `pt-BR/admin.json`
- [ ] T060 [P] [US3] Populate `src/i18n/locales/en/validation.json` with English translations matching all keys from `pt-BR/validation.json`
- [ ] T061 [P] [US3] Populate `src/i18n/locales/es/validation.json` with Spanish translations matching all keys from `pt-BR/validation.json`

### Convert Layout Components (common namespace)

- [ ] T062 [US3] Convert `src/components/layout/navigation.config.ts` to use translation keys — replace hardcoded `label` strings with translation keys; export a `getNavigationConfig(t)` function or convert consuming components to use `useTranslations("common")`
- [ ] T063 [US3] Convert `src/components/layout/Header.tsx` to use `useTranslations("common")` — replace all hardcoded Portuguese aria-labels, theme toggle labels, and navigation item labels
- [ ] T064 [US3] Convert `src/components/layout/Footer.tsx` to use `useTranslations("common")` — replace description, section headings ("Institucional", "Contato", "Redes sociais"), copyright, contact info labels
- [ ] T065 [US3] Convert `src/components/ui/BrandLogo.tsx` to use `useTranslations("common")` — replace `FALLBACK_TEXT` and `LINK_ARIA_LABEL`
- [ ] T066 [US3] Convert `src/components/ui/HeroChatCta.tsx` to use `useTranslations("common")` — replace CTA button label
- [ ] T067 [US3] Convert `src/components/ui/HeroCover.tsx` to use `useTranslations("common")` — replace `COVER_ALT` text

### Convert Home Page (home namespace)

- [ ] T068 [US3] Convert `src/app/[locale]/page.tsx` to use `getTranslations("home")` for server-rendered metadata (`generateMetadata`) and all hardcoded strings (hero heading, subtitle, services headings/descriptions, portfolio heading/subtitle)

### Convert Institutional Pages (about, privacy, terms namespaces)

- [ ] T069 [US3] Convert `src/app/[locale]/sobre/page.tsx` to use `getTranslations("about")` for metadata and page content
- [ ] T070 [US3] Convert `src/app/[locale]/politica-de-privacidade/page.tsx` to use `getTranslations("privacy")` for metadata and page content
- [ ] T071 [US3] Convert `src/app/[locale]/termos/page.tsx` to use `getTranslations("terms")` for metadata and page content
- [ ] T072 [US3] Refactor `src/content/institutional-pages.ts` — if still used by `InstitutionalPage` component, update to support translation keys or deprecate in favor of direct `useTranslations()` usage in page components

### Convert Chat Components (chat namespace)

- [ ] T073 [US3] Convert `src/components/chat/ChatWidget.tsx` to use `useTranslations("chat")` — replace FAB aria-label, header text, close button aria-label, textarea placeholder, retry button, mic aria-label, timer aria-label, send button aria-label
- [ ] T074 [US3] Convert `src/components/chat/ChatStatus.tsx` to use `useTranslations("chat")` — replace typing indicator aria-label
- [ ] T075 [US3] Convert `src/hooks/useChatAssistant.ts` to return translation keys instead of hardcoded Portuguese strings — update `FALLBACK_AI_REPLY`, audio optimization errors, tenant missing errors to use keys resolved by consuming components

### Convert Admin Components (admin namespace)

- [ ] T076 [US3] Convert `src/components/admin/AdminDashboard.tsx` to use `useTranslations("admin")` — heading and subtitle
- [ ] T077 [US3] Convert `src/components/admin/AdminLoginForm.tsx` to use `useTranslations("admin")` — heading, subtitle, username, password, submit, submitting, error messages
- [ ] T078 [US3] Convert `src/components/admin/AdminNavigation.tsx` to use `useTranslations("admin")` — heading and nav item labels (Painel, WhatsApp, Tenants)
- [ ] T079 [US3] Convert `src/components/admin/AdminDialog.tsx` to use `useTranslations("admin")` — close button aria-label
- [ ] T080 [US3] Convert `src/components/admin/TenantManagement.tsx` to use `useTranslations("admin")` — heading, "Novo tenant", "Consultar por ID", dialog titles
- [ ] T081 [US3] Convert `src/components/admin/TenantForm.tsx` to use `useTranslations("admin")` — all field labels, submit buttons, submitting states, cancel button
- [ ] T082 [US3] Convert `src/components/admin/TenantDetails.tsx` to use `useTranslations("admin")` — labels (ID, Google Calendar, Criado em, etc.), "Não informado", "Tenant excluído", action buttons
- [ ] T083 [US3] Convert `src/components/admin/TenantDeleteDialog.tsx` to use `useTranslations("admin")` — title, description, cancel, confirm, confirming
- [ ] T084 [US3] Convert `src/components/admin/TenantLookupForm.tsx` to use `useTranslations("admin")` — field label, search button, searching state
- [ ] T085 [US3] Convert `src/components/admin/WhatsAppInstanceForm.tsx` to use `useTranslations("admin")` — field labels, submit button, reconnecting state, error messages
- [ ] T086 [US3] Convert `src/components/admin/WhatsAppQrCodeView.tsx` to use `useTranslations("admin")` — title, heading, generating, error, retry, steps (step1-3), back, done
- [ ] T087 [US3] Convert `src/components/admin/IngestForm.tsx` to use `useTranslations("admin")` — field labels, placeholder, submitting, submit button

### Convert Hooks and API Error Messages

- [ ] T088 [US3] Convert `src/hooks/useAdminAuth.ts` to return translation keys instead of hardcoded strings — update `"Autenticação administrativa indisponível."`, `"Usuário ou senha inválidos."`, `"Não foi possível acessar o painel. Tente novamente."`
- [ ] T089 [US3] Convert `src/hooks/useAdminIngest.ts` to return translation keys — `"O Tenant ID é obrigatório."`, `"O conteúdo do texto é obrigatório."`, `"O texto excede o limite máximo de 100.000 caracteres."`
- [ ] T090 [US3] Convert `src/hooks/useTenantManagement.ts` to return translation keys — `"Tenant cadastrado com sucesso"`, `"Tenant atualizado com sucesso"`, `"Tenant excluído com sucesso"`
- [ ] T091 [US3] Convert `src/hooks/useWhatsAppInstance.ts` to use translation keys for any user-facing messages
- [ ] T092 [US3] Convert `src/app/api/admin/session/route.ts` to return translation keys or locale-aware error messages — update `"Autenticação administrativa indisponível."`, `"Dados inválidos."`, `"Usuário ou senha inválidos."`

### Convert Validation Messages (validation namespace)

- [ ] T093 [US3] Convert `src/lib/tenantSchemas.ts` Zod error messages to translation keys — replace hardcoded PT-BR messages with keys like `"validation.tenantNameRequired"`
- [ ] T094 [US3] Convert `src/lib/whatsappSchemas.ts` Zod error messages to translation keys — replace hardcoded PT-BR messages with keys like `"validation.userRequired"`
- [ ] T095 [US3] Convert `src/hooks/audioOptimization.ts` error messages to translation keys — replace all hardcoded PT-BR messages with validation keys

### Convert Admin Page Metadata

- [ ] T096 [US3] Convert `src/app/[locale]/admin/page.tsx` metadata to use `getTranslations("admin")`
- [ ] T097 [US3] Convert `src/app/[locale]/admin/whatsapp/page.tsx` metadata to use `getTranslations("admin")`
- [ ] T098 [US3] Convert `src/app/[locale]/admin/whatsapp/layout.tsx` metadata to use `getTranslations("admin")`
- [ ] T099 [US3] Convert `src/app/[locale]/admin/tenants/page.tsx` metadata to use `getTranslations("admin")`
- [ ] T100 [US3] Convert `src/app/[locale]/admin/whatsapp/[instanceName]/qrcode/page.tsx` metadata to use `getTranslations("admin")`

### Update request.ts for Multi-Namespace Loading

- [ ] T101 [US3] Update `src/i18n/request.ts` to support loading all namespaces (`common`, `home`, `about`, `privacy`, `terms`, `chat`, `admin`, `validation`) — use dynamic imports based on requested namespaces or preload all for simplicity

**Checkpoint**: All user-facing strings extracted to dictionaries. All 3 locales have complete translations. No hardcoded Portuguese text remains in components, hooks, or pages. `npm run check-i18n` passes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, testing, performance, and final quality assurance

- [ ] T102 [P] Create `scripts/check-i18n.ts` — script that iterates all namespaces × locales, compares keys across locales, reports missing/extra keys, exits with non-zero on errors
- [ ] T103 [P] Add `"check-i18n"` script to `package.json`: `"check-i18n": "npx tsx scripts/check-i18n.ts"`
- [ ] T104 [P] Unit test for `useLanguageSwitch` hook edge cases in `src/hooks/useLanguageSwitch.test.ts` — test rapid successive locale switches, test navigation after switch
- [ ] T105 [P] Component test for `LanguageSwitcher` in mobile viewport in `src/components/layout/LanguageSwitcher.test.tsx` — verify mobile menu integration, verify dropdown closes on selection
- [ ] T106 Update `src/app/[locale]/page.test.tsx` — add tests verifying home page renders correctly in all 3 locales with mocked translations
- [ ] T107 Update `src/middleware.test.ts` — add edge cases: malformed geo-IP headers, missing Accept-Language, cookie with invalid locale, URL already has locale prefix
- [ ] T108 Run `npm run check-i18n` and fix any missing/extra keys across all 8 namespaces × 3 locales
- [ ] T109 Run `npm test` and ensure all existing tests pass with new locale-prefixed routes and i18n-aware components
- [ ] T110 Run `npm run build` and verify no build errors, no locale-related warnings
- [ ] T111 Manual smoke test: `npm run dev`, test all 3 locales on home, institutional pages, admin login, chat widget — verify no untranslated strings, no layout breakage
- [ ] T112 [P] Performance verification — check Lighthouse scores unchanged; verify geo-IP detection adds <500ms; verify locale switch completes <2s

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — can parallel with US2 after Phase 2
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) — can parallel with US1 after Phase 2
- **US3 (Phase 5)**: Depends on Foundational (Phase 2) and US1 dictionaries being defined (dictionary structure); can start in parallel with US2 component work
- **Polish (Phase 6)**: Depends on US3 completion (all dictionaries populated, all components converted)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — middleware geo-IP detection is self-contained
- **User Story 2 (P1)**: Can start after Phase 2 — LanguageSwitcher component depends on config.ts and routing.ts from Phase 2
- **User Story 3 (P2)**: Depends on Phase 2 route structure + US1 pt-BR dictionary baseline (T038-T045). Component conversion tasks (T062-T101) can partially overlap with US2 since they modify different files.

### Within Each User Story

- US1: Tests (T021-T023) before or parallel with implementation (T024-T028)
- US2: Tests (T029-T031) before or parallel with implementation (T032-T037)
- US3: pt-BR dictionaries (T038-T045) FIRST → en/es dictionaries (T046-T061) PARALLEL → Component conversion (T062-T101) PARALLEL within each namespace group

### Parallel Opportunities

- Phase 1: T002, T003, T004 can run in parallel
- Phase 2: T006, T007 can run in parallel; T012-T018 (route moves) can run in parallel
- Phase 3: T021, T022, T023 can run in parallel
- Phase 4: T029, T030, T031 can run in parallel
- Phase 5: T038-T045 (pt-BR dicts) can ALL run in parallel; T046-T061 (en/es dicts) can ALL run in parallel; within component conversion, layout (T062-T067), home (T068), institutional (T069-T072), chat (T073-T075) can run in parallel; admin components (T076-T087) can run in parallel
- Phase 6: T102, T103, T104, T105, T112 can run in parallel

---

## Parallel Example: User Story 3 Dictionary Population

```bash
# Populate ALL pt-BR dictionaries in parallel:
Task T038: "Populate src/i18n/locales/pt-BR/common.json"
Task T039: "Populate src/i18n/locales/pt-BR/home.json"
Task T040: "Populate src/i18n/locales/pt-BR/about.json"
Task T041: "Populate src/i18n/locales/pt-BR/privacy.json"
Task T042: "Populate src/i18n/locales/pt-BR/terms.json"
Task T043: "Populate src/i18n/locales/pt-BR/chat.json"
Task T044: "Populate src/i18n/locales/pt-BR/admin.json"
Task T045: "Populate src/i18n/locales/pt-BR/validation.json"

# After pt-BR complete, populate en and es in parallel:
Task T046-T061: All 16 en/es translation tasks can run simultaneously
```

## Parallel Example: User Story 3 Component Conversion

```bash
# Convert different component groups in parallel:
Group A: Layout components (T062-T067) — 6 tasks, no interdependencies
Group B: Home + Institutional pages (T068-T072) — 5 tasks, no interdependencies after dictionaries
Group C: Chat components (T073-T075) — 3 tasks
Group D: Admin components (T076-T087) — 12 tasks, all independent
Group E: Hooks + API (T088-T092) — 5 tasks
Group F: Validation schemas (T093-T095) — 3 tasks
Group G: Page metadata (T096-T100) — 5 tasks

# Groups A-G can all proceed in parallel!
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Deliverable**: Phases 1-4 (Setup + Foundational + US1 + US2)

At this point:
- Site has locale-prefixed URLs (`/en/`, `/pt-BR/`, `/es/`)
- Geo-IP auto-detection works with English fallback
- Language switcher with flags is visible and functional on desktop + mobile
- Navigation structure and layout are locale-aware
- **BUT**: Content is still mostly in Portuguese (US3 not yet done)

### Incremental Delivery

1. **Sprint 1 (MVP)**: Phase 1 + 2 + 3 + 4 → Infrastructure + auto-detection + selector
2. **Sprint 2 (Full i18n)**: Phase 5 → All content translated, all components converted
3. **Sprint 3 (Polish)**: Phase 6 → Validation scripts, tests, performance, build verification

### Recommended Execution Order

1. Start with Phase 1 (T001-T004) — quick setup, <30 min
2. Phase 2 (T005-T020) — critical path, blocks everything. Start immediately after Phase 1.
3. Once Phase 2 complete:
   - Start US1 (T021-T028) — middleware refinement
   - Start US2 (T029-T037) — LanguageSwitcher component (can run in parallel with US1)
   - Start pt-BR dictionary population (T038-T045) — source of truth for US3
4. After pt-BR dictionaries populated: en/es dictionaries (T046-T061) in massive parallel
5. After dictionaries ready: Component conversion (T062-T101) in parallel by namespace group
6. Phase 6 (T102-T112) — wrap-up after all conversions complete

---

## Notes

- The `src/app/api/` directory REMAINS outside `[locale]` — API routes are locale-independent
- The `src/app/globals.css` file stays at `src/app/globals.css` — imported by the new `[locale]/layout.tsx`
- `Space_Grotesk` font supports Latin characters only — adequate for pt-BR, en, es (all Latin-based)
- Institutional page slugs (`/sobre`, `/politica-de-privacidade`, `/termos`) remain in Portuguese across all locales for URL stability; only the content changes per locale
- The `src/content/institutional-pages.ts` file may be simplified or deprecated after conversion to dictionary-based content
- CSP headers in `next.config.ts` must continue working with locale-prefixed URLs
