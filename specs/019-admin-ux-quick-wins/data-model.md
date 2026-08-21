# Phase 1 Data Model: Ajustes de Usabilidade no Painel Administrativo (Fase 1)

Esta feature é puramente de interface — nenhuma entidade persistida (`Tenant`, `Prompt`, `Guardrail`, `TenantPromptDetail`) ganha campo novo, e nenhum contrato de API é alterado. O que muda são estados de UI locais, descritos abaixo para referência de implementação/testes.

## Estados de UI introduzidos

### `ModalCloseState` (interno a `AdminDialog`)

| Campo | Tipo | Descrição |
|---|---|---|
| `pendingDiscardConfirm` | `boolean` | `true` quando o usuário tentou fechar (ESC, backdrop ou "X") um modal com `hasUnsavedChanges=true`; exibe a confirmação inline antes de chamar `onClose`. |

Transições:
- `false → true`: usuário aciona fechamento e `hasUnsavedChanges === true`.
- `true → false` (descarta): usuário confirma "Descartar" → chama `onClose()` normalmente.
- `true → false` (mantém): usuário cancela a confirmação → modal permanece aberto, sem side-effects.
- Fechamento direto (sem passar por `true`) quando `hasUnsavedChanges` é `false`/omitido.

### `PromptSearchState` (interno a `PromptList`)

| Campo | Tipo | Descrição |
|---|---|---|
| `query` | `string` | Termo digitado no campo de busca; lista renderizada é `prompts.filter(...)` sobre esse valor, normalizado (lowercase, sem acento). |

Não é persistido nem enviado ao backend.

### `TenantForm` → `AdminDialog` (dirty bridge)

| Campo/Callback | Tipo | Descrição |
|---|---|---|
| `onDirtyChange` | `(dirty: boolean) => void` | Novo prop opcional de `TenantForm`; disparado via `useEffect` observando `formState.isDirty` do `useForm` interno. Consumido por `TenantManagement`, que guarda o valor em `useState` e repassa como `hasUnsavedChanges` ao `AdminDialog` que envolve o formulário. |

## Componentes novos (sem estado persistido, apenas apresentação)

### `DeleteAction`

Substitui as 4 implementações atuais de botão "Excluir" (`PromptList`, `GuardrailList`, `TenantDetails`, `KnowledgeBaseEditor`) por um único componente de baixo peso visual (estilo link/texto). Não contém lógica de confirmação — cada chamador continua responsável por abrir seu próprio modal de confirmação já existente.

Props: `label` (texto, default "Excluir"), `onClick`, `disabled?`.

### `GuardrailScopeBadge`

Substitui as 4 renderizações divergentes da badge de guardrail global (`"(G)"` / `"Global"` / `"Específico"`) por um único componente com rótulo padronizado e tooltip acessível.

Props: `isGlobal: boolean`.

## Sem mudanças

- `Tenant`, `Prompt`, `Guardrail`, `TenantPromptDetail` (tipos em `src/services/pythonBackend.types.ts` e `src/services/promptManager.types.ts`) permanecem inalterados.
- Nenhum endpoint novo ou alterado.
