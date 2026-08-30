# Research — InterasisAI Connect: Posicionamento de Integrações e Expansibilidade

**Feature**: `specs/028-ai-connect-integrations` | **Date**: 2026-08-30

## R1. Como animar o diagrama de integração dentro da constituição (Framer Motion + preferências de movimento)

**Decisão**: Diagrama renderizado como client component (`ConnectIntegrationDiagram.tsx`) usando **Framer Motion** com:
- setas como `motion.path` (SVG) animando `strokeDashoffset`/`pathLength` em loop (`transition={{ repeat: Infinity, duration: ~2s, ease: "linear" }}`);
- nós com glow estático via Tailwind `shadow-[0_0_15px_rgba(var(--color-primary),0.5)]` (padrão do site) e leve pulse opcional;
- `useReducedMotion()` do Framer Motion como fonte única da decisão animado × estático — o mesmo padrão já usado em `src/components/ui/animations/FadeIn.tsx` (que retorna `{children}` puro quando reduzido).

**Rationale**: Framer Motion é o motor de animação oficial da constituição (Princípio VI). O padrão `useReducedMotion` + early-return estático já existe e é testado no projeto, evitando reinventar convenção. `strokeDashoffset`/`pathLength` são propriedades SVG com suporte nativo do Framer Motion e renderizam no client; o fallback estático não requer nenhuma animação de CSS.

**Alternatives considered**:
- CSS keyframes puros (`@keyframes dash`) — descartado: constituição exige Framer Motion como padrão e centralizar a condição de acessibilidade no React.
- Canvas/WebGL — descartado: complexidade desproporcional para um diagrama de marketing e conflita com o gate de performance.
- Biblioteca externa de diagramas (react-flow, mermaid) — descartado: dependência nova sem justificativa para ~8 nós estáticos; diagrama fica como JSX + SVG puro.

## R2. Estrutura visual e responsividade do diagrama (núcleo central + N ambientes)

**Decisão**:
- **Desktop/tablet (≥ md)**: núcleo central (badge "InterasisAI Connect — chat + agentes") ao centro e nós de categorias (CRM, Base de dados, API, MCP, Sistemas de RH, Outros) distribuídos ao redor em grid; setas SVG desenhadas do núcleo até cada nó com a animação de fluxo.
- **Mobile (< md)**: o SVG de setas é oculto; os nós aparecem em grade (2 colunas) abaixo do núcleo com um conector vertical simples (borda tracejada estática), preservando rótulos legíveis sem rolagem horizontal.

**Rationale**: Setas angulares de qualquer direção para um layout central são inviáveis de reposicionar responsivamente sem cálculos complexos; esconder o overlay SVG em telas estreitas e cair numa grade vertical cumpre FR-010 (sem rolagem horizontal, rótulos legíveis) com o menor custo.

**Alternatives considered**:
- Posicionamento absoluto com porcentagens calculadas em JS (hook com medidas) — descartado: exige resize observers e testes frágeis; o ganho visual em mobile não compensa.
- Manter as setas em mobile rotacionando o diagrama 90° — descartado: diagrama vertical duplicaria a altura da página sem ganho de clareza.

## R3. Acessibilidade do diagrama (FR-009, FR-011)

**Decisão**: O wrapper do diagrama recebe `role="img"` + `aria-label` traduzido (ex.: "Diagrama: InterasisAI Connect conectado a CRM, base de dados, API, MCP e sistemas de RH"), e uma **lista textual `sr-only`** com as categorias integráveis fica presente no DOM sempre (não apenas quando a animação está desativada). Com `prefers-reduced-motion`, o componente renderiza a versão estática: mesmo SVG sem a animação, com todas as setas visíveis e rótulos legíveis.

**Rationale**: Leitores de tela não interpretam SVG animado; a lista `sr-only` garante equivalência informacional. A versão estática mantém setas desenhadas (sem animação), satisfazendo "diagrama aparece estático, com todos os rótulos visíveis" da spec.

**Alternatives considered**:
- `aria-describedby` para um parágrafo existente — descartado: um `aria-label` próprio do diagrama + lista estruturada é mais direto e testável via `getByRole("img", { name })`.
- Remover o SVG quando reduzido — descartado: a spec exige diagrama estático visível, não ausência dele.

## R4. Onde o conteúdo novo vive (i18n) e como o card é atualizado

**Decisão**:
- Novo namespace `connect.integrations` em `connect.json` (3 idiomas) com: `title`, `description`, `closedScope`, `categories[]` (`{ id, label, description }`) e `diagram` (`nucleusLabel`, `ariaLabel`, `caption`).
- Card: reescrita de `portfolio.projects.chatAssistant.description` e `impactText` nos 3 `home.json` para comunicar integração + expansibilidade (FR-001/FR-002/FR-003), mantendo a menção ao agendamento; 5º highlight adicionado sobre integração com CRM/base de dados/APIs sob projeto de escopo fechado.
- `PortfolioSection.tsx` passa a mapear highlights com `t.raw("portfolio.projects.chatAssistant.highlights")` (array dinâmico), removendo a indexação manual `.0`–`.3`.

**Rationale**: Uma única fonte de verdade por idioma, seguindo o padrão da spec 027 (`connect.json` criado para a página). O `t.raw` elimina a manutenção manual de índices e permite 5 itens sem tocar no componente.

**Alternatives considered**:
- Criar um `integrations.json` separado — descartado: o conteúdo pertence à página do Connect e `connect.json` já é o namespace dela.
- Manter 4 highlights e "espremer" a mensagem no impactText — descartado: o destaque de integração ganha mais visibilidade como item da lista de diferenciais (FR-001).

## R5. Estratégia de testes (Princípio IV)

**Decisão**: Testes RTL sem mock de `framer-motion`:
- `ConnectPage.test.tsx` ganha casos para a nova seção (título, texto de escopo fechado, rótulos das categorias e presença da lista `sr-only`);
- `ConnectIntegrationDiagram.test.tsx` cobre: renderização de todos os rótulos de categoria, `role="img"` com `aria-label` correto, lista `sr-only` presente, e fallback estático quando `matchMedia("(prefers-reduced-motion: reduce)")` é simulado como `true` (o `useReducedMotion` do Framer Motion lê `matchMedia`);
- `PortfolioSection`/`PortfolioCard` tests: assert do novo impactText e do 5º highlight.

**Rationale**: O repositório não usa mocks de framer-motion hoje (os testes de `ConnectPage` renderizam direto) e os componentes `motion` renderizam normalmente em jsdom; simular `matchMedia` para o caso reduzido é determinístico e segue AAA.

**Alternatives considered**:
- `jest.mock("framer-motion")` global — descartado: esconderia o comportamento real dos componentes e não cobre o fallback estático.
- Testes visuais (screenshot) da animação — descartado: infraestrutura não existe no projeto; o contrato testável é a presença dos rótulos e dos dois estados (animado/estático).

## R6. SSR e hidratação do diagrama

**Decisão**: `ConnectIntegrationDiagram` é `"use client"` e recebe todo o conteúdo por props (server component monta o objeto traduzido). O estado inicial renderizado no servidor é a versão animada "parada no primeiro frame" (valores iniciais do `motion`), que hidrata sem divergência; o switch para estático ocorre apenas no client quando `useReducedMotion` retorna `true` (Framer Motion recomenda checagem client-only para evitar mismatch de SSR).

**Rationale**: Mesmo padrão do `ConnectVerticalComparison` (client leaf com props do servidor). Evita flash de conteúdo e mantém a página institucional 100% indexável/SSR.

**Alternatives considered**:
- Tornar `ConnectPage` inteira um client component — descartado: perderia o SSR da página institucional (Princípio VII/SEO).
- `next/dynamic` com `ssr: false` para o diagrama — descartado: componente é leve; desabilitar SSR prejudicaria o conteúdo visível sem animação em clientes com JS desativado (edge case da spec exige conteúdo estático visível).

## R7. Conteúdo: categorias genéricas, sem marcas (FR-013)

**Decisão**: As categorias exibidas são as citadas pelo solicitante — **CRM**, **Base de dados**, **APIs**, **MCP**, **Sistemas de RH** — mais uma categoria **"Outras integrações"** que cobre o "e outras" sem nomear produtos. Nenhuma marca de terceiros aparece em texto, rótulo ou ícone. "MCP" e "API" permanecem como siglas técnicas no diagrama (pedido explícito), com descrição em linguagem acessível no texto da seção.

**Rationale**: Atende FR-013 e o pedido explícito do solicitante (MCP visível no diagrama), sem risco de sugerir parcerias oficiais inexistentes.

**Alternatives considered**:
- Nomear produtos específicos (Salesforce, SAP…) — descartado: violaria FR-013 e criaria expectativa de integração oficial.
- Traduzir MCP por extenso — descartado: sigla já é o nome do padrão; tradução confundiria o público técnico que reconhece o termo.
