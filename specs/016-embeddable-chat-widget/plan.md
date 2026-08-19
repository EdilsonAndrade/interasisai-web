# Implementation Plan: Widget de Chat Embutível para Clientes

**Branch**: `016-embeddable-chat-widget` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-embeddable-chat-widget/spec.md`

## Summary

Hoje o chat com IA (`ChatWidget.tsx`) é um componente React interno, carregado apenas dentro do próprio site `interasisai-web`, fixo a um único tenant via `NEXT_PUBLIC_TENANT_ID`. Esta feature cria um **artefato distribuível** — um script `<script>` único por tenant — que qualquer cliente cola em seu próprio site para carregar o mesmo assistente de IA, sem qualquer configuração adicional da parte dele.

A abordagem técnica central: (1) um **bundle standalone** (TypeScript vanilla, sem React/Next runtime, isolado em Shadow DOM) reaproveita as funções já tenant-agnósticas `initializeChatSession(tenantId)` e `sendChatMessage(request, accessToken)` de `pythonBackend.ts`; (2) uma **rota dinâmica Next.js** (`/widget/[tenantId]`) serve esse bundle já injetado com o `tenantId`, permitindo que o snippet final seja uma única linha, sem parâmetros a preencher; (3) a validação de domínio autorizado continua 100% do lado da API Python existente — o navegador envia o header `Origin` real do site do cliente em toda chamada `fetch` cross-origin, e esse header não é falsificável via JavaScript, então nenhuma lógica de segurança nova precisa ser criada neste repositório; (4) o painel admin de tenants ganha uma ação para exibir/copiar o snippet pronto, calculado inteiramente a partir do `tenant.id` já existente.

## Technical Context

**Language/Version**: TypeScript 5 (mesmo do restante do repositório)
**Primary Dependencies**: Next.js 16 (App Router) para o site/admin existente; o bundle do widget embutível usa **apenas TypeScript vanilla + DOM APIs nativas** (sem React/ReactDOM) para manter o tamanho mínimo em sites de terceiros; `esbuild` como bundler dedicado do widget (novo dev dependency)
**Storage**: N/A neste repositório — dados de tenant, domínios autorizados e conhecimento continuam no backend Python externo (fora deste repo)
**Testing**: Jest (já configurado) para toda a lógica nova; React Testing Library para a UI admin (snippet/copiar); Jest + jsdom (sem RTL) para os módulos vanilla do widget, já que não há componentes React ali
**Target Platform**: Navegadores modernos evergreen, executando dentro de sites de terceiros arbitrários (não pode presumir nenhum framework presente na página hospedeira)
**Project Type**: Web application existente (Next.js) + um novo artefato estático distribuível (bundle do widget) servido pela mesma origem via Route Handler dinâmico
**Performance Goals**: o script carregado pelo site do cliente deve ser pequeno (meta: < 20KB gzip para o loader completo) e assíncrono, sem bloquear o carregamento da página hospedeira (`async`, sem operações síncronas de layout)
**Constraints**: zero conflito de CSS/JS com o site hospedeiro (isolamento via Shadow DOM); zero configuração exigida do cliente além de colar o `<script>`; nenhuma chamada de rede sensível deve depender de segredos expostos no bundle público
**Scale/Scope**: dezenas a centenas de tenants, cada um com snippet independente; o mesmo snippet deve funcionar em qualquer página do site do cliente sem estado compartilhado entre domínios (cada origem tem seu próprio `localStorage`, isolando conversas por site automaticamente)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom of section.*

O bundle do widget embutível é um artefato distribuído a terceiros, fora do runtime React/Tailwind desta aplicação. Os princípios da constituição foram avaliados individualmente:

| Princípio | Aplica-se à área admin (Next.js) | Aplica-se ao bundle do widget (standalone) |
|---|---|---|
| I. Separação Hooks/UI | ✅ Sim — nova ação de snippet usa hook dedicado (`useTenantSnippet.ts`) | ⚠️ Adaptado — sem React, mas módulos separados por responsabilidade (rede / estado / render) preservam a intenção do princípio |
| II. Context API | ✅ Sim, sem novo estado global necessário | N/A — não há árvore de componentes React no bundle |
| III. DRY/Componentização | ✅ Sim — reaproveita `initializeChatSession`/`sendChatMessage` existentes | ✅ Sim — mesma lógica de rede reaproveitada, sem duplicar contrato de API |
| IV. Testes unitários | ✅ Sim — hook e componente de snippet testados (Jest + RTL) | ✅ Sim — módulos testados com Jest + jsdom |
| V. TypeScript estrito | ✅ Sim | ✅ Sim — sem `any` em nenhum módulo novo |
| VI. Identidade visual (Tailwind) | ✅ Sim, tela admin usa Tailwind normalmente | ❌ **Não pode usar Tailwind literalmente** — ver Complexity Tracking |
| VII. SEO/Semântica/Acessibilidade | ✅ Sim — nenhuma rota pública nova indexável | ⚠️ Parcial — bolha/painel usam ARIA equivalente ao `ChatWidget.tsx` (labels, roles), mas não passa por `next/dynamic` pois não é uma rota Next.js |
| VIII. Segurança | ✅ Sim — nenhum segredo novo exposto | ✅ Sim — nenhum segredo embutido no bundle público; validação de domínio permanece na API externa |

**Resultado**: PASS, com um desvio justificado (Tailwind no bundle standalone) documentado em Complexity Tracking.

**Re-checagem pós-design (Phase 1)**: `research.md` e `data-model.md` não introduziram nenhuma violação adicional além das já registradas em Complexity Tracking (ausência de Tailwind e de React no bundle standalone). Nenhuma nova exceção necessária.

## Project Structure

### Documentation (this feature)

```text
specs/016-embeddable-chat-widget/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/             # Phase 1 output
│   ├── widget-loader-contract.md
│   └── tenant-widget-config-api.md
└── tasks.md               # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── widget/
│   │   └── [tenantId]/
│   │       └── route.ts          # NEW — Route Handler que serve o bundle já injetado com o tenantId
│   └── [locale]/...               # existente, inalterado
├── widget/                        # NEW — código-fonte do bundle standalone (sem React)
│   ├── index.ts                   # ponto de entrada: lê tenantId, monta Shadow DOM
│   ├── network.ts                 # reexporta/adapta initializeChatSession + sendChatMessage
│   ├── state.ts                   # módulo de estado da conversa (sem Context API — não é React)
│   ├── render.ts                  # criação/atualização do DOM dentro do Shadow Root
│   └── styles.ts                  # CSS-in-JS mínimo injetado no Shadow Root (tokens replicados do design system)
├── components/admin/tenants/
│   ├── TenantSnippet.tsx          # NEW — exibe/copia o snippet pronto a partir de tenant.id
│   └── ...                        # TenantForm.tsx, TenantDetails.tsx (existentes, ganham a nova ação)
├── hooks/
│   └── useTenantSnippet.ts        # NEW — computa a string do snippet e expõe ação de copiar
├── services/
│   └── pythonBackend.ts           # existente — nenhuma mudança de contrato necessária
└── ...

scripts/
└── build-widget.mjs                # NEW — build esbuild dedicado do bundle em src/widget/

public/
└── widget/
    └── widget.bundle.js            # output do build:widget, lido pelo Route Handler em runtime
```

**Structure Decision**: Reaproveita a aplicação Next.js existente para tudo que é interno (admin, geração do snippet), e isola o código destinado a terceiros em `src/widget/` com build próprio (`esbuild`), nunca importado pelo bundle principal do Next.js. Um Route Handler dinâmico (`src/app/widget/[tenantId]/route.ts`) concatena o bundle compilado com uma pequena injeção de configuração (`tenantId`, e futuramente aparência), evitando gerar um arquivo estático por tenant.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Bundle do widget não usa Tailwind (Princípio VI) | O compilador Tailwind (JIT) depende do contexto de build desta aplicação Next.js; um script servido a sites de terceiros não pode carregar o pipeline de build nem o CSS global desta app | Tentar embutir o Tailwind compilado geraria um CSS grande e genérico (não teria como fazer "purge" das classes realmente usadas no widget) e ainda arriscaria vazar estilos para o site do cliente fora do Shadow Root — CSS-in-JS mínimo, escopado ao Shadow Root, replicando os tokens da tabela "Visual Identity Standards" é a alternativa mais simples que preserva a identidade visual sem esses riscos |
| Bundle do widget não usa React (Princípios I/II) | React + ReactDOM adicionariam ~140KB ao script embutido em site de terceiros, indo contra a meta de performance (SC-003, carregamento rápido) e o requisito de não interferir no site hospedeiro | Reaproveitar `ChatWidget.tsx` diretamente exigiria enviar o runtime React completo a cada visitante de cada cliente — peso desproporcional para uma bolha de chat; módulos vanilla organizados por responsabilidade (rede/estado/render) mantêm a mesma separação de preocupações em espírito |
