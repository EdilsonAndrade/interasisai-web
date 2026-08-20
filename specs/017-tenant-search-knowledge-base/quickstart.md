# Quickstart: Busca de Tenant e Gestão da Base de Conhecimento

**Feature**: 017-tenant-search-knowledge-base
**Date**: 2026-08-19

## Pré-requisitos

- Node.js 20+
- Backend Python/FastAPI rodando em `http://localhost:8000` (ou URL configurada em `NEXT_PUBLIC_PYTHON_BACKEND_URL`), já expondo os seis endpoints de [contracts/admin-api-contract.md](contracts/admin-api-contract.md)
- Sessão admin ativa (login via `/admin` com `ADM_USER`/`ADM_PWD`)
- Nenhuma dependência nova — todas as libs usadas (`react-hook-form`, `zod`, `sonner`, `lucide-react`) já estão em `package.json`

## Arquivos a criar/modificar (ordem sugerida)

| # | File | Type | Purpose |
|---|------|------|---------|
| 1 | `src/services/pythonBackend.types.ts` | Modified | `TenantSearchItem/Result`, `KnowledgeBase*` types; remove `Ingest*` types |
| 2 | `src/services/promptManager.types.ts` | Modified | Adiciona `is_default_prompt` a `TenantPromptDetail` |
| 3 | `src/lib/tenantSchemas.ts` | Modified | Adiciona `tenantSearchSchema` |
| 4 | `src/services/pythonBackend.ts` | Modified | Adiciona `searchTenants`, `getKnowledgeBase`, `saveKnowledgeBase`, `deleteKnowledgeBase`; remove `ingestKnowledge` |
| 5 | `src/services/index.ts` | Modified | Ajusta barrel exports (+ novos, − `Ingest*`) |
| 6 | `src/hooks/useTenantSearch.ts` | New | Busca por termo → lista de tenants |
| 7 | `src/hooks/useTenantContext.ts` | New | Wrapper somente-leitura de `fetchTenantPromptDetail` |
| 8 | `src/hooks/useKnowledgeBase.ts` | New | Ler/salvar/excluir base de conhecimento do tenant selecionado |
| 9 | `src/components/admin/TenantSearchBox.tsx` | New | Campo de busca + lista de resultados |
| 10 | `src/components/admin/TenantContextCard.tsx` | New | Cartão somente-leitura: prompt + guardrails |
| 11 | `src/components/admin/KnowledgeBaseEditor.tsx` | New | Textarea + salvar (upsert) |
| 12 | `src/components/admin/KnowledgeBaseDeleteDialog.tsx` | New | Confirmação de exclusão (`AdminDialog`) |
| 13 | `src/components/admin/AdminDashboard.tsx` | Modified | Orquestra os hooks/componentes acima |
| — | `src/components/admin/IngestForm.tsx` | Removed | Substituído por `KnowledgeBaseEditor` |
| — | `src/hooks/useAdminIngest.ts` (+ `.test.ts`) | Removed | Substituído por `useKnowledgeBase` |

Cada arquivo novo/modificado leva seu `*.test.ts(x)` correspondente (Constitution IV).

## Verificação manual (após implementação)

1. Acesse `/admin` com sessão administrativa ativa.
2. **Busca (US1)**: digite um termo parcial (nome ou ID) de um tenant existente e confirme que a lista de resultados aparece; selecione um tenant e confirme que o prompt aplicável (vinculado ou padrão) e os guardrails associados são exibidos.
3. **Busca sem resultado**: digite um termo sem correspondência e confirme o estado "Nenhum tenant encontrado" (sem erro).
4. **Base de conhecimento vazia (US2)**: selecione um tenant sem conteúdo cadastrado, confirme a mensagem de estado vazio, digite um texto e salve — confirme "Base de conhecimento salva com sucesso" e que o texto persiste ao reconsultar.
5. **Editar base existente (US2)**: selecione um tenant com conteúdo, altere o texto, salve e confirme a atualização refletida na tela.
6. **Excluir (US3)**: com um tenant que possui conteúdo, acione "Excluir", confirme no diálogo e verifique que a área volta ao estado vazio com a mensagem de sucesso.
7. **Trocar de tenant durante operação pendente**: inicie um salvamento, troque rapidamente de tenant antes da resposta chegar, e confirme que o resultado atrasado não sobrescreve os dados do novo tenant selecionado (FR-023).
8. **Falha de rede**: derrube o backend e repita busca/salvar/excluir — confirme a mensagem "Não foi possível conectar ao servidor. Verifique sua conexão." e que os dados exibidos são preservados.

## Rodando os testes

```bash
npm test
```

Cobre os novos hooks (`renderHook` + `fetch` mockado) e componentes (RTL, queries acessíveis) conforme Constitution IV.
