# Phase 0 Research: Widget de Chat Embutível para Clientes

## 1. Mecanismo de entrega do widget: script direto vs. iframe

**Decision**: script standalone executado diretamente no contexto da página do cliente (sem iframe), isolado visualmente via **Shadow DOM**.

**Rationale**: a validação de domínio autorizado (FR-003/FR-004) já é feita pela API Python existente. Isso só funciona de forma confiável se o header `Origin` enviado nas chamadas `fetch` for o domínio real do site do cliente — e esse header **não pode ser sobrescrito por JavaScript** (é controlado pelo navegador). Se o widget rodasse dentro de um `<iframe>` apontando para uma página hospedada em `interasisai.com`, as chamadas de rede sairiam da origem `interasisai.com`, não da origem do cliente, quebrando a validação de domínio existente ou exigindo reimplementar essa lógica de outra forma (ex.: `document.referrer`, que é mais frágil). Executar o script diretamente no contexto do cliente preserva o mecanismo de segurança que já existe, sem duplicar trabalho.

**Alternatives considered**:
- **Iframe com página Next.js renderizada** (`/embed/[tenantId]`): reaproveitaria 100% do `ChatWidget.tsx` existente, mas exige inventar uma validação de domínio paralela baseada em `document.referrer` (falsificável em alguns cenários e mais frágil que o `Origin` nativo de CORS), além de complicar o toggle de abrir/fechar (redimensionar iframe via `postMessage`). Rejeitado por duplicar segurança já resolvida na API.
- **Web Component custom element**: tecnicamente similar à opção escolhida (também roda no contexto do cliente), mas exige polyfills para navegadores mais antigos sem ganho relevante sobre Shadow DOM manual. Não há necessidade de reusabilidade como componente por múltiplos frameworks aqui, então a complexidade extra não se paga.

## 2. Isolamento de estilos

**Decision**: `Shadow DOM` (modo `open`) com uma folha de estilos mínima, escrita à mão, injetada dentro do Shadow Root.

**Rationale**: Shadow DOM garante que o CSS do site do cliente não vaze para dentro do widget e vice-versa — atende diretamente ao FR-005. É suportado nativamente por todos os navegadores evergreen, sem necessidade de bibliotecas adicionais.

**Alternatives considered**: prefixação de classes CSS (ex.: `interasis-widget-*`) foi descartada porque não garante isolamento real — um CSS agressivo do site do cliente (ex.: `button { all: unset }`) ainda afetaria o widget.

## 3. Framework de UI do bundle

**Decision**: TypeScript vanilla + DOM APIs nativas (`document.createElement`, event listeners), sem React/Preact.

**Rationale**: o bundle é baixado por todo visitante de todo site cliente — peso é uma métrica de produto (SC-003 depende de instalação rápida e sem atrito, o que inclui não pesar no site do cliente). React+ReactDOM adicionariam ~140KB à carga inicial só para renderizar uma bolha de chat.

**Alternatives considered**: Preact (~4KB) foi cogitado como meio-termo, mas para a superfície de UI necessária (bolha, painel, lista de mensagens, input) o ganho de produtividade não compensa a dependência extra — a lógica é simples o bastante para DOM manual bem organizado.

## 4. Geração do snippet de instalação

**Decision**: o snippet é **computado inteiramente no frontend admin**, a partir do `tenant.id` já existente (`<script src="{WIDGET_BASE_URL}/widget/{tenant.id}" async></script>`). Nenhum novo endpoint de backend é necessário só para gerar o texto do snippet.

**Rationale**: o CRUD de tenants já usa `tenant.id` como identificador escolhido pelo operador na criação (confirmado em `specs/013-admin-tenant-management`), e esse mesmo valor é o que já vai no header `X-Tenant-ID`. Não há necessidade de gerar uma chave adicional — reaproveitar o ID existente elimina uma fonte de complexidade e de possível dessincronia entre "chave do widget" e "tenant".

**Alternatives considered**: gerar uma chave pública separada (`site key`) desacoplada do `tenant.id`, como fazem Intercom/Crisp. Rejeitado nesta fase por adicionar um campo/endpoint novo no backend Python sem benefício de segurança adicional relevante (o `tenant.id` já não é secreto — a segurança real está na validação de `allowed_domains` pela API, não na obscuridade do identificador).

## 5. Entrega do bundle já injetado com o tenantId

**Decision**: Route Handler dinâmico do Next.js (`src/app/widget/[tenantId]/route.ts`) lê o bundle pré-compilado (`public/widget/widget.bundle.js`), concatena um prefixo `const __INTERASIS_TENANT_ID__ = "...";` com o `tenantId` da URL, e retorna com `Content-Type: application/javascript`.

**Rationale**: mantém a promessa de "cole uma linha, sem editar nada" (SC-001) sem exigir gerar e publicar um arquivo estático por tenant a cada cadastro. A resposta pode (no futuro) também consultar a API Python para existência/estado do tenant e injetar configuração de aparência (ver item 6), tudo no mesmo request.

**Alternatives considered**: gerar um arquivo estático físico por tenant durante o cadastro (build-time). Rejeitado porque exigiria reconstruir/publicar assets a cada novo cliente, contrariando o fluxo de provisionamento manual simples já validado com o usuário.

## 6. Customização de aparência (FR-007) — dependência externa

**Decision**: a personalização de cor/logo/saudação/posição depende de campos que **ainda não existem** no tipo `Tenant` do backend Python (`id, name, google_calendar_id, allowed_domains, created_at, updated_at, deleted_at`). Esta feature documenta o contrato necessário (`contracts/tenant-widget-config-api.md`) como dependência externa; o MVP (User Stories P1/P2) usa aparência padrão fixa, sem bloquear o lançamento do widget em si.

**Rationale**: User Story 5 (customização) é P3 — a especificação já prioriza a instalação e o funcionamento do chat acima da customização visual. Bloquear o widget inteiro por um campo que não existe no backend externo não é necessário.

**Alternatives considered**: armazenar aparência apenas no frontend (ex.: hardcoded por tenant neste repositório). Rejeitado por reintroduzir a necessidade de o operador "mexer em código" a cada cliente novo — exatamente o que a especificação pede para evitar.

## 7. Testes do bundle standalone

**Decision**: Jest + `jsdom` (já configurado no projeto) para os módulos `network.ts`, `state.ts` e `render.ts`, sem React Testing Library (não há componentes React nesses módulos).

**Rationale**: mantém a cobertura obrigatória pelo Princípio IV da constituição sem introduzir uma nova ferramenta de teste só para este pacote.
