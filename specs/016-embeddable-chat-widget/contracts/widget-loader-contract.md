# Contract: Script de Instalação do Widget

## Endpoint

```
GET {WIDGET_BASE_URL}/widget/{tenantId}
```

- Implementado por `src/app/widget/[tenantId]/route.ts` (Next.js Route Handler) neste repositório.
- `tenantId`: o mesmo valor de `Tenant.id`, usado como `X-Tenant-ID` nas chamadas ao backend Python.
- Response `Content-Type: application/javascript; charset=utf-8`.
- Cacheável publicamente (`Cache-Control: public, max-age=300`) — o conteúdo só muda quando a aparência do tenant é atualizada.

## Snippet de instalação (o que o cliente cola no site dele)

```html
<script src="https://{WIDGET_BASE_URL}/widget/{tenantId}" async></script>
```

Nenhum outro parâmetro, atributo `data-*` ou objeto de configuração é exigido do cliente.

## Comportamento do script retornado

1. Ao carregar, injeta um elemento raiz (`<div id="interasis-chat-widget">`) no `document.body`, anexado a um **Shadow Root em modo `open`**.
2. Imediatamente chama `initializeChatSession(tenantId)` contra o backend Python (mesma função já usada pelo chat interno, reaproveitada sem alteração de contrato).
3. **Se a inicialização falhar** (qualquer erro — incluindo domínio não autorizado, tenant excluído/inexistente, erro de rede): nenhuma UI é renderizada. Nenhum erro é logado de forma visível ao visitante final; o widget permanece completamente ausente da página (FR-004).
4. **Se a inicialização for bem-sucedida**: renderiza a bolha flutuante de chat (posição padrão: `bottom-right`, ou conforme `WidgetConfig` quando disponível — ver `tenant-widget-config-api.md`).
5. O restante da interação (enviar mensagem, receber resposta, refresh de token em 401) replica o comportamento já implementado em `useChatAssistant.ts`, adaptado para módulos vanilla (`src/widget/state.ts`, `src/widget/network.ts`).
6. O `thread_id` da conversa é persistido em `localStorage` da própria origem do site do cliente — cada domínio mantém seu próprio histórico, sem coordenação adicional.

## Requisitos não-funcionais

- Tamanho do bundle completo (loader + UI): meta < 20KB gzip.
- Nenhuma variável de ambiente ou segredo do backend é exposta no bundle público — apenas a URL pública do backend Python (já pública hoje via `NEXT_PUBLIC_PYTHON_BACKEND_URL`) é embutida no build.
- O script não deve lançar exceções não tratadas que apareçam no console do site do cliente como erro visível de "quebra de página" — falhas são sempre silenciosas do ponto de vista do visitante.
