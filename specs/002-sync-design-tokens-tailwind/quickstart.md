# Quickstart: Sincronizar Design Tokens da Skill com Tailwind

## Prerequisites

- Node.js em versão compatível com Next.js 16
- npm disponível no ambiente
- Repositório já clonado e dependências instaladas
- Shell posicionado na raiz do repositório
- A skill `.ai/skills/deisgn-token/SKILL.MD` e a referência `examples/example-page.webp` disponíveis para consulta

## Implemented Flow

1. Revise a skill `.ai/skills/deisgn-token/SKILL.MD` e a imagem `example-page.webp` antes de alterar qualquer token.
2. Atualize `src/theme/design-tokens.ts`, que é a definição canônica do tema do projeto.
3. Preserve o mapeamento em `tokenCorrespondence` sempre que um token oficial for alterado, adicionado ou removido.
4. Reexporte a superfície pública do tema por `src/theme/index.ts` quando houver novos artefatos compartilhados.
5. Mantenha `tailwind.config.ts` consumindo apenas `tailwindThemeExtension` para evitar convenções paralelas.
6. Use `rootThemeStyle` em `src/app/layout.tsx` para propagar os CSS custom properties globais sem duplicar valores em CSS.
7. Ajuste `src/app/globals.css` apenas para composição global, gradientes e utilitários derivados dos tokens oficiais.
8. Consuma as classes semânticas no JSX, como `bg-brand-primary`, `bg-surface-page`, `text-text-strong` e `bg-accent-campaign`.
9. Documente o typo `deisgn-token` apenas como fato de governança. Não renomeie a pasta nesta feature.

## Maintenance Checklist

1. Atualize os testes do slice em `src/theme/design-tokens.test.ts` antes de finalizar mudanças no tema.
2. Ajuste `src/app/page.test.tsx` quando a composição visual oficial da tela de referência mudar.
3. Rode `npm test -- --runTestsByPath src/theme/design-tokens.test.ts src/app/page.test.tsx` para validar o slice tocado.
4. Rode `npm test` para confirmar que a suíte configurada continua íntegra.
5. Rode `npm run build` para confirmar que o tema continua compatível com a aplicação.
6. Revise `specs/002-sync-design-tokens-tailwind/contracts/design-token-sync-verification.md` para garantir que a auditoria documental continua coerente.

## Validation Checklist

1. A skill em `.ai/skills/deisgn-token/` continua tratada como fonte oficial da direção visual.
2. Todos os grupos semânticos essenciais da spec possuem correspondência clara no tema do projeto.
3. Não existe convenção paralela com nomes ambíguos ou valores arbitrários espalhados em componentes.
4. A inconsistência entre `design-token` e `deisgn-token` foi registrada na documentação da feature e nos metadados do módulo de tokens.
5. O tema preserva azul institucional como base, superfícies claras como apoio principal e roxo apenas como apoio visual.
6. O slice tocado possui cobertura automatizada adequada.
7. `npm run build` conclui sem erro.

## Expected Outcome

Ao final, o projeto mantém uma convenção visual oficial sincronizada com a skill, pronta para uso pela equipe no frontend com Tailwind, com critérios claros para detectar desvios, lacunas e futuras atualizações da fonte de verdade visual.
