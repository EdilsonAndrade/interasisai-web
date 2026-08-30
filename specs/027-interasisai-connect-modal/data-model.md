# Phase 1 Data Model: InterasisAI Connect — Card Rebrand & Página de Valor

Não há persistência/banco de dados nesta feature. As "entidades" abaixo são estruturas de conteúdo (i18n + props de componente), derivadas da seção Key Entities do spec.

## PortfolioCardContent (extensão do case `chatAssistant`, namespace `home`)

Campos já existentes em `home.json` → `portfolio.projects.chatAssistant` permanecem; adiciona-se:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | string | sim (existente) | Passa a ser `"InterasisAI Connect"` (nome de marca, idêntico nos 3 idiomas) |
| `impactText` | string | sim (novo) | Frase curta de impacto de negócio, distinta da `description` técnica existente. Ex.: "Não é um chatbot. É a arquitetura que garante que seu cliente nunca fale com um menu." |
| `actions.learnMore` | string | sim (novo, em `portfolio.actions`) | Rótulo do novo botão ("Saiba mais" / "Learn more" / "Saber más") |

Regras de validação: `impactText` não pode ser vazio; deve ser distinto textualmente de `description` (verificação manual em review, não uma regra de runtime).

## ConnectPageContent (novo namespace de i18n `connect`, um arquivo por idioma)

| Campo | Tipo | Descrição |
|---|---|---|
| `metadata.title` | string | `<title>` da página (usado em `generateMetadata`) |
| `metadata.description` | string | Meta description / Open Graph description |

A imagem de Open Graph (`openGraph.images`) NÃO é uma chave de i18n — é a mesma nos 3 idiomas, referenciada como constante de código em `page.tsx` (`/images/interasisai-connect-cover.png`, com fallback para `/images/interasisai_coverpage.png` enquanto o ativo definitivo não for entregue — FR-015, Decisão 7).
| `eyebrow` | string | Selo curto acima do título (ex.: "A diferença aparece na primeira mensagem") |
| `title` | string com marcação `<em>...</em>` | Título de contraste, renderizado como `<h1>` via `t.rich("title", { em: ... })` do next-intl (NÃO `t()` simples — mensagens com tags exigem `t.rich`). Os trechos dentro de `<em>` recebem destaque de cor (`text-brand-primary`), replicando o destaque dourado do material de referência. Ex.: `"Um chatbot <em>oferece opções.</em> O InterasisAI Connect <em>já sabe a resposta.</em>"` |
| `lead` | string | Parágrafo de abertura explicando o contraste |
| `comparisonLabels` | `{ common: string; connect: string }` | Rótulos das duas colunas do comparativo (ex.: "Chatbot comum" / "InterasisAI Connect") |
| `comparisonBadges` | `{ common: string; connect: string }` | Selo curto exibido ao lado de cada rótulo, reforçando o contraste (ex.: "Hoje" / "Ao vivo") — adicionado em 2026-08-30 para replicar o layout lado a lado do material de referência |
| `architecture.title` | string | Título da seção "o que está por trás" (`<h2>`) |
| `architecture.description` | string | Explicação leiga da arquitetura RAG |
| `architecture.analogy` | string | Analogia ("funcionário novo que leu a pasta inteira") |
| `architecture.highlight` | string | Linha final de destaque (cor `text-brand-primary`, negrito), ex.: "Mudou um preço? Você troca o documento." — replica a linha dourada de fechamento do painel `.brain` no material de referência |
| `comparisonTable.title` | string | Título da seção de tabela comparativa (`<h2>`) |
| `comparisonTable.rows` | `Array<{ label: string; common: string; connect: string }>` | Linhas da tabela comparativa lado a lado |
| `steps.title` | string | Título da seção de passos (`<h2>`) |
| `steps.items` | `Array<{ title: string; description: string }>` (4 itens) | Passos do processo até o produto entrar no ar |
| `cta.title` | string | Título do bloco final de CTA da página |
| `cta.description` | string | Texto de apoio do CTA |
| `cta.buttonLabel` | string | Rótulo do botão que aciona o mesmo fluxo de "Testar Assistente ao Vivo" (`PortfolioOpenChatButton`) |
| `verticals` | `VerticalScenario[]` (5 itens) | Ver entidade abaixo |

## VerticalScenario

Representa um segmento de negócio ilustrativo dentro da página de valor (dado fictício, sem cliente real — FR-011).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string (`"buffet" \| "clinica" \| "escola" \| "imob" \| "rh"`) | Identificador estável da aba |
| `tabLabel` | string | Rótulo exibido na aba (ex.: "Buffet e eventos") |
| `customerQuestion` | string | Primeira pergunta simulada do cliente |
| `followUpQuestion` | string | Pergunta de acompanhamento simulada |
| `commonReply1` / `commonReply2` | string | Respostas do "atendimento comum" (estilo menu numerado) |
| `connectReply1` / `connectReply2` | string | Respostas do InterasisAI Connect (direto ao ponto) |
| `commonVerdict` | string | Resultado percebido do lado "atendimento comum" |
| `connectVerdict` | string | Resultado percebido do lado InterasisAI Connect |

Regra de estado: exatamente uma `VerticalScenario` é "ativa" por vez dentro de `ConnectVerticalComparison`; a primeira da lista (`buffet`) é o padrão ao carregar a página. Trocar a aba ativa é uma transição local de UI (sem persistência, sem mudança de URL).

## Dados Estruturados da Página (JSON-LD, não editorial)

Não são chaves de i18n com texto livre — são objetos montados em código a partir do `ConnectPageContent` já traduzido, um por idioma servido (ver Decisão 6 em `research.md`):

| Schema | Campos principais | Fonte dos dados |
|---|---|---|
| `Service` | `name` ("InterasisAI Connect"), `description` (`metadata.description`), `provider.name` ("Interasis AI"), `areaServed`, `url` (URL canônica da página) | `ConnectPageContent.metadata` + constantes do site (nome/URL da Interasis AI) |
| `BreadcrumbList` | 2 itens: Home (`name` traduzido, `url` da home) → InterasisAI Connect (`name` = `metadata.title`, `url` da própria página) | `ConnectPageContent.metadata` + `locale`/`siteUrl` |

## Componentes (contrato de props)

Ver `contracts/ui-contracts.md` para as assinaturas detalhadas de `PortfolioCard`, `ConnectPage`, `ConnectVerticalComparison` e das funções de `connectStructuredData.ts`, e para a lista completa de chaves de i18n obrigatórias.
