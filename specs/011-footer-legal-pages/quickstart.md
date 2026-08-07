# Quickstart: Páginas Institucionais do Rodapé

**Date**: 2026-08-07
**Feature**: specs/011-footer-legal-pages

## Objetivo

Validar a entrega das páginas “Sobre”, “Política de Privacidade” e “Termos”, com o mesmo header da home para retorno aos tópicos principais, além da política de visibilidade de canais sociais no rodapé.

## Pré-requisitos

1. Projeto instalado e dependências resolvidas.
2. Aplicação Next.js executando em ambiente local.

## Execução local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Roteiro de validação funcional

1. Na home, localizar o rodapé na seção institucional.
2. Clicar em “Sobre” e confirmar abertura de página institucional dedicada.
3. Na página aberta, usar o mesmo header da home para retornar aos tópicos da página inicial.
4. Repetir para “Política de Privacidade”.
5. Repetir para “Termos”.
6. No bloco de redes sociais do rodapé, confirmar que LinkedIn está visível e navegável.
7. Confirmar que Instagram e YouTube não aparecem nesta versão.
8. Acessar diretamente as rotas institucionais por URL e verificar carregamento correto.

## Critérios de aceite rápidos

- Links institucionais do rodapé direcionam para páginas corretas.
- Header das páginas institucionais permite retorno consistente à home.
- LinkedIn visível com URL oficial definida.
- Instagram/YouTube ocultos na v1.

## Testes recomendados

```bash
npm test
```

Se houver testes específicos de navegação/rodapé adicionados na implementação, executar também o subconjunto correspondente.

## Notas de validação

- Validação automatizada executada em 2026-08-07: `npm run lint` e `npm test` sem falhas.
- Validação manual executada em ambiente local:
	- Home com links de header para `/#servicos`, `/#portfolio` e `/#contato`.
	- Rodapé institucional apontando para `/sobre`, `/politica-de-privacidade` e `/termos`.
	- Páginas institucionais carregando com o mesmo header da home.
	- Rodapé social exibindo apenas LinkedIn, com Instagram/YouTube ocultos.
