# Research: Ajuda de placeholders obrigatórios ao cadastrar prompt

## 1. Onde inserir a seção de ajuda

- **Decision**: dentro de `PromptFormModal.tsx`, imediatamente abaixo do bloco `MarkdownEditorCustom` (campo "Conteúdo").
- **Rationale**: é o único lugar onde `node_type` e o conteúdo do prompt já convivem no mesmo formulário (`react-hook-form`), e o ticket EDI-50 pede explicitamente a posição "abaixo do campo de conteúdo do prompt". Não há uma tela separada de "prévia de prompt" no projeto.
- **Alternatives considered**: tooltip/popover ancorado ao label do campo — descartado por escurecer o conteúdo completo (lista de até 6 placeholders + exemplo multi-linha não cabe bem em um tooltip); modal separado acionado por um botão "Ajuda" — descartado nas perguntas de esclarecimento (usuário confirmou "sempre visível").

## 2. Estático vs. dinâmico/derivado do texto digitado

- **Decision**: seção puramente estática por `node_type` — não lê nem compara com `conteudoValue` (o texto já digitado no editor).
- **Rationale**: confirmado explicitamente com o usuário nas perguntas de esclarecimento — um indicador "ao vivo" (ex.: check ao lado de cada placeholder já usado) anteciparia parte do escopo do EDI-52 ("Frontend: exibir erro de placeholders obrigatórios faltantes ao salvar prompt"), que é um ticket separado e relacionado.
- **Alternatives considered**: indicador ao vivo via `String.prototype.includes` sobre `conteudoValue` — tecnicamente simples, mas rejeitado para não duplicar/sobrepor o escopo do EDI-52.

## 3. Ação de conveniência (inserir/copiar exemplo)

- **Decision**: nenhuma — o bloco de exemplo é somente leitura (`<pre><code>`), sem botão de copiar ou inserir no editor.
- **Rationale**: confirmado com o usuário — um botão "inserir no editor" arriscaria sobrescrever conteúdo já digitado sem confirmação, e "copiar" foi considerado desnecessário para o valor central do ticket (visibilidade, não produtividade de digitação).
- **Alternatives considered**: botão "Copiar exemplo" (clipboard) — rejeitado pelo usuário na pergunta de esclarecimento, mesmo sendo a opção menos arriscada das duas descartadas.

## 4. Fonte da verdade dos placeholders por `node_type`

- **Decision**: mapa estático em `promptPlaceholderHelp.ts`, com os placeholders e o exemplo copiados literalmente da descrição do ticket EDI-50 (que já confirma cada um contra o código do backend: `prompts/load_prompt.py`, `modules/ia/agent_graph.py`, `prompts/*.md`).
- **Rationale**: o ticket já fez o trabalho de auditoria do backend; não há necessidade (nem visibilidade, já que este projeto é só frontend) de re-derivar essa lista dinamicamente de um endpoint ou de código Python.
- **Alternatives considered**: expor os placeholders via uma rota de backend (`GET /prompts/placeholders?node_type=...`) — rejeitado por estar fora do escopo declarado no ticket ("Escopo apenas front-end") e por introduzir uma dependência de API para um dado que não muda em runtime.

## 5. Renderização do exemplo (Markdown vs. texto puro)

- **Decision**: o exemplo é renderizado como texto monoespaçado puro (`<pre>`), nunca passado pelo `MarkdownEditorCustom`/`react-markdown`.
- **Rationale**: o exemplo já é o próprio conteúdo de um prompt (que é Markdown livre) — renderizá-lo via `react-markdown` interpretaria `---`, `#` etc. como formatação em vez de mostrar o texto literal que o admin deve copiar/reconhecer. Texto puro também evita qualquer superfície de `dangerouslySetInnerHTML` (Princípio VIII).
- **Alternatives considered**: reaproveitar `MarkdownEditorCustom` em modo `preview` só para o exemplo — descartado por renderizar o Markdown em vez do texto literal esperado.
