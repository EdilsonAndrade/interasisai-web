# Quickstart: Ajuda de placeholders obrigatórios ao cadastrar prompt

Roteiro de verificação manual, a rodar localmente (`npm run dev`) após a implementação, em complemento aos testes automatizados.

## Pré-requisitos

- Sessão de admin autenticada, acesso a `/admin/prompt-manager`.

## Roteiro

1. **Criar prompt — operational (padrão)**
   - Ir em `/admin/prompt-manager`, aba Prompts, clicar em "Novo Prompt".
   - Verificar: "Nó de Destino" já vem em "Operacional"; abaixo do campo "Conteúdo (Markdown)" aparece a seção de ajuda listando `{guardrails}`, `{tenant_id}`, `{contexto_formatado}`, `{tabela_calendario_str}`, `{hora_atual_str}`, `{data_hoje_iso}` como obrigatórios, com um exemplo de texto usando todos eles.

2. **Trocar para institutional**
   - No mesmo formulário, mudar "Nó de Destino" para "Institucional".
   - Verificar: a seção de ajuda atualiza imediatamente para `{guardrails}`, `{historico_texto}`, `{contexto_formatado}`, `{pergunta_usuario}`, com o exemplo no formato `--- CONVERSATION HISTORY --- / --- CONTEXT FROM KNOWLEDGE BASE --- / User Question:`.

3. **Trocar para chitchat**
   - Mudar "Nó de Destino" para "Chitchat".
   - Verificar: a seção mostra apenas `{guardrails}` como obrigatório; `{contexto_formatado}` e `{historico_texto}` não aparecem em nenhum lugar da seção.

4. **Editar prompt existente**
   - Abrir um prompt institucional já existente para edição.
   - Verificar: a seção de ajuda aparece do mesmo jeito (institutional), independente do conteúdo já cadastrado.

5. **Não interfere no submit**
   - Preencher título e conteúdo (mesmo sem usar todos os placeholders) e salvar.
   - Verificar: o formulário salva normalmente, sem bloqueio nem erro relacionado à seção de ajuda (validação de placeholders é escopo do EDI-51/EDI-52, não desta feature).

6. **Altura do modal em viewport pequeno**
   - Redimensionar a janela do navegador para uma altura baixa (ex.: ~700px) ou usar as DevTools em modo responsivo.
   - Abrir o formulário de prompt com "Nó de Destino" = Operacional (a seção com mais placeholders).
   - Verificar: os botões "Cancelar"/"Criar Prompt" continuam acessíveis (rolando a página, se necessário) — `AdminDialog` não trunca conteúdo sem permitir acesso ao restante do formulário. Caso os botões fiquem inacessíveis, registrar como problema pré-existente de `AdminDialog` (fora do escopo deste ticket) em vez de tentar corrigir aqui.

## Critério de aceite do roteiro

Todos os 6 passos acima devem se comportar exatamente como descrito, sem erros no console do navegador em nenhum momento.
