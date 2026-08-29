# Quickstart: Placeholders obrigatórios por tipo + validação ao salvar (026)

## Como rodar

```bash
npm install          # se ainda não instalado
npm run dev          # Next.js dev server (Turbopack) — http://localhost:3000
npm test             # Jest --runInBand (testes unitários + RTL)
npm run lint         # ESLint
```

## Caminhos afetados (esperados)

| Arquivo | Mudança |
|---|---|
| `src/lib/promptPlaceholders.ts` | **novo** — mapa estático + `requiredPlaceholdersFor` + `missingRequiredPlaceholders` |
| `src/lib/promptPlaceholders.test.ts` | **novo** — testes unitários das funções puras |
| `src/components/admin/prompt-manager/promptPlaceholderHelp.ts` | **removido** — mapa movido para lib (imports atualizados) |
| `src/components/admin/prompt-manager/PromptPlaceholderHelp.tsx` | filtra somente obrigatórios; importa mapa da lib |
| `src/components/admin/prompt-manager/PromptPlaceholderHelp.test.tsx` | ajustes de import + casos "somente obrigatórios" |
| `src/components/admin/prompt-manager/MissingPlaceholdersAlert.tsx` | **novo** — overlay `role="alertdialog"` reutilizável |
| `src/components/admin/prompt-manager/MissingPlaceholdersAlert.test.tsx` | **novo** — RTL das duas ações e conteúdo |
| `src/components/admin/prompt-manager/PromptFormModal.tsx` | validação no submit + alerta; re-render de guardrails na troca de tipo |
| `src/components/admin/prompt-manager/PromptFormModal.test.tsx` | novos cenários de validação/troca de tipo |
| `src/components/admin/prompt-manager/TenantLinkSection.tsx` | validação do override no submit + alerta |
| `src/components/admin/prompt-manager/TenantLinkSection.test.tsx` | novos cenários de override |

## Verificação manual rápida (roteiro de aceite)

1. **Prompts Base → Novo Prompt**: trocar "Nó de Destino" entre os 3 tipos e conferir que a ajuda mostra exatamente: operacional (6), institucional (4), chitchat (somente `{guardrails}`).
2. **Validação**: com tipo Chitchat e conteúdo sem `{guardrails}`, salvar → alerta lista `{guardrails}`; "Corrigir" mantém tudo intacto; repetir e "Salvar mesmo assim" salva.
3. **Edição**: abrir prompt existente (ex.: institucional completo) → nenhum alerta ao salvar; apagar `{contexto_formatado}` e salvar → alerta cita apenas o ausente.
4. **Guardrails**: editar prompt com guardrails vinculados, trocar o tipo no dropdown → seleção permanece; guardrails globais continuam visíveis com badge "Global".
5. **Vincular Tenant**: buscar tenant, preencher customização sem o(s) obrigatório(s) da aba ativa → alerta ao vincular; vazio → salva sem alerta.

## Comandos de verificação (CI/qualidade)

```bash
npm test
npm run lint
```

## Notas

- Nenhuma mudança de API, de schema de zod de submit, ou de persistência.
- Strings novas seguem o padrão do módulo (português literal, como o restante de `prompt-manager`).
