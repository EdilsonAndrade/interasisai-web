---
name: design-token
description: "Extrai e define design tokens e direção visual a partir de referências visuais. Use quando: analisar screenshots, transformar identidade visual em tokens semânticos, orientar UI consistente, mapear paleta, tipografia, espaçamento e composição."
argument-hint: "Opcionalmente informe a referência visual, o formato de saída desejado e o contexto de uso, como Tailwind, CSS variables, JSON ou design system"
---

# Design Token Skill - Interasis AI

## Objetivo
Esta skill define a linguagem visual base para interfaces da Interasis AI a partir da referência em `examples/example-page.webp`. O estilo esperado é corporativo, tecnológico e comercial, com hero sections amplas, contraste forte entre azul institucional e superfícies claras, além de cards e blocos com leitura limpa.

## Referência Visual
A imagem de referência mostra estes padrões principais:

- fundo com gradiente azul profundo para azul vibrante
- blocos de conteúdo em branco ou cinza muito claro
- títulos escuros e pesados sobre superfícies claras
- CTAs em azul vivo com hover mais escuro
- uso pontual de roxo escuro como contraste de campanha
- composição com diagonais, recortes angulares e sobreposição de painéis
- cards claros com sombra suave e pouco ruído visual

## Tokens Base
Use sempre tokens semânticos. Evite espalhar hexadecimais arbitrários no JSX.

### Cores
- `brand.primary`: `#1D6FE8`
- `brand.primaryHover`: `#1557B7`
- `brand.primarySoft`: `#EAF3FF`
- `brand.secondary`: `#26214F`
- `brand.secondarySoft`: `#312A66`
- `surface.page`: `#F8FAFC`
- `surface.base`: `#FFFFFF`
- `surface.subtle`: `#EEF4FB`
- `surface.heroStart`: `#1E2A5A`
- `surface.heroEnd`: `#0D6EFD`
- `text.strong`: `#0F172A`
- `text.body`: `#475569`
- `text.inverse`: `#FFFFFF`
- `border.subtle`: `#DCE7F5`
- `accent.campaign`: `#2A225A`

### Tipografia
- Títulos principais: peso `700` ou `800`, tracking normal, contraste alto
- Subtítulos e texto institucional: peso `400` ou `500`, respiro generoso
- Hero title: grande, com quebra curta, foco em 2 ou 3 linhas
- Evite visual excessivamente editorial, futurista ou startup genérica

### Espaçamento e Forma
- Seções principais: `py-16` a `py-24`
- Container: largura confortável, com bastante respiro lateral
- Cards: `rounded-xl` ou `rounded-2xl`
- Botões: `rounded-md` ou `rounded-lg`
- Elementos especiais, como badge de destaque, podem usar forma circular se tiverem função clara de campanha
- Prefira blocos grandes e bem alinhados em vez de grids excessivamente densos

### Profundidade
- Cards claros: sombra leve a média
- Hero e áreas institucionais: profundidade por gradiente, sobreposição e contraste, não por sombra pesada
- Evite glassmorphism, blur excessivo ou neon

## Regras de Composição
- O layout deve parecer B2B premium, não landing page de startup genérica
- A primeira dobra deve ter mensagem forte, CTA claro e um bloco visual dominante
- Misture superfícies claras com áreas escuras para criar ritmo visual
- Quando usar imagens, combine com molduras geométricas, cortes diagonais ou blocos sobrepostos
- Ícones e mini-cards devem reforçar serviço, confiança e clareza operacional
- Use azul como cor principal e roxo escuro apenas como apoio visual, não como base inteira da interface

## Regras de Implementação
Ao gerar código React, Next.js, Tailwind ou tokens:

1. Não invente paletas fora desta direção visual sem justificativa explícita.
2. Não torne dark mode obrigatório por padrão; só implemente se o pedido exigir ou se o projeto já usar essa convenção.
3. Não use preto puro como cor dominante.
4. Não use `rounded-full` em tudo; reserve formas circulares para badges ou elementos de destaque específicos.
5. Não use gradientes fortes em todos os blocos; concentre o gradiente principalmente no hero ou em seções institucionais-chave.
6. Sempre prefira tokens semânticos como `primary`, `secondary`, `surface`, `text` e `border`.
7. Se precisar usar Tailwind direto antes de existir tema customizado, mantenha uma correspondência estável com esses tokens e documente o mapeamento.

## Saída Esperada da Skill
Quando esta skill for usada, a resposta deve:

- identificar os tokens principais da referência
- propor nomes semânticos consistentes
- sugerir mapeamento para Tailwind, CSS variables ou JSON de design tokens
- descrever a hierarquia visual antes de sair gerando classes
- preservar a linguagem visual corporativa azul, limpa e confiável

## Exemplo de Direção de Tema
```ts
export const designTokens = {
	color: {
		primary: '#1D6FE8',
		primaryHover: '#1557B7',
		secondary: '#26214F',
		page: '#F8FAFC',
		surface: '#FFFFFF',
		surfaceSubtle: '#EEF4FB',
		heroStart: '#1E2A5A',
		heroEnd: '#0D6EFD',
		textStrong: '#0F172A',
		textBody: '#475569',
		textInverse: '#FFFFFF',
		borderSubtle: '#DCE7F5',
	},
	radius: {
		card: '1rem',
		button: '0.75rem',
	},
	shadow: {
		card: '0 16px 40px rgba(15, 23, 42, 0.08)',
	},
};
```

## Observações
- A direção da versão anterior estava parcialmente certa no uso do azul corporativo.
- A versão anterior estava incompleta porque não refletia a composição da referência e forçava dark mode sem base visual.
- Se esta skill virar padrão estável do projeto, vale renomear a pasta para `.ai/skills/design-token/` para corrigir o typo em `deisgn-token`.