# Feature Specification: Landing Page Principal (Home) com Foco em Conversão

**Feature Branch**: `004-landing-page-home`  
**Created**: 2026-04-21  
**Status**: Draft  
**Linear Ticket**: EDI-17  
**Input**: Criar a Landing Page Principal (Home) com foco em Conversão

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante Descobre o Valor da Empresa (Priority: P1)

Um visitante chega à página inicial da Interasis AI sem conhecer a empresa. Ele precisa entender rapidamente o que a empresa faz, qual é o seu diferencial e sentir confiança para dar o próximo passo.

**Why this priority**: É o ponto de entrada principal de conversão. Sem uma proposta de valor clara e atraente, todos os outros esforços de marketing são ineficazes.

**Independent Test**: Pode ser testado apresentando a página a um usuário que não conhece a empresa e verificando se ele consegue explicar o que a Interasis AI faz em menos de 30 segundos.

**Acceptance Scenarios**:

1. **Given** o visitante acessa a página inicial, **When** a página carrega, **Then** ele vê imediatamente um título claro que comunica o serviço principal da empresa com destaque visual no termo principal.
2. **Given** o visitante lê o título e o subtítulo, **When** ele conclui a leitura, **Then** ele compreende que a empresa oferece soluções de IA e Engenharia de Software personalizadas.
3. **Given** o visitante está na Hero Section, **When** os elementos da página carregam, **Then** eles aparecem com uma animação suave de entrada que não atrasa a percepção do conteúdo.

---

### User Story 2 - Visitante Explora os Serviços Oferecidos (Priority: P2)

Após ler a proposta de valor, o visitante quer entender quais serviços concretos a empresa oferece antes de decidir entrar em contato.

**Why this priority**: A grade de serviços é o segundo passo da jornada de conversão. Visitantes qualificados precisam reconhecer sua necessidade nas ofertas antes de agir.

**Independent Test**: Pode ser testado verificando se um visitante consegue identificar os três pilares de serviço da empresa ao rolar a página para baixo.

**Acceptance Scenarios**:

1. **Given** o visitante rola a página abaixo da Hero Section, **When** ele vê a seção de proposta de valor, **Then** ele encontra três cards distintos, cada um representando uma área de atuação da empresa.
2. **Given** o visitante está em um dispositivo móvel, **When** ele visualiza a seção de serviços, **Then** os cards são exibidos em coluna única, sem sobreposição ou corte de conteúdo.
3. **Given** o visitante está em um dispositivo desktop, **When** ele visualiza a seção de serviços, **Then** os três cards são exibidos lado a lado em uma grade de três colunas.

---

### User Story 3 - Visitante Toma Ação (CTA) (Priority: P3)

O visitante convencido pelo conteúdo quer dar o próximo passo e clica em um dos botões de chamada para ação disponíveis na Hero Section.

**Why this priority**: Os CTAs convertem interesse em ação. Embora dependam das outras histórias, são o resultado esperado da experiência da página.

**Independent Test**: Pode ser testado verificando se os dois botões de CTA estão visíveis, acessíveis e respondem visualmente ao hover na Hero Section.

**Acceptance Scenarios**:

1. **Given** o visitante está na Hero Section, **When** ele visualiza os CTAs, **Then** ele vê dois botões distintos — um primário (destaque) e um secundário (estilo fantasma) — com aparência e hierarquia visual claras.
2. **Given** o visitante passa o cursor sobre o botão primário, **When** o hover é ativado, **Then** o botão exibe uma mudança visual de cor que confirma a interatividade.
3. **Given** o visitante passa o cursor sobre o botão secundário, **When** o hover é ativado, **Then** o botão exibe feedback visual coerente com seu estilo outline/glassmorphism.

---

### Edge Cases

- O que acontece se as animações de entrada forem desabilitadas (preferência de acessibilidade `prefers-reduced-motion`)?
- Como a página se comporta em resoluções de tela muito pequenas (< 320px)?
- O que acontece se os ícones da biblioteca de ícones não carregarem?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página inicial DEVE exibir uma Hero Section com altura mínima que ocupe a maior parte da viewport, contendo título principal, subtítulo e dois botões de CTA.
- **FR-002**: O título principal (H1) DEVE destacar visualmente os termos "Inteligência Artificial" utilizando a cor de marca primária, enquanto o restante do texto usa a cor padrão de texto principal.
- **FR-003**: O subtítulo DEVE comunicar os benefícios concretos dos serviços (automação, escala, solução de problemas complexos) usando a cor de texto secundária/muted.
- **FR-004**: O CTA primário ("Explorar Soluções") DEVE ter fundo na cor de marca primária e exibir mudança visual no hover.
- **FR-005**: O CTA secundário ("Conhecer Portfólio") DEVE ter estilo outline/fantasma com efeito glassmorphism e exibir feedback visual no hover.
- **FR-006**: A página DEVE exibir uma seção de proposta de valor abaixo da Hero com exatamente três cards de serviço.
- **FR-007**: Cada card de serviço DEVE conter um ícone representativo, um título e uma descrição curta do serviço.
- **FR-008**: Os três serviços apresentados DEVEM ser: (1) Engenharia de Software, (2) Integração de IA, (3) Automação de Processos.
- **FR-009**: Os cards de serviço DEVEM ter visual com efeito glassmorphism, consistente com a identidade visual Dark/Tech do projeto.
- **FR-010**: Todos os blocos de conteúdo da página DEVEM ser revelados com a animação de entrada `<FadeIn>` já existente no projeto.
- **FR-011**: A página DEVE ser completamente responsiva: a grade de três colunas de serviços DEVE colapsar para uma única coluna em dispositivos móveis.
- **FR-012**: A página NÃO DEVE modificar o `layout.tsx`; o Header e Footer já providos pelo layout devem envolver o conteúdo da página automaticamente.
- **FR-013**: A implementação DEVE incluir testes unitários que cubram os componentes criados, e todos os testes DEVEM passar.

### Key Entities

- **Hero Section**: Seção principal de impacto com título, subtítulo e CTAs. Ocupa a maior parte da viewport inicial.
- **Feature Card**: Componente de card reutilizável com ícone, título e descrição, usando efeito glassmorphism. Representa um pilar de serviço da empresa.
- **Call to Action (CTA)**: Botão de conversão. Existe em dois estilos: primário (destaque) e secundário (outline/fantasma).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante que nunca ouviu falar da empresa consegue descrever o serviço principal em até 30 segundos após o carregamento da página.
- **SC-002**: A página é completamente funcional e visualmente correta em qualquer largura de tela entre 320px e 1920px.
- **SC-003**: 100% dos testes unitários dos componentes da página passam sem erros.
- **SC-004**: Os elementos da página aparecem com animação de entrada em todos os blocos de conteúdo, sem saltos ou flickering visível.
- **SC-005**: Os dois CTAs da Hero Section são visíveis e acessíveis sem necessidade de scroll em telas com altura mínima de 600px.
- **SC-006**: A hierarquia visual entre o CTA primário e o secundário é perceptível para 100% dos revisores de design que avaliem a página.

## Assumptions

- O componente `<FadeIn>` já existe e está funcional no projeto (criado na Task anterior da trilha).
- Os Design Tokens de cores (`brand-primary`, `brand-hover`, `text-main`, `text-muted`, `bg-surface`) já estão definidos e sincronizados com o Tailwind CSS.
- O `layout.tsx` já inclui o `<Header>` e o `<Footer>`, portanto a página (`page.tsx`) não precisa gerenciá-los.
- A biblioteca de ícones `lucide-react` já está disponível no projeto.
- O suporte a `prefers-reduced-motion` seguirá o comportamento padrão do componente `<FadeIn>` existente (sem alterações específicas para esta tarefa).
- Não há rotas de navegação reais ainda associadas aos botões de CTA; links podem apontar para `#` ou seções ainda não existentes.
- Testes unitários seguem os padrões e configurações já estabelecidos no projeto (Jest + React Testing Library).
