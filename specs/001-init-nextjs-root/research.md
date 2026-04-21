# Research: Inicialização do Ecossistema Frontend na Raiz

## Decision 1: Inicializar o projeto diretamente na raiz com `create-next-app`

- **Decision**: Usar o gerador oficial para criar a aplicação na raiz do repositório atual, apontando o diretório de destino para `.`.
- **Rationale**: Essa abordagem atende o requisito principal da spec de evitar projeto aninhado, gera a estrutura padrão esperada e reduz risco de configuração manual inconsistente.
- **Alternatives considered**:
  - Criar o projeto em uma subpasta e mover arquivos depois: rejeitado por aumentar risco de erro estrutural e violar o requisito de raiz única.
  - Montar a estrutura manualmente: rejeitado por gerar mais trabalho, mais variáveis de configuração e menor previsibilidade.

## Decision 2: Manter App Router com código-fonte em `src/app`

- **Decision**: Preservar a convenção moderna do App Router e a estrutura de código dentro de `src/app`.
- **Rationale**: Essa estrutura está alinhada com o ticket, com a constituição do frontend e com a expectativa de continuidade do projeto.
- **Alternatives considered**:
  - Usar Pages Router: rejeitado por não corresponder ao escopo explicitado no ticket.
  - Usar raiz sem `src/`: rejeitado por fugir da convenção desejada para o repositório.

## Decision 3: Reduzir o boilerplate ao mínimo executável

- **Decision**: Trocar a home padrão por uma tela mínima com mensagem única de confirmação, limpar o CSS global para manter apenas as diretivas base do Tailwind e remover ativos públicos de exemplo.
- **Rationale**: Isso satisfaz os cenários da spec, reduz ruído inicial e deixa o repositório pronto para a arquitetura da aplicação.
- **Alternatives considered**:
  - Manter o boilerplate e adaptar depois: rejeitado por gerar retrabalho imediato.
  - Substituir por layout visual mais elaborado: rejeitado por estar fora do escopo desta task.

## Decision 4: Tratar validação estrutural como contrato explícito

- **Decision**: Validar a entrega por estrutura de arquivos, renderização da rota inicial e execução do ambiente local.
- **Rationale**: A feature não introduz regras de domínio complexas; o principal risco está em uma base mal inicializada ou inconsistente com o ticket.
- **Alternatives considered**:
  - Validar apenas manualmente sem checklist técnico: rejeitado por reduzir reprodutibilidade.
  - Focar apenas em execução local: rejeitado por não cobrir requisitos de estrutura e limpeza.

## Decision 5: Incluir a base de testes como requisito de implementação

- **Decision**: O plano deve prever configuração inicial de Jest + React Testing Library e um teste mínimo da página inicial.
- **Rationale**: A constituição do repositório torna testes obrigatórios para considerar a entrega pronta, mesmo para uma inicialização simples.
- **Alternatives considered**:
  - Adiar a base de testes para outra task: rejeitado por conflitar com os quality gates da constituição.
  - Considerar validação manual suficiente: rejeitado por não atender o padrão obrigatório de testes.
