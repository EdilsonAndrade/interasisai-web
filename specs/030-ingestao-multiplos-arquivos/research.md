# Phase 0 Research: Ingestão de Dados por Múltiplos Arquivos

Nenhum `NEEDS CLARIFICATION` restou no Technical Context — as decisões abaixo documentam escolhas de abordagem dentro do padrão já estabelecido no repositório.

## Decisão: Hook dedicado `useKnowledgeBaseItems`, separado de `useKnowledgeBase`

- **Decision**: Criar um novo hook para o CRUD de itens, mantendo `useKnowledgeBase` inalterado (continua servindo o preview consolidado via GET/DELETE geral).
- **Rationale**: `useKnowledgeBase` já tem uma responsabilidade clara e testada (texto único). Injetar list/upload/replace/delete de itens nele violaria SRP (Princípio I da constituição) e aumentaria o raio de blast de qualquer mudança futura no preview.
- **Alternatives considered**: Expandir `useKnowledgeBase` num hook único "faz tudo" — rejeitado por violar Single Responsibility e tornar os testes existentes mais frágeis.

## Decisão: Confirmações reutilizam um `ConfirmActionDialog` genérico

- **Decision**: As 4 confirmações (substituir tudo, adicionar, substituir arquivo de um item, excluir item) usam um único componente de diálogo parametrizado por título/mensagem/label de ação, seguindo o padrão visual já existente em `KnowledgeBaseDeleteDialog.tsx`.
- **Rationale**: Evita 4 modais quase-idênticos (Princípio III — DRY). `KnowledgeBaseDeleteDialog` já resolve apagar a base inteira; o novo componente generaliza o mesmo padrão para as demais ações destrutivas por item.
- **Alternatives considered**: Um diálogo bespoke por ação — rejeitado por duplicação de UI e de testes.

## Decisão: Validação client-side de arquivo (tamanho/extensão) com Zod antes do upload

- **Decision**: Antes de disparar o `POST /knowledge-base/items`, validar cada arquivo (extensão em `.pdf/.xls/.xlsx/.csv`, tamanho ≤ 10MB) e cada texto colado (não vazio) com um schema Zod, bloqueando o envio e mostrando o motivo por arquivo quando inválido.
- **Rationale**: Constituição (Princípio VIII) exige validação client-side com Zod antes de qualquer chamada ao backend. Também evita round-trips desnecessários para erros óbvios (ex: enviar um `.docx`).
- **Alternatives considered**: Depender só do 422 do backend — rejeitado por pior UX (erro só após upload completo) e por não seguir o guardrail de segurança do projeto.

## Decisão: Fluxo de duplicidade (409) é client-driven com retry

- **Decision**: A primeira submissão em modo "adicionar" vai sem `duplicate_resolutions`. Se a API responder 409 com a lista `conflicts`, o hook abre o `KnowledgeBaseDuplicateDialog` listando os arquivos conflitantes; o usuário escolhe "substituir" ou "manter ambos" por arquivo; o hook reenvia o mesmo POST incluindo `duplicate_resolutions` preenchido.
- **Rationale**: É exatamente o contrato já definido no ticket EDI-39 (backend nunca sobrescreve/duplica silenciosamente). Não há endpoint de pré-checagem de nome — implementar um round trip extra só para checar duplicidade antes do upload seria complexidade desnecessária.
- **Alternatives considered**: Endpoint separado de "checar nomes antes de enviar" — rejeitado, fora do contrato já acordado no ticket e sem ganho relevante de UX dado que o 409 já retorna a lista completa de conflitos em uma única resposta.

## Decisão: Conteúdo extraído sempre renderizado como texto puro

- **Decision**: Prévia (1000 chars) e conteúdo completo no modal são renderizados com `whitespace-pre-wrap` em um elemento de texto puro — nunca via `dangerouslySetInnerHTML` ou parser de Markdown.
- **Rationale**: O conteúdo vem de arquivos enviados por administradores e extraído por um serviço externo; tratá-lo como HTML confiável violaria o Princípio VIII (segurança) sem necessidade, já que hoje o textarea de edição já trata o conteúdo como texto puro.
- **Alternatives considered**: Renderizar como Markdown via `react-markdown` (já uma dependência do projeto, usada no chat) — rejeitado aqui porque o conteúdo é texto extraído de planilhas/PDF, não Markdown intencional; renderizar como MD arriscaria interpretar caracteres do conteúdo extraído como sintaxe.
