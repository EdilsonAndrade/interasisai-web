# Research: Internacionalização com Seletor de Idiomas

**Feature**: 014-i18n-language-switcher  
**Date**: 2026-08-10  
**Purpose**: Resolver todas as decisões técnicas antes do design detalhado

---

## 1. Biblioteca de i18n para Next.js App Router

### Decision: `next-intl` v4.x

**Rationale**:
- É a biblioteca mais adotada e com melhor suporte para Next.js App Router (Server + Client Components).
- Suporta middleware-based routing, Server Components com `getTranslations()`, Client Components com `useTranslations()`, e geração estática.
- v4.x é compatível com Next.js 16.x (verificado em [next-intl releases](https://github.com/amannn/next-intl/releases)).
- Provê `NextIntlClientProvider` como Context nativo, alinhado ao Principle II da Constitution.
- Suporte nativo a `hreflang` tags, `alternate` links, e locale prefix routing via `createMiddleware()`.

**Alternatives considered**:
- **i18next + react-i18next**: Mais maduro, mas excessivamente complexo para 3 locales. Não tem integração nativa com Server Components do Next.js, exigindo workarounds.
- **next-i18next**: Deprecated em favor de `next-intl` para App Router.
- **Implementação customizada**: Rejeitada — reinventaria middleware, detecção de locale, e não teria o ecossistema de `next-intl`.

**Versão**: `next-intl@^4` (latest estável compatível com Next.js 16).

---

## 2. Estratégia de Roteamento com Locale

### Decision: Middleware-based prefix routing (`/pt/`, `/en/`, `/es/`)

**Rationale**:
- `next-intl` recomenda middleware-based routing com prefixo de locale nas URLs.
- URLs com prefixo (`/pt/sobre`, `/en/about`, `/es/sobre-nosotros`) são melhores para SEO (cada locale tem URL canônica própria).
- O middleware de `next-intl` (`createMiddleware`) lida automaticamente com:
  - Detecção do locale a partir do cookie `NEXT_LOCALE`
  - Redirecionamento de URLs sem prefixo para o locale detectado
  - Validação de locale na URL
- Estrutura de arquivos usa `[locale]` como segmento dinâmico: `src/app/[locale]/page.tsx`.

**Alternatives considered**:
- **Domain-based routing** (`pt.interasisai.com`, `en.interasisai.com`): Exige configuração DNS complexa e múltiplos certificados SSL. Overkill para o escopo.
- **Cookie-only (sem prefixo na URL)**: Pior para SEO — Google indexaria apenas uma versão da página. Viola FR-006.
- **Accept-Language header**: Não confiável como único método; muitos navegadores enviam apenas o idioma do SO, não reflete preferência real do usuário.

---

## 3. Detecção Geo-IP para Idioma

### Decision: Middleware com headers de infraestrutura + fallback para Accept-Language

**Rationale**:
- O projeto usa Docker para deploy; não há configuração Vercel ou Cloudflare detectada.
- A estratégia mais portável é: middleware verifica headers específicos de infraestrutura (`x-vercel-ip-country`, `CF-IPCountry`, `X-Geo-Country`) e mapeia o código do país para um locale suportado.
- Se nenhum header de geo-IP estiver disponível, fallback para o header `Accept-Language` do navegador.
- Se nenhum método produzir resultado, fallback final para `en` (Inglês) conforme spec FR-002.

**Mapeamento de país → locale**:
| Países detectados | Locale |
|---|---|
| BR (Brasil) | `pt-BR` |
| US, GB, CA, AU, NZ, IE (países anglófonos) | `en` |
| ES, MX, AR, CO, CL, PE, VE, EC, GT, CU, BO, DO, HN, PY, SV, NI, CR, PA, UY, GQ (países hispanofalantes) | `es` |
| Qualquer outro país | `en` (fallback) |

**Alternatives considered**:
- **API de geo-IP externa (ipapi, ipstack)**: Adiciona latência de rede e dependência externa. Risco de timeout viola SC-007.
- **Apenas Accept-Language**: Não atende ao requisito "computador que está em uma rede dos Estados Unidos" — o idioma do navegador pode não refletir a localização física.

---

## 4. Organização dos Arquivos de Tradução

### Decision: JSON namespaced por seção

**Rationale**:
- Arquivos JSON são nativos, não requerem parsing adicional, e têm amplo suporte de tooling.
- Namespaces por seção (`common`, `home`, `about`, `chat`, `admin`, etc.) evitam carregar todas as traduções de uma vez, melhorando performance.
- `next-intl` suporta carregamento lazy de namespaces via `getTranslations({ namespace })`.
- Estrutura: `src/i18n/locales/{locale}/{namespace}.json`.

**Alternatives considered**:
- **Arquivo único por locale**: Ficaria muito grande (~186 chaves), difícil de manter, e forçaria carregamento completo em cada página.
- **TypeScript (.ts)**: Oferece type-safety mas requer compilação; JSON é mais simples e `next-intl` já provê tipagem via `defineMessages`.
- **YAML**: Mais legível para conteúdo longo (páginas institucionais), mas exigiria dependência extra (js-yaml). JSON é suficiente.

---

## 5. Estratégia para Mensagens de Validação Zod

### Decision: Chaves de tradução resolvidas no momento da exibição

**Rationale**:
- Schemas Zod atualmente têm mensagens hardcoded em português (ex: `"O nome do tenant é obrigatório."`).
- Para i18n, as mensagens devem ser chaves de tradução (ex: `"validation.tenant.name.required"`).
- A resolução ocorre no componente que exibe o erro, usando `useTranslations('admin')`.
- Para uso programático (hooks, services), retornar a chave de erro e resolvê-la no componente.
- Zod não tem integração nativa com `next-intl`, mas suporta mensagens parametrizadas que podem ser chaves.

**Alternatives considered**:
- **next-intl no Zod via context**: Exigiria passar o tradutor para o schema, quebrando separação de responsabilidades.
- **Duplicar schemas por locale**: Inviável — triplicaria os schemas e violaria DRY.

---

## 6. Tratamento de Páginas Institucionais

### Decision: Conteúdo estruturado como registros por locale

**Rationale**:
- O conteúdo institucional atualmente é um array de objetos TypeScript em `institutional-pages.ts`.
- A abordagem mais limpa é transformar cada página em um registro indexado por locale, importado nos arquivos de dicionário JSON.
- Cada seção da página (título, resumo, blocos de conteúdo) vira uma entrada no namespace correspondente (`about.json`, `privacy.json`, `terms.json`).
- O componente `InstitutionalPage.tsx` usará `useTranslations()` para renderizar o conteúdo.

**Alternatives considered**:
- **Markdown/MDX por locale**: Mais flexível para conteúdo rico, mas exige configuração adicional do Next.js e foge do padrão atual de TypeScript estruturado.
- **CMS headless**: Overkill para 3 páginas estáticas; pode ser considerado no futuro.

---

## 7. Impacto nas Rotas de Admin

### Decision: Admin permanece com locale único ou herda locale da sessão

**Rationale**:
- As rotas de admin (`/admin/*`) são acessadas por administradores autenticados.
- O admin estará sob `/[locale]/admin/` para consistência de roteamento.
- Todas as strings do admin serão traduzidas (conforme escopo da spec).
- O locale do admin é determinado pelo mesmo mecanismo (geo-IP + cookie + seletor).

**Nota**: As rotas de API (`/api/*`) NÃO terão prefixo de locale, pois são endpoints REST, não páginas.

---

## 8. Componente LanguageSwitcher — Design

### Decision: Dropdown com bandeiras emoji + nomes nativos

**Rationale**:
- Bandeiras representadas por emojis nativos (🇧🇷, 🇺🇸, 🇪🇸) — zero dependências externas.
- Texto de cada opção no nome nativo do idioma: "Português", "English", "Español".
- Dropdown estilizado com glassmorphism (consistente com identidade visual).
- Animação de entrada/saída com framer-motion (`AnimatePresence`).
- Posicionamento: entre o botão de tema e o CTA primário no header desktop; como item adicional no menu mobile.
- Estado atual destacado visualmente (check ou cor primária).
- A troca de idioma dispara navegação para a mesma página no novo locale (via `useRouter` + `usePathname`).

**Alternatives considered**:
- **Select nativo**: Sem controle visual; bandeiras emoji não renderizam bem em `<option>`.
- **SVG de bandeiras (lucide-react ou similar)**: lucide-react não inclui bandeiras; adicionaria dependência desnecessária.
- **Toggle horizontal**: Funcionaria para 3 itens, mas menos escalável e ocupa mais espaço.

---

## Summary of Research Decisions

| # | Decision | Rationale Summary |
|---|----------|-------------------|
| 1 | `next-intl` v4.x | Melhor suporte para Next.js App Router, Server + Client Components |
| 2 | Middleware prefix routing (`/pt/`, `/en/`, `/es/`) | SEO-friendly, nativo do next-intl |
| 3 | Geo-IP via headers de infraestrutura + Accept-Language fallback | Portátil, sem dependência externa |
| 4 | JSON namespaced (`common`, `home`, `about`, etc.) | Performance (lazy load), manutenibilidade |
| 5 | Zod: chaves de tradução resolvidas no display | Separação de responsabilidades, sem duplicação |
| 6 | Conteúdo institucional como registros de dicionário JSON | Simples, consistente com o restante |
| 7 | Admin sob `/[locale]/admin/` | Consistência de roteamento; API rotas excluídas |
| 8 | Dropdown com emoji bandeiras + framer-motion | Zero dependências, glassmorphism, animação fluida |
