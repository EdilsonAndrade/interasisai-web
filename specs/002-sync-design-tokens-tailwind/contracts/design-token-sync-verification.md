# Contract: Design Token Sync Verification

## Purpose

Definir o contrato objetivo de verificação da sincronização entre a skill de design token e o tema visual oficial do projeto.

## Implemented Source Of Truth

- Fonte oficial da direção visual: `.ai/skills/deisgn-token/SKILL.MD`
- Evidência visual oficial: `.ai/skills/deisgn-token/examples/example-page.webp`
- Módulo canônico de tokens do projeto: `src/theme/design-tokens.ts`
- Exportação pública do tema compartilhado: `src/theme/index.ts`
- Consumo no tema Tailwind: `tailwind.config.ts`
- Consumo global de runtime: `src/app/layout.tsx` via `rootThemeStyle`
- Consumo visual de referência: `src/app/page.tsx`

## Required Conditions

- A skill em `.ai/skills/deisgn-token/` é tratada como fonte oficial da direção visual desta feature.
- O tema oficial do projeto expõe correspondência clara para os grupos semânticos de marca, superfícies, texto, borda, forma e profundidade.
- Existe um mapa explícito entre os nomes da skill e os nomes adotados pelo tema do projeto em `tokenCorrespondence`.
- O tema preserva azul institucional como cor principal e não promove o roxo escuro a cor dominante.
- A documentação da feature registra explicitamente a inconsistência de nomenclatura entre `design-token` e `deisgn-token`.
- Qualquer token essencial ausente ou sem equivalência clara é marcado como lacuna e impede considerar a sincronização completa.
- O slice técnico escolhido para expor os tokens possui validação automatizada apropriada.

## Verification Checklist

- [x] `designTokens` cobre marca, superfícies, texto, borda, forma e profundidade.
- [x] `tailwindThemeExtension` expõe classes semânticas como `bg-brand-primary`, `bg-surface-page`, `text-text-strong` e `bg-accent-campaign`.
- [x] `tailwind.config.ts` usa `darkMode: 'class'` e importa a extensão oficial do tema.
- [x] `src/app/layout.tsx` injeta os CSS custom properties a partir de `rootThemeStyle`.
- [x] `src/app/globals.css` conecta base global, gradientes e utilitários aos tokens oficiais.
- [x] `src/app/page.tsx` usa apenas classes semânticas derivadas do tema para hero, CTAs e superfícies principais.
- [x] `src/theme/design-tokens.test.ts` valida grupos canônicos, exposição no Tailwind e metadados de governança.
- [x] `src/app/page.test.tsx` valida a tela de referência e os ganchos semânticos do tema.
- [x] O typo `deisgn-token` foi documentado como fato de governança, sem renomeação estrutural.

## Verification Methods

- Revisão do conteúdo da skill e da referência visual `example-page.webp`.
- Inspeção do ponto oficial de configuração do tema no projeto.
- Conferência do mapa de correspondência documentado nesta feature.
- Execução de `npm test -- --runTestsByPath src/theme/design-tokens.test.ts src/app/page.test.tsx` para validar o slice tocado.
- Execução de `npm test` para validar a suíte configurada no repositório.
- Execução de `npm run build` para validar compatibilidade do tema com a aplicação.

## Failure Conditions

- O projeto passa a usar valores visuais arbitrários sem vínculo com a skill.
- Há grupos semânticos essenciais da spec sem representação clara no tema oficial.
- O roxo escuro assume papel dominante incompatível com a referência.
- O typo `deisgn-token` não é documentado e gera ambiguidade operacional.
- A sincronização depende de convenção paralela fora do tema oficial do projeto.
