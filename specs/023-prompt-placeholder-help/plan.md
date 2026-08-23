# Implementation Plan: Ajuda de placeholders obrigatórios ao cadastrar prompt

**Branch**: `edilsonaandrade/edi-50-frontend-exibir-placeholders-obrigatorios-e-exemplo-ao` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/023-prompt-placeholder-help/spec.md`
**Ticket**: [EDI-50](https://linear.app/edilsonandrade/issue/EDI-50/frontend-exibir-placeholders-obrigatorios-e-exemplo-ao)

## Summary

Seção de ajuda somente leitura, sempre visível, exibida em `PromptFormModal.tsx` logo abaixo do campo de conteúdo (`MarkdownEditorCustom`), listando os placeholders aceitos pelo `node_type` selecionado (`operational`, `institutional` ou `chitchat`), quais são obrigatórios, e um exemplo de texto bem formado. Os dados por `node_type` são um mapa estático no frontend (sem chamada de backend). A seção reage em tempo real à troca do campo "Nó de Destino" via `watch("node_type")`, já disponível no formulário (`react-hook-form`).

**Abordagem técnica**: nenhuma dependência nova. Um arquivo de dados estático (`promptPlaceholderHelp.ts`, mesmo padrão de `onboardingSteps.ts` da feature 022) define, por `node_type`, a lista de placeholders (nome + obrigatoriedade) e o texto de exemplo. Um componente puramente apresentacional (`PromptPlaceholderHelp.tsx`) recebe o `node_type` via prop e renderiza a lista + o bloco de exemplo (`<pre>`/`<code>`, sem `dangerouslySetInnerHTML`). Nenhum Context/hook novo é necessário — não há estado a persistir (a seção não compara com o texto digitado, decisão confirmada no spec).

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router)
**Primary Dependencies**: nenhuma dependência nova — `react-hook-form` (já em uso em `PromptFormModal.tsx`), Tailwind 3.4
**Storage**: nenhuma — dados estáticos no bundle do frontend, sem localStorage/backend
**Testing**: Jest 30 + React Testing Library 16, jsdom; `npm test`
**Target Platform**: navegadores modernos; área administrativa em `/[locale]/admin/prompt-manager`
**Project Type**: aplicação web (frontend puro; nenhuma mudança de API)
**Performance Goals**: nenhuma meta nova; componente estático, sem chamadas de rede
**Constraints**: sem `any`; sem `dangerouslySetInnerHTML` (texto de exemplo renderizado como texto puro em `<pre>`, não como Markdown); sem alterar comportamento de submit/validação do formulário (fora de escopo — EDI-51/EDI-52)
**Scale/Scope**: 1 arquivo de dados estático novo, 1 componente apresentacional novo, 1 componente existente alterado (`PromptFormModal.tsx`)

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.*

| # | Princípio | Como o plano atende | Status |
|---|---|---|---|
| I | Separação hook/UI | Não há lógica de negócio nem chamada de API — é um lookup síncrono em um mapa estático (mesmo padrão de `onboardingSteps.ts`, que também não é um hook). `PromptPlaceholderHelp.tsx` só recebe `nodeType` e renderiza. | ✅ |
| II | Estado via Context API | Não se aplica — nenhum estado novo é introduzido; `node_type` já vem do `react-hook-form` existente no próprio `PromptFormModal.tsx`. | ✅ |
| III | DRY / componentização | Um único componente `PromptPlaceholderHelp` cobre os 3 `node_type`, parametrizado pelos dados estáticos — nenhuma duplicação de JSX por tipo. | ✅ |
| IV | Testes (não negociável) | RTL para `PromptPlaceholderHelp` (lista e exemplo corretos por `node_type`, chitchat nunca mostra `{contexto_formatado}`/`{historico_texto}`); teste em `PromptFormModal.test.tsx` cobrindo a troca reativa ao mudar "Nó de Destino". AAA em todos. | ✅ |
| V | TypeScript & erros | `PromptPlaceholderHelpEntry`/mapa tipado por `NodeType` (já existente em `promptManager.types.ts`), sem `any`. Nenhuma chamada externa que possa falhar — não há tratamento de erro a fazer. | ✅ |
| VI | Identidade visual | Reaproveita classes Tailwind já usadas em `PromptFormModal.tsx` (`rounded-card`, `border-border-subtle`, `bg-surface-subtle`/`bg-surface-base`, `text-text-weak`/`text-text-strong`) — sem introduzir novo padrão visual. | ✅ |
| VII | SEO/semântica/a11y | Sem `page.tsx` novo. Seção usa `<section aria-label="Placeholders aceitos para este tipo de prompt">`, lista semântica (`<ul>`/`<li>`) e exemplo em `<pre><code>`. | ✅ |
| VIII | Segurança | Texto de exemplo renderizado como texto puro (`<pre>`), nunca via `dangerouslySetInnerHTML` ou Markdown — elimina qualquer risco de injeção mesmo sendo conteúdo estático confiável. | ✅ |

**Resultado**: nenhuma violação. Seção de Complexity Tracking omitida.

**Reavaliação pós-Fase 1**: sem mudanças — o design final (ver `data-model.md`) não introduziu estado, Context ou dependência nova além do previsto aqui.

## Project Structure

### Documentation (this feature)

```text
specs/023-prompt-placeholder-help/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0
├── data-model.md         # Fase 1
├── quickstart.md         # Fase 1
└── tasks.md              # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── components/admin/prompt-manager/
    ├── promptPlaceholderHelp.ts       # NOVO — mapa estático NodeType -> { placeholders[], example }
    ├── PromptPlaceholderHelp.tsx      # NOVO — componente apresentacional (lista + exemplo)
    └── PromptFormModal.tsx            # ALT — renderiza <PromptPlaceholderHelp nodeType={watch("node_type")} /> abaixo do MarkdownEditorCustom
```

Testes acompanham cada arquivo como `*.test.ts(x)` no mesmo diretório — convenção já vigente no repositório.

**Structure Decision**: tudo vive em `src/components/admin/prompt-manager/`, junto aos demais arquivos específicos do gerenciador de prompts (`types.ts`, `MarkdownEditorCustom.tsx`) — não há motivo para promover os dados de placeholders a `src/services/` ou `src/lib/`, já que não são reutilizados fora deste formulário e não têm lógica além do lookup.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Lista de placeholders ficar desalinhada do motor de renderização real (`prompts/load_prompt.py`) se o backend mudar os nomes/obrigatoriedade no futuro | Fora de escopo automatizar essa sincronia nesta versão (não há teste cross-repo); os nomes usados aqui foram confirmados no próprio ticket EDI-50 a partir do código do backend. Qualquer mudança futura nos placeholders exige atualizar `promptPlaceholderHelp.ts` manualmente — documentado como comentário no arquivo. |
| Seção sempre visível ocupar espaço vertical excessivo no modal (já `md:w-[60vw]`, com editor de 240px) | Lista compacta (não expande o exemplo em Markdown renderizado, só texto monoespaçado); revisão visual manual como parte do `quickstart.md`. |
| Exemplo do tipo institutional divergir do fallback real `prompts/institutional_prompt.md` do backend com o tempo | Exemplo copiado literalmente do bloco fornecido no ticket EDI-50 (mesma fonte usada pelo backend); não é gerado dinamicamente. |
