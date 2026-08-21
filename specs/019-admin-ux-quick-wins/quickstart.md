# Quickstart: Validação Manual — Ajustes de Usabilidade no Painel Administrativo (Fase 1)

Roteiro de verificação manual após a implementação, complementar aos testes automatizados (Jest + RTL). Rodar em `/admin` autenticado, em desktop e em uma viewport mobile.

## US1 — Fechar modais com ESC

1. Abrir "Prompts & Guardrails" → aba "Prompts Base" → "Novo Prompt". Pressionar ESC sem preencher nada → modal fecha.
2. Repetir, mas digitar algo no campo "Título" antes de pressionar ESC → deve aparecer confirmação de descarte; cancelar mantém o modal aberto com o texto digitado intacto; confirmar fecha o modal.
3. Abrir qualquer modal de confirmação de exclusão (ex: excluir um guardrail) e pressionar ESC → fecha imediatamente, sem excluir nada.
4. Com um modal aberto, observar que a área por trás fica escurecida e não é clicável.
5. Testar a área de clique ao redor do "X" — deve responder ao clique numa área maior que o ícone.

## US2 — Título da tela "Painel"

1. Abrir `/admin` (tela inicial pós-login) → o título não deve mais mencionar "Adicionar Novo Tenant".

## US3 — Peso visual do "Excluir"

1. Na tela de Base de Conhecimento de um tenant com conteúdo salvo, comparar visualmente "Salvar Base de Conhecimento" e "Excluir" — o segundo deve ser nitidamente mais discreto.
2. Repetir a exclusão em Prompts, Guardrails e detalhe de Tenant — confirmação continua sendo exigida em todos.

## US4 — Busca em Prompts Base

1. Com vários prompts cadastrados, digitar parte de um título no campo de busca → lista filtra em tempo real.
2. Buscar um termo sem correspondência → mensagem de "nenhum resultado" (diferente da mensagem de lista vazia).
3. Limpar a busca → lista completa volta.

## US5 — Títulos duplicados

1. Localizar (ou criar temporariamente) dois prompts com o mesmo título em nós diferentes → confirmar que dá para diferenciá-los pela badge de nó sem abrir nenhum.

## US6 — Badge "Global"

1. Passar o mouse sobre a badge "Global" em Prompts Base, Guardrails, modal de Prompt e Vincular Tenant → mesmo rótulo e mesma explicação em todos os lugares.
2. Repetir navegando só por teclado (Tab até a badge) → tooltip também aparece por foco, não só por hover.

## US7 — "Atualizado em" vazio

1. Consultar um tenant recém-criado, nunca editado → campo não mostra "Não informado".

## Regressão

- Rodar suíte de testes: `npm test` (ou `yarn test`) — nenhum teste existente deve quebrar além dos intencionalmente reescritos (`AdminDialog.test.tsx`).
- Confirmar que criação/edição normal de Tenant, Prompt e Guardrail (sem ESC no meio) continua funcionando e fechando o modal ao salvar com sucesso.
