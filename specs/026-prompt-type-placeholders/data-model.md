# Data Model: Placeholders obrigatórios por tipo de prompt + validação ao salvar (026)

Feature frontend-only: nenhuma entidade persistida nova e nenhuma mudança de contrato de API. Este documento descreve os tipos/dados em memória e as regras de validação.

## 1. Entidades existentes (sem alteração)

### Prompt (src/services/promptManager.types.ts)

- `id: string`
- `titulo: string`
- `conteudo: string` — alvo da validação de placeholders ao salvar
- `is_default: boolean`
- `node_type: NodeType` (`"operational" | "institutional" | "chitchat"`)
- `guardrail_ids: string[]` — vínculo N:N prompt↔guardrail; materializa "os guardrails do tipo" (cada prompt pertence a um tipo)

### Guardrail

- `id`, `titulo`, `conteudo`, `is_global: boolean`
- Globais (`is_global: true`) aparecem sempre na lista do seletor, com badge "Global".

### NodeType

- `"operational" | "institutional" | "chitchat"`

## 2. Dados estáticos movidos para `src/lib/promptPlaceholders.ts`

### PromptPlaceholder

| Campo | Tipo | Regra |
|---|---|---|
| `token` | string | texto literal `{...}` usado na verificação |
| `required` | boolean | somente obrigatórios são exibidos e validados |
| `description` | string | texto de ajuda |

### PromptPlaceholderHelpEntry

- `placeholders: PromptPlaceholder[]`
- `example: string`

### PromptPlaceholderHelpMap = Record<NodeType, PromptPlaceholderHelpEntry>

Listas obrigatórias (fonte única — spec FR-002/003/004):

| node_type | tokens obrigatórios (ordem de exibição) |
|---|---|
| operational | `{tenant_id}`, `{guardrails}`, `{tabela_calendario_str}`, `{hora_atual_str}`, `{data_hoje_iso}`, `{contexto_formatado}` |
| institutional | `{guardrails}`, `{historico_texto}`, `{contexto_formatado}`, `{pergunta_usuario}` |
| chitchat | `{guardrails}` |

### Funções puras (novas)

- `requiredPlaceholdersFor(nodeType: NodeType): string[]` — tokens com `required === true`, na ordem do mapa.
- `missingRequiredPlaceholders(content: string, nodeType: NodeType): string[]` — `requiredPlaceholdersFor(nodeType).filter(t => !content.includes(t))`. Verificação literal e sensível a maiúsculas/chaves (FR-006).

## 3. Estado transitório de tela (não persistido)

### MissingPlaceholdersAlert (estado + componente)

| Campo | Tipo | Nota |
|---|---|---|
| `missingTokens` | string[] | tokens ausentes listados no alerta |
| `onFix` | () => void | "Corrigir": fecha o alerta, formulário intacto |
| `onSaveAnyway` | () => void | "Salvar mesmo assim": prossegue o submit |

Regras de comportamento:

- Exibido somente no ato de salvar, quando `missingRequiredPlaceholders(...).length > 0`.
- Para `TenantLinkSection`, aplica-se apenas se `custom_content_override` (trim) não for vazio; o `nodeType` é a aba selecionada (`selectedNode`).
- Fluxo "Corrigir" não altera nenhum campo do formulário (FR-008 / US4-2).
- Fluxo "Salvar mesmo assim" executa o submit exatamente como o fluxo normal (FR-009).

## 4. Transições de estado

```text
Formulário aberto (create | edit)
  │
  ├─ troca node_type ──────────► re-render: ajuda de placeholders + seção de guardrails
  │                               (seleção guardrail_ids preservada; globais sempre visíveis)
  │
  └─ clique em salvar
       ├─ missing == [] ──────► submit normal (sucesso/erro da API como hoje)
       └─ missing.length > 0 ─► MissingPlaceholdersAlert
            ├─ "Corrigir" ─────► alerta fecha; formulário intacto
            └─ "Salvar mesmo assim" ─► submit normal
```

## 5. Validações (regras derivadas da spec)

- FR-006: `token` deve ocorrer literalmente (chaves e grafia idênticas) ≥ 1 vez.
- FR-010: validação usa conteúdo e `node_type` atuais no instante do clique em salvar.
- FR-016: override vazio não é validado.
- FR-014: nenhuma regra impeditiva no backend; o alerta é decisão do administrador.
