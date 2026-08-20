# Quickstart: Prompts e Guardrails por Nó

**Feature**: 018-guardrail-node-targets

## Como testar manualmente

1. Rodar o frontend localmente (`npm run dev`) apontando `NEXT_PUBLIC_PYTHON_BACKEND_URL` para uma instância
   do `agendamento-ia` na branch `edilsonaandrade/edi-42-permitir-associar-guardrails-ao-chitchat_node`
   (já suporta `node_type`).
2. Acessar `/admin/prompt-manager` → aba **Prompts Base**.
3. Clicar em **Novo Prompt**:
   - Confirmar que "Nó de Destino" aparece com "Operacional" selecionado por padrão.
   - Criar um prompt com "Nó de Destino" = "Chitchat", marcando um ou mais guardrails no seletor existente.
   - Confirmar que o prompt aparece na lista com o badge "Chitchat".
4. Repetir para "Institucional".
5. Ir para a aba **Vincular Tenant**:
   - Confirmar que o seletor de nó (Operacional/Institucional/Chitchat) aparece acima da busca de tenant.
   - Com "Chitchat" selecionado, buscar um tenant e confirmar que o dropdown de prompts só lista prompts de
     `node_type: "chitchat"`.
   - Vincular o tenant ao prompt de chitchat criado no passo 3.
   - Trocar para "Operacional" e confirmar que o vínculo operacional do tenant continua intacto (não foi
     desativado pelo vínculo de chitchat).
6. Repetir a verificação para "Institucional", incluindo o caso de fallback: buscar um tenant que NÃO tenha
   prompt institucional próprio e confirmar que o card mostra o prompt/guardrails do `operational_node` desse
   tenant (fallback do backend).

## Como rodar os testes automatizados

```bash
npm test -- PromptFormModal
npm test -- TenantLinkSection
npm test -- promptManagerSchemas
npm test -- promptManager.test.ts
```

## Arquivos-chave para revisão

- `src/components/admin/prompt-manager/PromptFormModal.tsx` — seletor "Nó de Destino"
- `src/components/admin/prompt-manager/PromptList.tsx` — badge de nó
- `src/components/admin/prompt-manager/TenantLinkSection.tsx` — seletor de nó + filtro de prompts
- `src/hooks/useTenantLink.ts` — `fetchDetail`/`linkTenant` agora recebem `nodeType`
- `src/lib/promptManagerSchemas.ts` — validação `node_type` em `promptFormSchema`
- `src/services/promptManager.types.ts` — `NodeType`, `Prompt.node_type`, `TenantPromptDetail` corrigido
- `src/services/promptManager.ts` — `fetchTenantPromptDetail` com query param `node_type`
