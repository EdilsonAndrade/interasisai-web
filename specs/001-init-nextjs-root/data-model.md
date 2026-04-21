# Data Model: Inicialização do Ecossistema Frontend na Raiz

## Overview

Esta feature não introduz entidades de negócio persistidas. O modelo abaixo descreve os artefatos estruturais e seus papéis na entrega.

## Entities

### Application Workspace

- **Description**: Representa a raiz do repositório como unidade única de execução da aplicação frontend.
- **Attributes**:
  - `rootPath`: caminho raiz do repositório
  - `packageManifestPresent`: indica presença do manifesto de dependências na raiz
  - `nestedProjectDetected`: indica se existe projeto duplicado em subdiretório
  - `devServerRunnable`: indica se o ambiente pode iniciar a partir da raiz
- **Relationships**:
  - Contém `Source Tree`
  - Contém `Public Assets`
  - Contém `Configuration Set`

### Source Tree

- **Description**: Estrutura principal do código-fonte da aplicação.
- **Attributes**:
  - `appDirectoryPresent`: indica presença da estrutura principal da aplicação
  - `homePageMinimal`: indica que a página inicial foi reduzida ao conteúdo mínimo esperado
  - `globalStylesMinimal`: indica que o arquivo global de estilos contém apenas a base necessária
- **Relationships**:
  - Pertence a `Application Workspace`

### Public Assets

- **Description**: Arquivos públicos entregues com a aplicação.
- **Attributes**:
  - `exampleAssetsRemoved`: indica remoção de ativos padrão sem valor para o produto
  - `requiredAssetsOnly`: indica permanência apenas de arquivos realmente necessários
- **Relationships**:
  - Pertence a `Application Workspace`

### Configuration Set

- **Description**: Conjunto de arquivos de configuração necessários para iniciar, tipar, estilizar e validar o projeto.
- **Attributes**:
  - `typescriptConfigured`: indica presença da configuração de tipagem
  - `tailwindConfigured`: indica presença da configuração de estilo utilitário
  - `lintConfigured`: indica presença da configuração de lint
  - `testConfigured`: indica presença da base de testes exigida pela constituição
- **Relationships**:
  - Pertence a `Application Workspace`

## Validation Rules

- `nestedProjectDetected` MUST be `false` para a entrega ser aceita.
- `devServerRunnable` MUST be `true` antes da conclusão da task.
- `homePageMinimal` MUST be `true` e refletir a mensagem definida na spec.
- `exampleAssetsRemoved` MUST be `true` antes da revisão final.
- `testConfigured` MUST be `true` para atender a constituição do repositório.
