# Feature Specification: InterasisAI Connect — Rebranding do Card e Página de Valor

**Feature Branch**: `edilsonaandrade/edi-70-landing-page-renomear-card-para-interasisai-connect-e`
**Linear**: [EDI-70](https://linear.app/edilsonandrade/issue/EDI-70/landing-page-renomear-card-para-interasisai-connect-e-criar-pagina)
**Created**: 2026-08-30
**Updated**: 2026-08-30 — trocado o mecanismo de "Saiba mais" de modal para página dedicada (compartilhável), a pedido do solicitante
**Status**: Draft
**Input**: User description: "na landing page do interasis ai no produto Assistente IA Omnichannel (RAG) vamos alterar o nome para InterasisAI Connect, adicionar um novo botão ao lado do Testar Assistente ao Vivo (Saiba mais) que leva a uma página demonstrando o valor/arquitetura do produto com a mesma interatividade do material apresentacao-interasisconnect.html, e criar no card um texto de impacto que mostre que não é só um chatbot"; seguido de: "o link do Saiba mais precisa ser compartilhável — página dedicada em vez de modal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer o produto pelo novo nome e por um texto de impacto (Priority: P1)

Um visitante da landing page (potencial cliente ou avaliador de negócio, não técnico) rola até a seção de Cases de Sucesso e vê o card antes chamado "Assistente IA Omnichannel (RAG)" agora como **InterasisAI Connect**, acompanhado de uma frase de impacto que deixa claro, em linguagem de negócio, que se trata de uma arquitetura de atendimento com resultado mensurável — não apenas mais um chatbot genérico.

**Why this priority**: É a mudança de percepção mais barata e com maior efeito imediato: sem ela, o restante da experiência (botão e página) não tem a quem se dirigir com o posicionamento certo.

**Independent Test**: Abrir a landing page em pt-BR, en e es e conferir visualmente que o card exibe "InterasisAI Connect" e o novo texto de impacto, sem depender do botão ou da página de valor.

**Acceptance Scenarios**:

1. **Given** a landing page carregada em qualquer um dos 3 idiomas, **When** o visitante visualiza a seção de portfólio, **Then** o card exibe "InterasisAI Connect" como título (nome de marca, não traduzido).
2. **Given** o card do InterasisAI Connect, **When** o visitante lê o conteúdo do card, **Then** encontra uma frase de impacto de negócio, visualmente distinta da descrição técnica existente, que comunica valor sem jargão técnico.

---

### User Story 2 - Explorar e compartilhar o valor do produto pela página "Saiba mais" (Priority: P1)

O mesmo visitante, curioso para entender por que o produto é diferente de um chatbot comum, clica no botão **"Saiba mais"** (ao lado de "Testar Assistente ao Vivo") e é levado a uma **página própria do site** que conta a história de valor: o contraste entre um atendimento automático comum e o InterasisAI Connect, como a arquitetura funciona em linguagem leiga, uma comparação lado a lado e os passos até o produto entrar no ar. Essa página tem uma URL estável que pode ser copiada e enviada por WhatsApp/LinkedIn/e-mail, exibindo uma prévia (título, descrição e imagem) específica do produto quando o link é compartilhado.

**Why this priority**: É o mecanismo central pedido — sem essa página, o texto de impacto do card fica sem aprofundamento para quem quer entender antes de testar o assistente ao vivo, e o solicitante não consegue enviar esse conteúdo diretamente a um prospect fora do site.

**Independent Test**: Clicar em "Saiba mais" a partir do card e verificar que o navegador vai para uma nova URL própria da página de valor; abrir essa URL diretamente (sem passar pela landing page) também funciona e mostra o mesmo conteúdo; inspecionar os metadados da página confirma título/descrição/imagem específicos do produto (não os da landing page genérica).

**Acceptance Scenarios**:

1. **Given** o card do InterasisAI Connect, **When** o visitante clica em "Saiba mais", **Then** o navegador navega para uma página própria (URL dedicada) exibindo o conteúdo de valor/arquitetura do produto.
2. **Given** a URL da página de valor copiada, **When** ela é aberta em uma nova aba/navegador sem visitar a landing page antes, **Then** a página carrega normalmente com o mesmo conteúdo, incluindo cabeçalho e rodapé do site.
3. **Given** a página de valor, **When** seus metadados são inspecionados (título da aba, meta description, Open Graph), **Then** eles são específicos do InterasisAI Connect, não uma cópia genérica dos metadados da home.
4. **Given** a página de valor aberta em qualquer um dos 3 idiomas, **When** o visitante lê o conteúdo, **Then** todo o texto está no mesmo idioma acessado (sem mistura de idiomas), incluindo a URL com o prefixo de idioma correspondente.

---

### User Story 3 - Comparar o produto pelo cenário do próprio segmento (Priority: P2)

Dentro da página de valor, o visitante troca entre abas de vertical de negócio (Buffet e eventos, Clínica, Escola, Imobiliária, RH) e vê a simulação de conversa ("atendimento comum" vs. "InterasisAI Connect") mudar de acordo com a vertical escolhida, assim como no material de referência já validado.

**Why this priority**: Aumenta a relevância percebida ("isso se aplica ao meu negócio"), mas o valor central da página (P1) já é entregue mesmo com uma única vertical visível por padrão.

**Independent Test**: Na página de valor, clicar em cada uma das 5 abas de vertical e confirmar que a simulação de conversa e o veredito de cada lado ("o cliente desiste" vs. "o cliente fecha") mudam conforme a aba ativa, sem navegar para outra URL.

**Acceptance Scenarios**:

1. **Given** a página de valor carregada na aba padrão (primeira vertical), **When** o visitante clica em outra aba de vertical, **Then** a simulação de conversa dos dois lados (comum vs. InterasisAI Connect) é substituída pelo conteúdo daquela vertical, permanecendo na mesma página/URL.
2. **Given** qualquer aba de vertical selecionada, **When** o visitante navega pelo teclado (Tab/Enter) entre as abas, **Then** a troca de conteúdo funciona da mesma forma que pelo clique do mouse.

---

### Edge Cases

- O que acontece ao abrir a página de valor em uma tela pequena (mobile)? O comparativo lado a lado deve se reorganizar em coluna única, permanecendo legível e sem rolagem horizontal.
- O que acontece se o visitante clicar em "Testar Assistente ao Vivo" a partir de dentro da página de valor? O widget de chat deve abrir normalmente sobre a página de valor, do mesmo jeito que abre sobre a landing page (mesmo `ChatProvider`/layout compartilhado).
- O que acontece se o JavaScript de troca de abas falhar ou o usuário tiver `prefers-reduced-motion` ativado? O conteúdo de uma vertical padrão deve permanecer visível e legível mesmo sem animações ou trocas (a informação nunca fica vazia).
- O que acontece com o texto de impacto e a página de valor quando o idioma do navegador é diferente de pt-BR/en/es? O sistema já usa fallback de idioma padrão do site atual; o mesmo fallback se aplica ao novo conteúdo e à nova rota.
- O que acontece se um motor de busca ou rastreador indexar a página de valor? Ela deve se comportar como as demais páginas institucionais do site (indexável, listada em `sitemap.ts`), já que agora é uma URL pública de primeira classe.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir "InterasisAI Connect" como título do card atualmente rotulado "Assistente IA Omnichannel (RAG)", como nome de marca (grafia idêntica) nos 3 idiomas do site (pt-BR, en, es).
- **FR-002**: O card DEVE exibir um texto de impacto de negócio (curto, sem jargão técnico) que comunique que o produto é uma arquitetura de atendimento com resultado de negócio, e não apenas um chatbot — visualmente distinto da descrição técnica e dos destaques (highlights) já existentes no card.
- **FR-003**: O sistema DEVE exibir um botão "Saiba mais" (ou equivalente traduzido) posicionado ao lado do botão existente "Testar Assistente ao Vivo" no rodapé do card, nos 3 idiomas.
- **FR-004**: Ao clicar em "Saiba mais", o sistema DEVE navegar o visitante para uma página própria e dedicada do site (URL estável, compartilhável), em vez de abrir uma sobreposição na página atual.
- **FR-005**: A página de valor DEVE cobrir, no mínimo, os mesmos blocos de conteúdo do material de referência (`apresentacao-interasisconnect.html`): comparação "atendimento comum vs. InterasisAI Connect" com simulação de conversa, explicação da arquitetura em linguagem leiga, tabela comparativa lado a lado, e os passos do processo até o produto entrar no ar.
- **FR-006**: A página de valor DEVE oferecer abas para pelo menos 5 verticais de negócio (Buffet e eventos, Clínica, Escola, Imobiliária, RH), replicando a interatividade do material de referência: ao clicar em uma aba, a simulação de conversa e o veredito de cada lado do comparativo são atualizados para refletir aquela vertical, sem navegar para outra URL.
- **FR-007**: O conteúdo da página de valor (textos, rótulos das abas, simulações de conversa) DEVE existir nos 3 idiomas do site, acessível através do prefixo de idioma já usado nas demais páginas (ex.: `/pt-BR/...`, `/en/...`, `/es/...`).
- **FR-008**: A página de valor DEVE ter uma URL própria e estável, acessível diretamente (sem depender de ter navegado a partir da landing page), com metadados de página (título, descrição, imagem/Open Graph) específicos do produto — não uma cópia dos metadados genéricos da home.
- **FR-009**: A página de valor DEVE ser listada nas páginas indexáveis do site (mesmo mecanismo já usado por `sobre`, `termos`, `politica-de-privacidade`), incluindo suas variações de idioma.
- **FR-010**: O botão "Testar Assistente ao Vivo" DEVE continuar funcionando (abrindo o mesmo widget de chat) tanto na landing page quanto dentro da nova página de valor.
- **FR-011**: O conteúdo da página de valor usado nas simulações de conversa NÃO DEVE referenciar dados de cliente real (nomes, valores ou informações específicas de um cliente da Interasis AI) — apenas cenários ilustrativos por vertical.
- **FR-012**: A página de valor DEVE ser navegável e operável via teclado (foco visível, troca de abas por teclado), e o conteúdo essencial de cada vertical deve permanecer visível caso as animações estejam desativadas.
- **FR-013**: A página de valor DEVE expor dados estruturados (JSON-LD) descrevendo o produto como um serviço/oferta da Interasis AI, para reforçar como buscadores interpretam e exibem a página nos resultados de busca.
- **FR-014**: A página de valor DEVE expor dados estruturados (JSON-LD) de trilha de navegação (Home → InterasisAI Connect), refletindo a hierarquia real do site.
- **FR-015**: A imagem usada nos metadados de Open Graph/compartilhamento da página DEVE ser específica do InterasisAI Connect; enquanto uma imagem definitiva não for fornecida pelo solicitante, o sistema DEVE usar a imagem de capa genérica do site como fallback (nunca deixar o campo de imagem vazio).

### Key Entities

- **Case de Portfólio (Card)**: Representa um produto exibido na seção de portfólio da landing page; ganha um novo campo de "texto de impacto de negócio" e um link para a Página de Valor, além dos campos já existentes (título, categoria, descrição, destaques, tags, status, ação principal).
- **Página de Valor (Saiba mais)**: Página própria e indexável do site, com metadados dedicados (título, descrição, Open Graph) e conteúdo estruturado em blocos (comparação, explicação da arquitetura, tabela comparativa, passos do processo), associada ao case de portfólio do InterasisAI Connect.
- **Cenário por Vertical**: Conjunto de textos (pergunta do cliente, resposta do atendimento comum, resposta do InterasisAI Connect, veredito de cada lado) por segmento de negócio (Buffet e eventos, Clínica, Escola, Imobiliária, RH), usado dentro da Página de Valor.
- **Dados Estruturados da Página**: Representação em JSON-LD do serviço (InterasisAI Connect) e da trilha de navegação (breadcrumb) da página, consumida por buscadores — não visível diretamente ao usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um avaliador de negócio sem conhecimento técnico consegue, em até 15 segundos de leitura do card (título + texto de impacto), descrever com as próprias palavras que o produto tem uma arquitetura por trás e não é "só um chatbot".
- **SC-002**: 100% dos visitantes que clicam em "Saiba mais" chegam à página de valor com sucesso, e 100% dos acessos diretos à URL da página (sem passar pela landing page) também funcionam.
- **SC-003**: Um visitante consegue alternar entre as 5 verticais dentro da página e perceber a mudança de conteúdo em 100% das trocas de aba, sem erros visuais ou conteúdo em branco.
- **SC-004**: O card e a página de valor funcionam sem quebra de layout nas 3 larguras de tela de referência do site (mobile, tablet, desktop) e nos 3 idiomas suportados.
- **SC-005**: Nenhuma regressão no fluxo atual — o botão "Testar Assistente ao Vivo" continua abrindo o widget de chat normalmente na landing page e também dentro da nova página de valor.
- **SC-006**: Ao colar a URL da página de valor em uma ferramenta de prévia de link (ex.: depurador de Open Graph), o título, a descrição e a imagem exibidos são específicos do InterasisAI Connect.
- **SC-007**: Os dados estruturados da página (serviço e trilha de navegação) validam sem erros em uma ferramenta pública de teste de dados estruturados.

## Assumptions

- O nome "InterasisAI Connect" é um nome de marca e permanece igual (não traduzido) nos 3 idiomas; apenas o texto de impacto, a categoria e o conteúdo da página são traduzidos.
- A página de valor segue o mesmo padrão das páginas institucionais já existentes (`sobre`, `termos`, `politica-de-privacidade`): mesmo slug nos 3 idiomas (só muda o prefixo de locale), metadados via `generateMetadata`, listagem em `sitemap.ts`, e reaproveita o layout raiz do site (cabeçalho, rodapé, widget de chat).
- A página é implementada com os componentes visuais e o design system já usados no restante do site (não é um `iframe` ou cópia estática do arquivo HTML de referência).
- O CTA final dentro da página de valor reaproveita o mecanismo de conversão já existente no card (abrir o widget de chat via "Testar Assistente ao Vivo"), em vez de um link externo de WhatsApp com dados de contato fixos, mantendo o visitante dentro da experiência do site.
- As 5 verticais e os cenários de conversa do material de referência (`apresentacao-interasisconnect.html`) servem de base de conteúdo e tom, mas os textos serão adaptados para uso público (sem placeholders de apresentação individual, como nome de cliente ou data de envio).
- O texto de impacto de negócio do card é um conteúdo novo e curto (headline), não uma reescrita da descrição técnica já existente, que permanece como está.
- Escopo confirmado com o solicitante: rebranding e página de valor valem para os 3 idiomas do site desde o lançamento; as 5 verticais do material de referência são todas mantidas.
- Abordagem híbrida (modal ao navegar internamente + página cheia ao acessar o link direto, via *intercepting routes* do Next.js) foi considerada e descartada por complexidade adicional não justificada nesta etapa; pode ser revisitada depois se o solicitante priorizar a elegância da modal para navegação interna.
- Reforço de SEO confirmado com o solicitante em 2026-08-30: a página deve incluir dados estruturados (JSON-LD) de serviço e de trilha de navegação, além de uma imagem de Open Graph dedicada.
- A imagem de Open Graph dedicada é um ativo de design que depende de entrega externa (não gerável por código); até lá, o fallback é a imagem de capa genérica já usada pela home (`/images/interasisai_coverpage.png`).
