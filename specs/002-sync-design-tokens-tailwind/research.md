# Research: Sincronizar Design Tokens da Skill com Tailwind

## Decision 1: Usar a skill `.ai/skills/deisgn-token/` como fonte oficial da direção visual

- **Decision**: Tratar o conteúdo de `.ai/skills/deisgn-token/SKILL.MD` e a imagem `examples/example-page.webp` como a origem oficial dos tokens, da hierarquia visual e das regras de composição desta feature.
- **Rationale**: O spec exige uma fonte de verdade auditável, e o repositório já contém um artefato explícito com tokens, regras de composição e referência visual suficiente para orientar a sincronização.
- **Alternatives considered**:
  - Inferir a direção visual apenas da implementação atual do frontend: rejeitado porque o projeto ainda não expõe um tema semântico estendido.
  - Criar uma nova definição visual separada no plano: rejeitado porque introduziria uma segunda fonte de verdade.

## Decision 2: Sincronizar os tokens por nomes semânticos expostos no tema Tailwind

- **Decision**: Converter os grupos da skill em tokens semânticos oficiais do projeto e expô-los no tema Tailwind, cobrindo marca, superfícies, texto, borda, forma e profundidade.
- **Rationale**: O stack atual já usa Tailwind 3 com `tailwind.config.ts`, e a feature precisa permitir uso direto pela equipe sem recriação manual de valores ou convenções paralelas.
- **Alternatives considered**:
  - Usar apenas classes utilitárias com hexadecimais arbitrários: rejeitado por violar a intenção da spec e fragilizar manutenção.
  - Manter tokens apenas em documento sem integração com o tema: rejeitado por não resolver o problema operacional do frontend.

## Decision 3: Apoiar a sincronização com CSS variables globais e aliases no Tailwind

- **Decision**: Centralizar os valores em `src/theme/design-tokens.ts`, propagar CSS custom properties em `src/app/layout.tsx` por `rootThemeStyle` e expor aliases semânticos no `tailwind.config.ts`.
- **Rationale**: Essa abordagem preserva uma única fonte de verdade em TypeScript, mantém o custo em tempo de build e evita duplicação manual de valores em `globals.css`.
- **Alternatives considered**:
  - Escrever todos os valores apenas em `tailwind.config.ts`: rejeitado por dificultar governança e consumo global de runtime.
  - Escrever todos os valores apenas em `globals.css`: rejeitado por perder ergonomia de uso via utilitários Tailwind.

## Decision 4: Registrar `deisgn-token` como inconsistência documental, não como alvo desta feature

- **Decision**: Preservar a pasta `.ai/skills/deisgn-token/` como está e documentar explicitamente a inconsistência em relação ao nome esperado `design-token`.
- **Rationale**: A spec pede que a inconsistência seja tratada como fato relevante para manutenção, mas também delimita que a feature não cobre renomeação estrutural fora do fluxo normal.
- **Alternatives considered**:
  - Renomear a pasta imediatamente: rejeitado por ampliar escopo e introduzir risco estrutural não pedido.
  - Ignorar a inconsistência: rejeitado por deixar ambiguidade para futuras entregas.

## Decision 5: Validar a sincronização por contrato e por referência visual objetiva

- **Decision**: Definir um contrato de verificação que cobre presença dos grupos semânticos essenciais, estabilidade do mapeamento e aderência visual guiada pela imagem de referência.
- **Rationale**: A feature depende tanto de cobertura técnica do tema quanto de consistência perceptível da hierarquia visual. O contrato reduz subjetividade e ajuda a decidir quando a sincronização está incompleta.
- **Alternatives considered**:
  - Validar apenas por inspeção manual informal: rejeitado por falta de reprodutibilidade.
  - Validar apenas por testes técnicos do config: rejeitado por não cobrir a linguagem visual descrita na skill.

## Implementation Outcome

- O projeto passou a expor o tema oficial por `src/theme/design-tokens.ts` e `src/theme/index.ts`.
- `tailwind.config.ts` agora consome `tailwindThemeExtension` com `darkMode: 'class'`.
- `src/app/layout.tsx` injeta os CSS custom properties via `rootThemeStyle`.
- `src/app/globals.css` ficou responsável apenas por base global, gradientes e utilitários conectados aos tokens.
- `src/app/page.tsx` virou a tela de referência do tema, com hero azul dominante, superfícies claras e roxo restrito a apoio visual.
