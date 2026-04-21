# Research: Landing Page Principal (Home) com Foco em Conversão

## Decision 1: Estruturar a página em Hero + Proposta de Valor

- **Decision**: Implementar a home em dois blocos principais: Hero Section de alto impacto e seção de proposta de valor com grid de serviços.
- **Rationale**: Esse fluxo cobre diretamente a jornada de conversão especificada: primeiro comunicar valor, depois detalhar serviços e então conduzir para ação (CTA).
- **Alternatives considered**:
  - Página de rolagem longa com múltiplas seções adicionais (depoimentos, FAQ, cases): rejeitado por ampliar escopo além do EDI-17.
  - Hero isolada sem seção de serviços: rejeitado por não atender FR-006 a FR-009.

## Decision 2: Reutilizar o componente `<FadeIn>` existente para animações

- **Decision**: Aplicar `<FadeIn>` nos blocos de conteúdo da home (hero e cards) sem criar um novo sistema de animação.
- **Rationale**: A especificação exige uso explícito do componente já criado anteriormente, e a constituição define Framer Motion como engine padrão com efeitos suaves.
- **Alternatives considered**:
  - Criar animações inline com `motion.*` em cada bloco: rejeitado por quebrar DRY e reduzir consistência.
  - Eliminar animações para simplificar entrega: rejeitado por violar FR-010 e critérios de aceite do ticket.

## Decision 3: Representar serviços com componente reutilizável `FeatureCard`

- **Decision**: Definir um componente interno `FeatureCard` para renderizar os 3 cards por dados (ícone, título e descrição).
- **Rationale**: Mantém componentização e reduz duplicação de markup, em conformidade com os princípios DRY e de reusabilidade.
- **Alternatives considered**:
  - Duplicar três blocos de JSX manualmente: rejeitado por aumentar custo de manutenção.
  - Extrair componente para outro arquivo agora: adiado para manter escopo enxuto desta feature.

## Decision 4: Priorizar semântica e acessibilidade desde a estrutura

- **Decision**: Usar `main` como contêiner principal, separar seções com `section` e manter ordem de headings (`h1` na hero; `h2` na seção de serviços).
- **Rationale**: A constituição exige SEO e semântica desde o primeiro componente; isso também torna os testes de acessibilidade mais previsíveis.
- **Alternatives considered**:
  - Estrutura baseada apenas em `div`: rejeitado por violar as regras constitucionais.
  - Adiar semântica para etapa posterior: rejeitado por risco de retrabalho e quebra de gate.

## Decision 5: Validar comportamento por testes orientados ao usuário

- **Decision**: Atualizar `src/app/page.test.tsx` para validar presença de texto principal, CTAs e cards de serviço por queries acessíveis.
- **Rationale**: Cumpre a exigência constitucional de testes de interação/semântica e reduz risco de regressão visual funcional.
- **Alternatives considered**:
  - Testar classes CSS específicas: rejeitado por acoplamento excessivo à implementação.
  - Não criar novos testes por ser página estática: rejeitado por violar FR-013.

## Decision 6: Manter links de CTA como placeholder controlado

- **Decision**: Manter CTAs com destino seguro de placeholder (`#`) até definição de rotas finais de negócio.
- **Rationale**: A própria spec define que rotas finais ainda não existem; isso preserva escopo e evita navegação quebrada.
- **Alternatives considered**:
  - Criar rotas temporárias artificiais: rejeitado por ampliar escopo funcional sem requisito.
  - Remover `href` dos CTAs: rejeitado por reduzir acessibilidade e comportamento esperado de botão de navegação.
