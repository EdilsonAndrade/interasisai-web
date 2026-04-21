# Quickstart: Inicialização do Ecossistema Frontend na Raiz

## Prerequisites

- Node.js em versão compatível com o gerador atual do ecossistema Next.js
- npm disponível no ambiente
- Repositório já clonado e acessível localmente
- Shell posicionado na raiz do repositório

## Setup Flow

1. Inicialize a aplicação web diretamente na raiz do repositório usando o gerador oficial com App Router, TypeScript, Tailwind, ESLint, `src` directory e alias de importação.
2. Confirme a operação no diretório atual caso o terminal solicite confirmação por a raiz já conter arquivos.
3. Substitua a home padrão por uma página mínima contendo apenas a mensagem definida na spec.
4. Limpe o arquivo global de estilos para manter somente a base essencial do sistema utilitário.
5. Remova ativos públicos de exemplo não utilizados.
6. Confirme a presença dos arquivos principais de configuração na raiz.
7. Configure a base de testes de interface exigida pela constituição.
8. Inicie o ambiente local e valide a renderização da rota inicial.

## Validation Checklist

1. O manifesto de dependências está na raiz do repositório.
2. Não existe subprojeto duplicando a aplicação dentro da raiz.
3. A estrutura principal do código-fonte está no layout esperado pela spec.
4. A página inicial exibe apenas a mensagem de confirmação.
5. O arquivo global de estilos foi reduzido ao mínimo necessário.
6. Os ativos públicos de exemplo foram removidos.
7. O ambiente local inicia sem erro bloqueante.
8. A base de testes executa ao menos um teste de fumaça da página inicial.

## Expected Outcome

Ao final, o repositório passa a operar como o frontend principal da Interasis AI, com estrutura limpa, executável a partir da raiz e pronta para receber novas features sem retrabalho estrutural.
