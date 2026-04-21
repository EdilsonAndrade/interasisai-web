# Contract: Landing Page Home Verification

## Purpose

Definir os critérios verificáveis para considerar a implementação da Home (EDI-17) concluída em conformidade com spec e constitution.

## Scope

- Página principal em `src/app/page.tsx`
- Testes da página em `src/app/page.test.tsx`
- Sem alterações em `src/app/layout.tsx`

## Contract Conditions

- A home deve exibir uma Hero Section com H1, subtítulo e dois CTAs.
- O texto "Inteligência Artificial" deve possuir destaque visual de marca no título principal.
- O CTA primário deve exibir estilo de destaque e feedback de hover.
- O CTA secundário deve exibir estilo outline/glassmorphism e feedback de hover.
- A seção de proposta de valor deve conter exatamente 3 cards.
- Os 3 serviços obrigatórios devem aparecer com ícone + título + descrição:
  - Engenharia de Software
  - Integração de IA
  - Automação de Processos
- Os blocos de conteúdo devem usar o componente `<FadeIn>` para revelação.
- O layout deve ser responsivo com colapso para coluna única em mobile.
- A implementação deve manter semântica mínima de SEO/a11y:
  - `main` presente
  - `h1` único
  - heading subsequente em `h2` para seção de serviços
- A feature não pode modificar o `layout.tsx`.

## Verification Checklist

- [x] `src/app/page.tsx` contém Hero com H1, subtítulo e 2 CTAs.
- [x] CTA primário: label `Explorar Soluções`.
- [x] CTA secundário: label `Conhecer Portfólio`.
- [x] Seção de serviços renderiza 3 cards obrigatórios.
- [x] `FeatureCard` é reutilizado para evitar duplicação de markup.
- [x] Uso de `<FadeIn>` aplicado nos blocos principais.
- [x] Estrutura responsiva definida para `grid-cols-1 md:grid-cols-3`.
- [x] `src/app/layout.tsx` permanece sem alterações para esta feature.
- [x] `src/app/page.test.tsx` cobre conteúdo crítico e estrutura da página.
- [x] `npm test` executa com sucesso.

## Failure Conditions

- Falta de qualquer um dos 3 serviços obrigatórios.
- Ausência de um dos CTAs obrigatórios.
- Estrutura não responsiva ou quebrada em viewport mobile.
- Ausência de `<FadeIn>` nos blocos principais da home.
- Alterações em `layout.tsx` introduzidas por esta feature.
- Testes da página inexistentes ou falhando.
