# Phase 0 Research: InterasisAI Connect — Card Rebrand & Página de Valor

Não há itens `NEEDS CLARIFICATION` remanescentes no Technical Context. Este documento registra as decisões técnicas necessárias para a Fase 1, incluindo a revisão de 2026-08-30 (modal → página dedicada).

## Decisão 1 — Modal vs. página dedicada para "Saiba mais"

- **Decision**: "Saiba mais" navega para uma página própria em `src/app/[locale]/interasisai-connect/page.tsx`, seguindo exatamente o padrão já usado por `src/app/[locale]/sobre/page.tsx` (mesmo slug nos 3 idiomas, `generateMetadata`, listagem em `src/app/sitemap.ts`, layout raiz compartilhado com `Header`/`Footer`/`ChatProvider`).
- **Rationale**: O requisito de negócio é que o link seja **compartilhável** (WhatsApp/LinkedIn) com uma prévia rica e específica do produto. Uma modal (aberta por estado local ou por query param) não tem uma URL própria bem definida nem metadados de Open Graph próprios sem reimplementar boa parte do que uma página real já dá de graça no Next.js App Router.
- **Alternatives considered**:
  - **Modal sobreposta à landing page** (abordagem original desta spec): rejeitada — não atende ao requisito de compartilhamento com preview rico.
  - **Modal + estado sincronizado na URL** (ex.: `/?saiba-mais=interasisai-connect`): rejeitada — o link compartilhado ainda herdaria os metadados genéricos da home (`generateMetadata` da home não muda com query params sem lógica adicional), e crawlers/bots de preview geralmente ignoram JS para decidir o que mostrar.
  - **Intercepting route (híbrido)**: clicar em "Saiba mais" dentro do site abre como modal por cima da landing page (via rota interceptada `(.)interasisai-connect`), enquanto o acesso direto ao link renderiza a página cheia com SEO próprio. Tecnicamente resolve os dois objetivos (elegância + compartilhamento), mas foi descartada por ora por adicionar complexidade (duas árvores de rota, gerenciamento de scroll/back button) não justificada nesta primeira entrega. Registrada como possível evolução futura na seção Assumptions do spec.

## Decisão 2 — Onde armazenar o conteúdo da página de valor

- **Decision**: Criar um namespace de i18n dedicado, `connect`, com um arquivo por idioma (`src/i18n/locales/{pt-BR,en,es}/connect.json`), registrado em `src/i18n/request.ts` do mesmo jeito que `about`/`terms`/`privacy`. O card continua usando `home.json` (`portfolio.projects.chatAssistant`) apenas para `title`, `impactText` e o rótulo do botão (`portfolio.actions.learnMore`).
- **Rationale**: O projeto já segue a convenção de "um arquivo de namespace por página institucional" (`about.json` para `/sobre`, `terms.json` para `/termos`). A página de valor é conceitualmente uma página própria, não mais um sub-bloco da home — seguir a mesma convenção evita inflar `home.json` com dezenas de linhas de conteúdo de outra página e mantém a fonte de verdade alinhada ao padrão existente.
- **Alternatives considered**:
  - Manter tudo aninhado em `home.json` sob `portfolio.projects.chatAssistant.valueModal` (decisão da versão anterior deste research, quando ainda era uma modal): rejeitada agora que o conteúdo pertence a uma página própria, não à home.
  - Arquivo de dados TypeScript separado com textos embutidos: rejeitado pelos mesmos motivos já registrados (duplicaria o mecanismo de i18n existente).

## Decisão 3 — Onde fica a lógica de interatividade das abas de vertical

- **Decision**: Um único componente client, `src/components/connect/ConnectVerticalComparison.tsx` (`"use client"`), recebe a lista de `VerticalScenario` (já traduzida, vinda do server component `page.tsx`) e mantém localmente qual aba está ativa (`useState`, padrão a primeira vertical). O restante da página (`ConnectPage.tsx` e os blocos estáticos) permanece como server component.
- **Rationale**: Minimiza a superfície client-side (só o que precisa de interatividade), mantendo o resto da página como HTML gerado no servidor — bom para SEO/FCP e alinhado ao Princípio VII.
- **Alternatives considered**: Tornar `page.tsx` inteiro um client component: rejeitado — perderia SSR de conteúdo que o Google e as prévias de link precisam indexar/renderizar.

## Decisão 4 — Botão "Testar Assistente ao Vivo" dentro da nova página

- **Decision**: Reaproveitar `PortfolioOpenChatButton` (já existente, usa `useChat()` do `ChatContext`) dentro do bloco de CTA da página de valor, sem nenhuma mudança no componente.
- **Rationale**: O layout raiz (`src/app/[locale]/layout.tsx`) já envolve toda página com `ChatProvider` e `ChatWidgetLoader`; como a nova rota está dentro de `src/app/[locale]/`, ela herda esse contexto automaticamente — não é necessário nenhum wiring adicional (Princípio II — Context API já cobre isso).
- **Alternatives considered**: Criar um novo botão/CTA específico para a página: rejeitado — duplicaria UI e comportamento já existentes sem necessidade (Princípio III — DRY).

## Decisão 5 — Link do card para a nova página

- **Decision**: `PortfolioSection.tsx` (server component) chama `getLocale()` de `next-intl/server` para montar `href={`/${locale}/interasisai-connect`}` e passa como nova prop (`learnMoreHref`) para `PortfolioCard`, que renderiza um `next/link` interno (mesmo padrão já usado em `src/components/layout/Header.tsx` para links internos com prefixo de locale).
- **Rationale**: Não existe wrapper de navegação (`createNavigation` do `next-intl`) no projeto; o padrão estabelecido em `Header.tsx` é montar o `href` manualmente com o `locale` — seguir o mesmo padrão evita introduzir uma segunda convenção de link no código.
- **Alternatives considered**: Adicionar `next-intl`'s `createNavigation` wrapper agora: rejeitado como fora de escopo — melhoraria a ergonomia de navegação do projeto como um todo, mas é uma mudança maior que não faz parte desta feature.

## Decisão 6 — Dados estruturados (JSON-LD) da página (reforço de SEO, 2026-08-30)

- **Decision**: A página emite dois blocos `<script type="application/ld+json">` (mesmo padrão de `organizationJsonLd` em `src/app/[locale]/layout.tsx`): um `@type: "Service"` descrevendo o InterasisAI Connect (nome, descrição, provedor = Interasis AI, área de atuação) e um `@type: "BreadcrumbList"` com dois níveis (Home → InterasisAI Connect). Os objetos são montados por funções puras em `src/components/connect/connectStructuredData.ts`, a partir do conteúdo já traduzido (`ConnectPageContent`) e do `locale`/`siteUrl`.
- **Rationale**: O projeto já tem precedente exatamente para isso (`organizationJsonLd`), então reaproveitar o padrão mantém consistência de estilo e evita reintroduzir a discussão sobre `dangerouslySetInnerHTML` (aqui aceitável, pois o conteúdo é gerado a partir de dados estáticos e traduzidos do próprio projeto, nunca de entrada de usuário ou IA). `Service` foi escolhido em vez de `SoftwareApplication` porque o InterasisAI Connect é entregue como um serviço contratado/implantado pela Interasis AI (com etapas de onboarding, conforme a seção "Como a gente trabalha"), não como um app autônomo baixável.
- **Alternatives considered**:
  - `SoftwareApplication`/`Product`: rejeitado — exigiria campos (preço, sistema operacional, avaliações) que não se aplicam a um serviço sob medida.
  - `FAQPage`: rejeitado — o conteúdo da página é comparativo/narrativo, não um conjunto de perguntas e respostas.
  - Biblioteca de schema (`schema-dts`, `next-seo`): rejeitado — nenhuma dependência desse tipo existe hoje no projeto; dois objetos JSON-LD simples não justificam uma nova dependência (mesmo raciocínio já usado para não adicionar Radix/Headless UI).

## Decisão 7 — Imagem de Open Graph dedicada (reforço de SEO, 2026-08-30)

- **Decision**: `generateMetadata` da nova rota referencia `/images/interasisai-connect-cover.png` (a ser fornecida pelo solicitante); enquanto esse ativo não existir em `public/images/`, o código usa `/images/interasisai_coverpage.png` (mesma imagem de capa já usada pela home) como fallback, para nunca deixar o campo `openGraph.images` vazio.
- **Rationale**: Gerar uma imagem de marketing polida não é uma tarefa de código — é um ativo de design que precisa ser produzido/aprovado pelo solicitante. Um fallback para a imagem genérica já existente evita bloquear o lançamento da página por causa de um asset pendente, mantendo FR-015 satisfeito ("nunca deixar o campo de imagem vazio").
- **Alternatives considered**: Gerar a imagem programaticamente (ex.: `@vercel/og` / `ImageResponse`) a partir do título/eyebrow da página: viável tecnicamente, mas fora do escopo pedido nesta feature; registrado aqui como possível evolução futura, não como tarefa desta entrega.
