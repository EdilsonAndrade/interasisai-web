# Contract: Legal Pages Routes

**Feature**: specs/011-footer-legal-pages

## Public Route Contract

### Route 1: Sobre
- **Path**: `/sobre`
- **Purpose**: Apresentar informações institucionais da InterasisAI.
- **Required Elements**:
  - Header equivalente ao da home para retorno de navegação.
  - Conteúdo institucional com título e seções legíveis.

### Route 2: Política de Privacidade
- **Path**: `/politica-de-privacidade`
- **Purpose**: Informar práticas de privacidade do site.
- **Required Elements**:
  - Header equivalente ao da home.
  - Conteúdo de política com linguagem clara para usuário final.

### Route 3: Termos
- **Path**: `/termos`
- **Purpose**: Informar termos de uso do serviço e do site.
- **Required Elements**:
  - Header equivalente ao da home.
  - Conteúdo de termos com estrutura textual navegável.

## Navigation Behavior Contract

- A partir da home, cada link institucional do rodapé deve abrir sua rota correspondente.
- Em cada rota institucional, o header deve manter o caminho de retorno aos tópicos da home.
- Acesso direto por URL deve carregar a página corretamente.
