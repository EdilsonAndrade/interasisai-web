# Quickstart: verificação manual (EDI-46)

Executar quando o backend do EDI-45 estiver disponível (endpoints `GET /tenants/{id}/delete-impact` e `DELETE /tenants/{id}` orquestrado). Até lá, os testes automatizados cobrem o contrato mockado — este roteiro é a validação de integração real, feita ao final, conforme combinado.

1. **Prompt exclusivo + guardrail exclusivo** → excluir um tenant cujo prompt operacional não é usado por nenhum outro tenant e cujos guardrails também são exclusivos. Esperado: resumo mostra ambos em "será excluído"; após confirmar, prompt e guardrail somem da biblioteca.
2. **Prompt compartilhado + guardrail exclusivo** → tenant com prompt usado por outro tenant. Esperado: prompt aparece em "será apenas desvinculado", guardrail exclusivo aparece em "será excluído".
3. **Prompt exclusivo + guardrail global** → Esperado: prompt em "será excluído", guardrail global em "será apenas desvinculado" com o badge de global visível.
4. **Prompt e guardrail ambos compartilhados/globais** → Esperado: ambos em "apenas desvinculado", nada em "será excluído".
5. **Confirmação por nome**: abrir o modal, digitar nome errado (botão continua desabilitado), digitar nome certo com espaço extra no fim (botão habilita), confirmar.
6. **Cancelar/Esc**: abrir o modal, pressionar Esc — nada muda no tenant; reabrir e confirmar que o resumo é buscado de novo (sem estado velho).
7. **Falha na busca do impacto**: simular erro de rede (offline) ao abrir o modal — mensagem de erro aparece, campo de nome não é liberado.
8. **Falha na exclusão em si** (impacto ok, mas `DELETE` falha): confirmar e ver mensagem de erro; tenant continua existindo e consultável.
9. **Badges de node_type/guardrail global**: consultar um tenant com prompts nos três tipos de nó e guardrails mistos — conferir que os três tipos aparecem rotulados e que os guardrails globais têm o selo "Global" (`GuardrailScopeBadge`).
10. **Atalho WhatsApp**: a partir do tenant, clicar em "WhatsApp" — conferir que a tela de instâncias abre com Tenant ID e Nome da Instância pré-preenchidos e editáveis.
11. **Editar** (regressão): confirmar que o botão "Editar" ainda abre o formulário com os dados atuais pré-carregados, sem mudança de comportamento.
