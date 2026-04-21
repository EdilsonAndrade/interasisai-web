# Contract: Bootstrap Verification

## Purpose

Definir o contrato objetivo de verificação da entrega inicial do frontend.

## Required Conditions

- Existe um único projeto frontend operando na raiz do repositório.
- O manifesto de dependências está no mesmo nível das demais configurações raiz.
- A estrutura principal do código-fonte segue o layout padronizado pela feature.
- A rota inicial local renderiza exclusivamente a mensagem "Interasis AI - Ambiente Inicializado".
- O arquivo global de estilos mantém apenas o núcleo mínimo necessário para a base visual.
- Arquivos públicos de exemplo gerados automaticamente foram removidos.
- O ambiente local inicia sem erro bloqueante.
- Existe pelo menos um teste automatizado cobrindo a renderização mínima da página inicial.

## Verification Methods

- Inspeção da árvore de arquivos na raiz.
- Execução do comando padrão de desenvolvimento.
- Acesso manual à rota inicial local.
- Execução da suíte mínima de testes.
- Revisão dos arquivos públicos e de estilo global.

## Failure Conditions

- Existe pasta adicional contendo outro projeto da mesma aplicação.
- A página inicial ainda mostra conteúdo padrão do template.
- Arquivos de exemplo permanecem no diretório público sem justificativa.
- O projeto depende de ajuste manual extra para iniciar localmente.
- Não há base de testes configurada para validar a interface inicial.
