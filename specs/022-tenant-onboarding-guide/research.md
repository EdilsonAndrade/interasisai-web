# Research: Guia de onboarding para cadastro de tenant

## 1. Biblioteca de tour/spotlight vs. painel próprio

- **Decision**: construir o painel do zero (sem `react-joyride`, `driver.js`, `intro.js`, `shepherd.js`).
- **Rationale**: nenhuma dessas bibliotecas está instalada; o formato definido com o usuário (painel lateral fixo, checklist manual, sem destaque de elementos na tela / spotlight) não precisa de motor de posicionamento sobre o DOM de terceiros. Framer Motion (já presente) cobre a única animação necessária (slide-in/fade do painel e pulso dos itens pendentes).
- **Alternatives considered**: `react-joyride` (motor de spotlight completo, mas adiciona ~30kB e resolve um problema — highlight de elementos — que o formato escolhido não usa); `driver.js` (mesmo raciocínio, além de não ter tipagem TS nativa robusta).

## 2. Onde montar o painel para sobreviver à navegação entre telas

- **Decision**: `OnboardingGuideProvider` (Context API) montado em `src/app/[locale]/admin/layout.tsx`, ao lado de `AdminNavigation`.
- **Rationale**: o `AdminLayout` já envolve todas as rotas de `/admin` (`tenants`, `prompt-manager`, `whatsapp`), então um Provider ali sobrevive a navegações client-side entre essas rotas sem re-montar. Evita duplicar estado por página e respeita o Princípio II da constituição (Context granular, escopado a `/admin`, não promovido a Provider global do app).
- **Alternatives considered**: manter o painel local a `TenantManagement.tsx` (mais simples, mas perde o progresso ao navegar para `/admin/prompt-manager` — quebra FR-009); um Portal renderizado via `document.body` fora da árvore de rotas (funciona, mas reintroduz problema de estado — ainda precisaria de um Context ou store global para não resetar).

## 3. Persistência local: preferência de desativação vs. progresso do checklist

- **Decision**: duas chaves de localStorage, ambas geridas por `onboardingGuideStorage.ts`: uma flag global `onboarding_guide_disabled` (boolean) e um mapa por tenant `onboarding_guide_progress:{tenantId}` (array dos IDs de passo concluídos).
- **Rationale**: a flag de desativação é intencionalmente global ao navegador (não por tenant) — é sobre o usuário já conhecer o processo, não sobre um tenant específico (confirmado com o usuário). O progresso, por outro lado, é por tenant, para não misturar o checklist de um cadastro com o de outro feito em seguida no mesmo navegador.
- **Alternatives considered**: um único objeto serializado guardando tudo (mais simples de implementar, mas mistura duas preocupações com ciclos de vida diferentes — a flag é "para sempre" até reativação manual, o progresso é por cadastro); `sessionStorage` para o progresso (rejeitado — spec exige retomar após fechar a aba, ver Edge Case "fechar a aba com checklist parcial").

## 4. Padrão de acesso a localStorage (fallback seguro)

- **Decision**: espelhar exatamente o padrão de `src/services/sessionManager.ts` — testar disponibilidade com um `try/set/remove`, nunca deixar uma exceção (quota excedida, modo privado, `SecurityError`) propagar, e manter um fallback em memória (`Map`) para a sessão atual.
- **Rationale**: é o único precedente do repositório para esse tipo de persistência client-side; reaproveitar o padrão mantém consistência e já foi validado em produção pelo chat.
- **Alternatives considered**: uma lib de storage abstraction (`idb-keyval`, etc.) — desnecessário para duas chaves simples de booleans/arrays pequenos.

## 5. Aviso da US2 (prompt inicial / base de conhecimento) — bloqueante ou não

- **Decision**: não bloqueante — um banner/aviso informativo exibido junto ao botão de criar tenant (ou logo após o clique, antes do submit real), sem impedir o clique/submit.
- **Rationale**: confirmado explicitamente com o usuário — é só um lembrete, a validação real de que os pré-requisitos existem acontece via checklist manual no painel (US1), não como gate de formulário.
- **Alternatives considered**: modal de confirmação obrigatória ("sim, já tenho" / "não, preciso criar antes") — descartado pelo usuário nas perguntas de esclarecimento.

## 6. Destaque "piscando" nos itens pendentes

- **Decision**: `animate-pulse` do Tailwind (ou keyframe customizado equivalente) aplicado à borda/indicador do item, não ao texto inteiro nem à cor de fundo do painel.
- **Rationale**: `animate-pulse` já é uma utility nativa do Tailwind (sem CSS novo, respeita Princípio VI — Tailwind como única solução de estilo), e um destaque discreto evita fadiga visual em um painel que fica fixo na tela por todo o fluxo.
- **Alternatives considered**: animação via Framer Motion (`repeat: Infinity`) — mais controle, mas custo de performance/GPU desnecessário para um efeito que o Tailwind já resolve de forma mais leve.
