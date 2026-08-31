<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/029-system-prompts-panel/plan.md

## RULES

1. Always speak in Portugese in the chat
2. EVITE ao máximo detalhar muito, SOMENTE quando solicito ou não compreensivo pelo usuário

## GUARDRAILS

1. SEMPRE acesse o linear via MCP configurado no arquivo `./.mcp.json` quando mencionado algum numero de ticket, card, ou issue pelo usuário
2. SE houver dúvidas ou incertezas SEMPRE questionar.
3. Quando estiver tudo esclarecido iniciar na seguinte ordem os comandos
  1. /speckit-specify
  2. /speckit-plan
  3. /speckit-tasks
  4. /speckit-implement
4. O nome da branch sempre levará o NOME da ISSUE do Linear, se não houver, pergunte.
5. CASO não haja ticket no linear, atuar pontualmente após entendimento
6. Não inicie o container, ou suba instancia para testar o site ou backend, sempre peça ao usuário para seguir conforme plano de Test Guide, não queria ler o navegador , exceto se solicitado

## Test Guide
1. At the end of all implementation, describe how to test following the example
<example>
1- Access the page XPTO
2- Click on menu YZ
3- Execute the SQL query to check
4- Run this curl to update or inser
</example>
<!-- SPECKIT END -->

