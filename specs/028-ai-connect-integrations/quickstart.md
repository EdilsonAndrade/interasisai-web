# Quickstart — InterasisAI Connect: Posicionamento de Integrações e Expansibilidade

**Feature**: `specs/028-ai-connect-integrations`

## Rodar localmente

```bash
npm run dev        # Next.js dev server (turbopack)
```

Verificação manual:

1. **Card** — home (`/pt-BR`, `/en`, `/es`): o card do InterasisAI Connect exibe o novo texto de impacto sobre integrações/expansibilidade, mantém a menção ao agendamento e lista 5 highlights (o novo sobre integração).
2. **Página Saiba Mais** — `/pt-BR/interasisai-connect` (e `/en`, `/es`): a nova seção de integrações aparece após a seção de arquitetura, com título, texto de escopo fechado e o diagrama animado (setas fluindo do núcleo para CRM, Base de dados, API, MCP, Sistemas de RH, Outras).
3. **Acessibilidade** — no DevTools: ativar emulation de `prefers-reduced-motion: reduce` e confirmar que o diagrama fica estático com todos os rótulos; inspecionar `role="img"` + `aria-label` e a lista `sr-only` no DOM.
4. **Responsivo** — em viewport mobile: diagrama em grade sem rolagem horizontal, rótulos legíveis.
5. **Sem regressão** — abas de vertical, tabela comparativa e "Testar Assistente ao Vivo" funcionando normalmente na página.

## Testes

```bash
npm test           # Jest + RTL (runInBand)
```

Arquivos de teste envolvidos:
- `src/components/connect/ConnectIntegrationDiagram.test.tsx` (novo)
- `src/components/connect/ConnectPage.test.tsx` (atualizado)
- `src/components/ui/PortfolioSection` / `PortfolioCard.test.tsx` (atualizados conforme mudanças)

## Lint / Typecheck

```bash
npm run lint       # eslint .
npx tsc --noEmit   # checagem de tipos
```

## Definição de pronto (gates da constituição)

- Zero `any`; tipos `IntegrationCategory`/`ConnectIntegrationsContent` definidos.
- Nenhuma lógica de negócio em `.tsx` (estado do diagrama limitado ao padrão `useReducedMotion` do projeto).
- Testes AAA cobrindo os cenários da spec (rótulos, fallback estático, sr-only, novo texto do card).
- Conteúdo completo nos 3 idiomas (`pt-BR`, `en`, `es`), sem marcas de terceiros como parceiras oficiais.
