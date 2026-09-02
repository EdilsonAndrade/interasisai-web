# Quickstart: Validação manual — Ingestão de Dados por Múltiplos Arquivos

Pré-requisito: backend Python já expondo os 6 endpoints de `/knowledge-base/items` (ver [contracts/knowledge-base-items-api.md](./contracts/knowledge-base-items-api.md)).

1. Acesse o painel admin → Tenants → selecione um tenant → aba de Ingestão/Base de Conhecimento.
2. **Upload múltiplo (novo tenant)**: com um tenant sem ingestão prévia, envie 2 arquivos (ex: um `.csv` e um `.pdf`) e confirme que ambos aparecem como itens na grid, com prévia de até 1000 caracteres.
3. **Adicionar**: com o toggle em "adicionar", envie mais um arquivo com nome novo → confirme no modal → item novo aparece na grid sem afetar os existentes.
4. **Nome duplicado**: reenvie um arquivo com o mesmo nome de um já existente (modo adicionar) → confirme que aparece o modal de conflito perguntando substituir ou manter ambos; teste as duas opções separadamente.
5. **Substituir tudo**: ative o toggle "substituir", envie um novo arquivo → confirme no modal de substituição total → confirme que todos os itens antigos somem e só o novo permanece.
6. **Detalhe do item**: clique em um item da grid → modal abre com o conteúdo completo em scroll.
7. **Substituir arquivo de um item**: dentro do modal do item, envie outro arquivo por cima → confirme → conteúdo/nome do item atualizam, demais itens intactos.
8. **Excluir item**: exclua um item específico → confirme → apenas aquele item some, os demais continuam.
9. **Edição manual preservada**: edite manualmente o texto de um item existente e salve → confirme que a alteração aparece tanto no item quanto no preview consolidado da base de conhecimento.
10. **Migração de tenant legado**: em um tenant que já tinha ingestão antes desta feature (texto único), confirme que a grid já mostra 1 item automaticamente, sem nenhuma ação manual.
