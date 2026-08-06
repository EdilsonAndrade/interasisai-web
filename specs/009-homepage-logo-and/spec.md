# Feature Specification: Posicionamento do Logo e Cover Page na Home (Identidade Visual Interasis AI)

**Feature Branch**: `009-homepage-logo-and`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "crie uma especificação onde devemos colocar na pagina no melhor lugar tanto o logo como a cover page, atuando como especialista UX e UI para ter um impacto bonito e moderno, as imagens estão anexadas e na pasta public images"

## Resumo Executivo

A landing page atual da Interasis AI utiliza apenas tipografia para apresentar a marca no header, footer e hero. Existem dois ativos visuais oficiais já disponíveis em `public/images/`:

- `interasis_ai_logo.png` — logotipo isolado (símbolo + nome "Interasis AI" em pilha vertical, fundo transparente);
- `interasisai_coverpage.png` — composição horizontal de capa que combina o logotipo, o nome da marca, o slogan "Inteligência que conecta. Tecnologia que transforma." e uma ilustração de cabeça humana estilizada em circuitos azuis/roxos com efeitos de luz.

Esta especificação define **onde e como** cada ativo deve ser posicionado nas superfícies da home (e nos elementos globais que a circundam) para produzir um impacto visual moderno, premium e coerente com o posicionamento de IA + Engenharia de Software, sem alterar a hierarquia de conversão já validada (CTAs primário e secundário no hero).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Primeira impressão de marca no hero (Priority: P1)

Um visitante novo abre `https://interasis.ai`. Ao carregar a home, ele vê uma área hero que combina o título de proposta de valor, os CTAs e uma representação visual rica da marca (a cover page). A cover é integrada ao gradiente do hero — não aparece como um banner colado — reforçando os atributos "inteligência conectada" e "tecnologia que transforma" antes mesmo da rolagem.

**Why this priority**: O hero é a única superfície garantida em todas as visitas. É onde a percepção de "marca premium e moderna de IA" é construída em 3–5 segundos. Sem essa peça visual, a página depende apenas de texto, perdendo impacto emocional e diferenciação competitiva.

**Independent Test**: Pode ser validado de forma independente carregando `/` em desktop (≥1280px) e mobile (375px) e verificando que (a) o título, subtítulo e CTAs continuam legíveis e clicáveis; (b) a cover page aparece composta no hero sem cobrir texto; (c) o LCP do hero permanece sob 2,5s em rede 4G simulada.

**Acceptance Scenarios**:

1. **Given** usuário desktop em viewport ≥1024px, **When** carrega a home, **Then** o hero exibe à esquerda o bloco de texto + CTAs e à direita a cover page (`interasisai_coverpage.png`) recortada/posicionada de modo que a cabeça em circuitos seja o ponto focal, sem sobrepor o título.
2. **Given** usuário mobile em viewport <768px, **When** carrega a home, **Then** a cover é exibida como faixa horizontal acima ou abaixo do bloco de texto, com altura limitada (≤45% da viewport) e sem comprometer a leitura do H1 nem o tap target dos CTAs.
3. **Given** usuário com `prefers-reduced-motion: reduce`, **When** carrega o hero, **Then** a cover é exibida estática (sem parallax, sem fade prolongado), preservando o impacto visual.
4. **Given** usuário com conexão lenta, **When** o hero carrega, **Then** o texto e os CTAs aparecem imediatamente e a cover é carregada com `priority` mas com placeholder/blur para evitar layout shift (CLS < 0,05 no hero).

---

### User Story 2 - Identidade persistente em header e footer (Priority: P2)

Em qualquer página do site (incluindo a home, ao rolar), o visitante vê o logotipo oficial da Interasis AI no canto superior esquerdo do header, substituindo o texto "Interasis AI" atualmente usado. No rodapé, o mesmo logotipo aparece em variante adequada ao fundo escuro, reforçando a presença de marca ao final da jornada.

**Why this priority**: Reforça consistência de marca em toda a navegação e melhora reconhecimento. Não é P1 porque a home já entrega a marca via hero (US1); header/footer são amplificadores.

**Independent Test**: Pode ser testado renderizando o `Header` e o `Footer` isoladamente em qualquer rota e validando que o logotipo aparece com altura controlada, link para `/` (no header) e atributos de acessibilidade corretos (`alt="Interasis AI"`).

**Acceptance Scenarios**:

1. **Given** usuário em qualquer página, **When** observa o header fixo, **Then** vê o logotipo oficial à esquerda (altura entre 32–40px) clicável, levando para `/`, com texto alternativo "Interasis AI".
2. **Given** usuário no rodapé, **When** observa a coluna de marca, **Then** vê o logotipo oficial em tamanho maior (altura entre 48–56px) sobre o fundo escuro do footer, com contraste mínimo AA.
3. **Given** leitor de tela ativado, **When** percorre o header, **Then** anuncia "Interasis AI, link para a página inicial" exatamente uma vez (sem duplicar texto e logotipo).

---

### User Story 3 - Marca compartilhável (favicon, OG image, PWA) (Priority: P3)

Quando o site é compartilhado em redes sociais, aplicativos de mensagem ou fixado em uma aba/tela inicial, o ativo visual oficial aparece — o logotipo isolado para favicon e ícones, e a cover page como Open Graph image padrão. Isso garante que cada compartilhamento atue como mídia de marca.

**Why this priority**: Multiplica o alcance da marca fora do site, mas não afeta a experiência on-page direta. Pode ser entregue após US1 e US2.

**Independent Test**: Validar via DevTools / inspetores de OG (ex.: pré-visualizadores de LinkedIn, WhatsApp) que (a) o favicon aparece nos tamanhos requeridos; (b) ao colar a URL da home em um chat, a prévia exibe a cover page como imagem destacada; (c) o título e a descrição existentes em `metadata` permanecem corretos.

**Acceptance Scenarios**:

1. **Given** usuário cola a URL da home em um aplicativo que renderiza Open Graph, **When** a prévia é gerada, **Then** mostra a cover page como imagem (proporção 1200×630 ou recorte equivalente) e o título já configurado.
2. **Given** usuário fixa a aba do navegador, **When** observa o ícone, **Then** vê o símbolo do logotipo nítido nos tamanhos 16, 32 e 180px (Apple touch).

---

### Edge Cases

- **Imagem indisponível ou erro 404**: o hero, header e footer devem permanecer funcionais. O header recai no nome textual "Interasis AI"; o hero exibe o gradiente atual sem a cover; o footer mantém o nome textual. Nenhum espaço vazio quebrado é exibido.
- **Viewports ultrawide (>1920px)**: a cover não deve esticar de forma a distorcer o rosto/cabeça; aplicar `object-position` central e largura máxima delimitada pelo container do hero.
- **Tema futuro escuro**: o logotipo (em PNG colorido) deve preservar contraste suficiente sobre fundos claros e escuros; em fundos muito escuros, considerar variante alternativa (fora do escopo desta feature, mas registrar como dependência).
- **Imagem com alta densidade de detalhes vs. texto sobreposto**: nenhum texto crítico (H1, CTAs) pode ficar sobreposto à cabeça/rosto da cover. Quando o layout exigir overlay, aplicar máscara/gradiente para manter contraste AA.
- **Tradução do alt text**: textos alternativos descrevem o conteúdo visual em pt-BR, alinhados ao idioma principal do site.
- **Imagem PNG de fundo branco vs. hero gradiente**: a cover atual tem fundo branco/claro; deve ser integrada ao gradiente do hero via composição (ex.: máscara, blend, recorte) para não aparecer como "retângulo solto".

## Requirements *(mandatory)*

### Functional Requirements

#### Posicionamento — Hero da Home

- **FR-001**: A home (`/`) DEVE exibir a `interasisai_coverpage.png` integrada ao hero atual, sem remover o título, subtítulo e CTAs já existentes.
- **FR-002**: Em viewports ≥1024px, a cover DEVE ocupar a metade direita (ou ~45–55% da largura) do hero, com o texto + CTAs alinhados à esquerda em uma grade de duas colunas.
- **FR-003**: Em viewports <1024px, a cover DEVE ser empilhada (acima ou abaixo do bloco de texto) com altura máxima equivalente a 45% da altura da viewport, preservando proporção.
- **FR-004**: O fundo branco/claro original da cover DEVE ser harmonizado com o gradiente do hero por meio de máscara/recorte/blend, evitando bordas duras retangulares.
- **FR-005**: O ponto focal visual da cover (cabeça em circuitos) DEVE permanecer visível em todos os breakpoints suportados (≥375px), aplicando `object-position` adequado quando necessário.
- **FR-006**: O título H1 e os CTAs do hero NÃO PODEM ser sobrepostos por elementos da cover; quando houver interseção visual, aplicar overlay/gradiente para garantir contraste AA (≥4,5:1 para texto normal).

#### Posicionamento — Header

- **FR-007**: O header global DEVE substituir o atual texto "Interasis AI" pelo logotipo oficial (`interasis_ai_logo.png`) como elemento clicável que leva à raiz `/`.
- **FR-008**: O logotipo no header DEVE ter altura controlada entre 32 e 40px, mantendo proporção original e nitidez em telas Retina.
- **FR-009**: O elemento de logotipo do header DEVE preservar a acessibilidade atual (texto alternativo "Interasis AI", link com `aria-label`, foco visível por teclado) sem duplicação de texto+imagem para leitores de tela.

#### Posicionamento — Footer

- **FR-010**: O footer DEVE exibir o logotipo oficial na coluna de marca, em altura entre 48 e 56px, substituindo (ou acompanhando) o título textual atual de forma a evitar redundância.
- **FR-011**: O logotipo no footer DEVE manter contraste mínimo AA contra o fundo escuro existente; caso o ativo padrão não satisfaça o contraste, aplicar fundo/halo translúcido sutil que não comprometa a estética.

#### Compartilhamento e Identidade Global

- **FR-012**: O sistema DEVE configurar o `favicon` e ícones associados (incluindo Apple touch icon e ícones para PWA) a partir do logotipo oficial, nos tamanhos padrão 16, 32, 180 e 512px.
- **FR-013**: O sistema DEVE definir a cover page como imagem padrão de Open Graph e Twitter Card para a home, com dimensões/recortes adequados (1200×630 base).
- **FR-014**: A `metadata.openGraph.images` da home DEVE referenciar a cover page com `alt` descritivo em pt-BR.

#### Performance e Acessibilidade

- **FR-015**: Os ativos DEVEM ser servidos no formato e tamanho ótimos para web (formato moderno preferencial — ex.: AVIF/WebP — com fallback para PNG), sem alterar o arquivo-fonte original em `public/images/`.
- **FR-016**: A cover do hero DEVE ser carregada com prioridade alta e sem causar layout shift perceptível (CLS contribuído pelo hero < 0,05).
- **FR-017**: Todas as instâncias de logo e cover DEVEM ter `alt` text significativo em pt-BR; elementos puramente decorativos (caso surjam) recebem `alt=""`.
- **FR-018**: Os ativos DEVEM respeitar `prefers-reduced-motion`: nenhuma animação contínua (parallax, loop) é aplicada quando a preferência está ativa.

#### Robustez

- **FR-019**: Em caso de falha de carregamento de qualquer ativo, o layout DEVE degradar graciosamente: header e footer recuam ao texto da marca; o hero exibe apenas o gradiente sem espaço quebrado.
- **FR-020**: Os ativos DEVEM ser servidos a partir de `public/images/` (caminhos `/images/interasis_ai_logo.png` e `/images/interasisai_coverpage.png`) sem renomeação dos arquivos-fonte fornecidos.

### Key Entities

- **Marca Visual (Brand Asset)**: representa um ativo visual oficial da Interasis AI. Atributos relevantes: identificador (`logo` | `cover`), caminho público, dimensões nativas, texto alternativo em pt-BR, contexto de uso (`header`, `footer`, `hero`, `og`, `favicon`), variante de cor/contraste recomendada por superfície.
- **Superfície de Marca (Brand Surface)**: cada local da página/site onde um ativo aparece (hero, header, footer, OG, favicon, ícone PWA). Atributos: superfície, ativo associado, restrições de tamanho, regras de breakpoint, requisitos de contraste/acessibilidade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das visitas à home em desktop e mobile renderizam o logotipo no header e a cover composta no hero sem quebras visuais (medido por testes E2E e snapshot visual em pelo menos 3 breakpoints: 375, 768, 1280px).
- **SC-002**: O LCP da home permanece ≤2,5s em rede 4G simulada (Lighthouse mobile) após a inclusão da cover, sem regressão maior que 200ms em relação ao baseline atual.
- **SC-003**: O CLS da home permanece <0,1, com contribuição do hero <0,05.
- **SC-004**: 100% das instâncias de imagem da marca possuem texto alternativo em pt-BR e atendem contraste AA quando sobrepostas a outros elementos (verificado por auditoria axe/Lighthouse Accessibility ≥95).
- **SC-005**: Pré-visualizações de compartilhamento (Open Graph) da home exibem a cover page corretamente em pelo menos 3 plataformas validadas (LinkedIn, WhatsApp, X/Twitter) — verificável manualmente com inspetores oficiais.
- **SC-006**: 95% dos usuários em teste de percepção (interno, n≥5) descrevem espontaneamente a home como "moderna" e/ou "premium" e/ou "voltada a IA" após visualização do hero por 5 segundos.
- **SC-007**: Zero regressões funcionais nos testes existentes: testes de `Header`, `Footer` e `page.test.tsx` continuam passando após substituição do texto pelo logotipo, com asserts atualizados se necessário.

## Assumptions

- O usuário fornece somente os dois arquivos atuais (`interasis_ai_logo.png` e `interasisai_coverpage.png`); variantes monocromáticas, em SVG ou para tema escuro não estão disponíveis nesta iteração e podem ser solicitadas posteriormente como dependência.
- A cover page já contém o logotipo, o nome da marca e o slogan, portanto NÃO se justifica empilhar o logotipo isolado adicional no hero — isso geraria redundância visual.
- O slogan visível na cover ("Inteligência que conecta. Tecnologia que transforma.") é considerado parte do ativo visual e não substitui o subtítulo textual atual do hero, que continua sendo a fonte canônica acessível e indexável.
- O posicionamento desktop preferencial é texto à esquerda + cover à direita, alinhado a padrões de hero modernos para SaaS/IA (Anthropic, OpenAI, Vercel) onde o ativo visual reforça a proposta sem competir com a leitura.
- O sistema de design tokens, gradiente do hero e tipografia atuais são mantidos; esta feature não introduz nova paleta nem nova tipografia.
- O idioma principal permanece pt-BR; textos alternativos e descrições OG são escritos em pt-BR.
- Os arquivos-fonte em `public/images/` permanecem inalterados; quaisquer otimizações de formato (WebP/AVIF) são produzidas em pipeline (ex.: `next/image`) sem sobrescrever os PNGs originais.
- Não há requisito legal/regulatório adicional sobre o uso da marca neste momento (não há manual de marca formal anexo); decisões de espaçamento mínimo e cor seguem boas práticas gerais de identidade visual.
