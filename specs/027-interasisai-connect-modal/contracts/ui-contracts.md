# UI Contracts: InterasisAI Connect — Card Rebrand & Página de Valor

Este projeto não expõe API externa; os "contratos" desta feature são (1) a rota/página nova e seus metadados, (2) as props dos componentes React alterados/criados, e (3) o conjunto de chaves de i18n que precisam existir nos 3 idiomas antes do lançamento.

## Rota: `src/app/[locale]/interasisai-connect/page.tsx`

Segue o mesmo contrato de `src/app/[locale]/sobre/page.tsx`:

```ts
type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "connect" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `/${locale}/interasisai-connect`,
      languages: {
        "pt-BR": "/pt-BR/interasisai-connect",
        en: "/en/interasisai-connect",
        es: "/es/interasisai-connect",
        "x-default": "/en/interasisai-connect",
      },
    },
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: `/${locale}/interasisai-connect`,
      type: "website",
      locale,
      images: [
        { url: CONNECT_OG_IMAGE, width: 1200, height: 630, alt: "InterasisAI Connect" },
      ],
    },
  };
}
```

Regra de contrato: `generateMetadata` desta rota NÃO reaproveita `t("home", "metadata...")` — usa o namespace próprio `connect`, garantindo que o preview de compartilhamento seja específico do produto (FR-008, SC-006).

`CONNECT_OG_IMAGE` (constante no próprio `page.tsx`) resolve para `/images/interasisai-connect-cover.png` se o arquivo existir em `public/images/`; caso contrário, usa `/images/interasisai_coverpage.png` como fallback (FR-015, Decisão 7). Não é necessário nenhum acesso a filesystem em runtime para isso: enquanto o ativo dedicado não for entregue, o valor fica hardcoded como a imagem genérica; quando o ativo chegar, troca-se a constante em uma única linha.

### Dados estruturados (JSON-LD) — reforço de SEO

`page.tsx` também renderiza, dentro do próprio componente de página (mesmo padrão de `organizationJsonLd` em `layout.tsx`), dois blocos de dados estruturados montados por `src/components/connect/connectStructuredData.ts`:

```ts
// src/components/connect/connectStructuredData.ts
export function buildConnectServiceJsonLd(params: {
  locale: string;
  siteUrl: string;
  name: string;          // "InterasisAI Connect"
  description: string;   // ConnectPageContent.metadata.description
}): Record<string, unknown>;

export function buildConnectBreadcrumbJsonLd(params: {
  locale: string;
  siteUrl: string;
  homeLabel: string;     // rótulo traduzido do item "Home"
  pageLabel: string;     // ConnectPageContent.metadata.title
}): Record<string, unknown>;
```

Uso em `page.tsx`:

```tsx
<script
  type="application/ld+json"
  // eslint-disable-next-line react/no-danger
  dangerouslySetInnerHTML={{ __html: JSON.stringify(buildConnectServiceJsonLd({ ... })) }}
/>
<script
  type="application/ld+json"
  // eslint-disable-next-line react/no-danger
  dangerouslySetInnerHTML={{ __html: JSON.stringify(buildConnectBreadcrumbJsonLd({ ... })) }}
/>
```

Regra de contrato: `dangerouslySetInnerHTML` aqui só recebe a saída de `JSON.stringify` sobre objetos montados a partir de conteúdo estático/traduzido do próprio projeto — nunca texto vindo de usuário, IA ou terceiros, preservando o Princípio VIII.

## `sitemap.ts` (alterado)

Adicionar uma entrada à lista `ROUTES` existente:

```ts
{ path: "/interasisai-connect", priority: 0.7, changeFrequency: "monthly" }
```

## Componente: `PortfolioCard` (alterado)

```ts
type PortfolioCardProps = {
  title: string;
  category: string;
  description: string;
  impactText?: string;        // NOVO — quando presente, renderiza distinto de `description`
  highlights: string[];
  tags: string[];
  status: string;
  Icon: LucideIcon;
  actionText: string;
  actionHref?: string;
  isInteractiveChat?: boolean;
  learnMoreLabel?: string;    // NOVO
  learnMoreHref?: string;     // NOVO — ex.: "/pt-BR/interasisai-connect"
  featuresLabel?: string;
  ownershipLabel?: string;
  extraBadge?: ReactNode;
};
```

Regra de renderização: o botão/link "Saiba mais" só aparece quando `learnMoreLabel` e `learnMoreHref` são ambos fornecidos, renderizado com `next/link` (navegação real, não um handler de estado) — os demais cards de portfólio (sem essas props) continuam sem o botão, preservando o comportamento atual deles. `impactText` é opcional pelo mesmo motivo: sem quebrar os cards que não o definem.

## Componente: `ConnectPage` (novo, `src/components/connect/ConnectPage.tsx`)

Server component de apresentação, sem estado próprio:

```ts
type ConnectPageProps = {
  content: ConnectPageContent;   // ver data-model.md — inclui `verticals`
  ctaButtonLabel: string;        // rótulo repassado ao PortfolioOpenChatButton
};
```

Composição interna: eyebrow/title/lead (hero) → `<ConnectVerticalComparison verticals={content.verticals} labels={content.comparisonLabels} />` → seção de arquitetura → tabela comparativa → passos → CTA com `PortfolioOpenChatButton`.

## Componente: `ConnectVerticalComparison` (novo, `"use client"`, `src/components/connect/ConnectVerticalComparison.tsx`)

```ts
type ConnectVerticalComparisonProps = {
  verticals: VerticalScenario[];              // 5 itens, ver data-model.md
  labels: { common: string; connect: string };
  badges: { common: string; connect: string }; // "Hoje" / "Ao vivo" — adicionado em 2026-08-30
};
```

Comportamento contratado:

- Estado interno (`useState<VerticalScenario["id"]>`) inicia na primeira vertical da lista (`verticals[0].id`).
- Layout de duas colunas lado a lado (`md:grid-cols-2`), cada uma com sua própria thread de chat completa (pergunta do cliente repetida em ambas as colunas, réplica do material de referência) — não um bloco de pergunta compartilhado acima do grid.
- Cada coluna tem um cabeçalho com o rótulo (`labels.common`/`labels.connect`) e um selo (`badges.common`/`badges.connect`) para reforçar o contraste "chatbot comum" vs. produto real desde o primeiro olhar.
- Clicar em uma aba (`role="tab"`) troca a vertical ativa e re-renderiza as duas colunas — sem navegação, sem re-render de página inteira.
- Padrão ARIA completo de tabs: `role="tablist"`/`role="tab"`/`role="tabpanel"`, `aria-controls`/`aria-labelledby`, roving `tabIndex` com navegação por `ArrowLeft`/`ArrowRight`/`Home`/`End`, além de `Enter`/`Espaço`.
- Nenhuma chamada de rede — todo o conteúdo já vem de `verticals`/`labels`/`badges` (props), traduzido no server component pai.

## Chaves de i18n obrigatórias (pt-BR, en, es)

### Namespace `home` (arquivo `home.json`) — alterações

- `portfolio.projects.chatAssistant.title` → `"InterasisAI Connect"` (idêntico nos 3 idiomas)
- `portfolio.projects.chatAssistant.impactText` (novo)
- `portfolio.actions.learnMore` (novo)

### Namespace `connect` (arquivo novo `connect.json`, registrado em `src/i18n/request.ts`)

- `connect.metadata.title`
- `connect.metadata.description`
- `connect.eyebrow`
- `connect.title`
- `connect.lead`
- `connect.comparisonLabels.common`
- `connect.comparisonLabels.connect`
- `connect.architecture.title`
- `connect.architecture.description`
- `connect.architecture.analogy`
- `connect.comparisonTable.title`
- `connect.comparisonTable.rows[]` (`label`, `common`, `connect`)
- `connect.steps.title`
- `connect.steps.items[]` (`title`, `description`) — 4 itens
- `connect.cta.title`
- `connect.cta.description`
- `connect.cta.buttonLabel`
- `connect.verticals[]` (`id`, `tabLabel`, `customerQuestion`, `followUpQuestion`, `commonReply1`, `commonReply2`, `connectReply1`, `connectReply2`, `commonVerdict`, `connectVerdict`) — 5 itens (`buffet`, `clinica`, `escola`, `imob`, `rh`)

Verificação de contrato: um teste deve garantir que `pt-BR/connect.json`, `en/connect.json` e `es/connect.json` têm exatamente o mesmo conjunto de chaves, evitando divergência silenciosa entre idiomas (mesmo princípio já usado, se existir, para os demais namespaces de página).
