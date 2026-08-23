# Data Model: Ajuda de placeholders obrigatórios ao cadastrar prompt

Nenhuma entidade de backend é introduzida ou alterada. O único "dado" desta feature é um mapa estático embutido no bundle do frontend, consumido por `PromptPlaceholderHelp.tsx`.

## PromptPlaceholder

```ts
interface PromptPlaceholder {
  token: string;       // ex.: "{contexto_formatado}"
  required: boolean;    // sempre `true` nesta versão (ver Nota abaixo)
  description: string;  // explicação curta do que o placeholder representa
}
```

**Nota**: todo placeholder listado para `operational` e `institutional` é obrigatório (confirmado no ticket EDI-50); para `chitchat`, o único placeholder listado (`{guardrails}`) também é obrigatório. O campo `required` é mantido explícito (em vez de assumir "tudo que está na lista é obrigatório") para permitir, sem quebra de contrato, que um `node_type` futuro tenha placeholders opcionais — mas nesta versão nenhum valor `false` é usado.

## PromptPlaceholderHelpEntry (por `node_type`)

```ts
interface PromptPlaceholderHelpEntry {
  placeholders: PromptPlaceholder[];
  example: string; // texto multi-linha, placeholders posicionados corretamente
}

type PromptPlaceholderHelpMap = Record<NodeType, PromptPlaceholderHelpEntry>;
```

`NodeType` já existe em `src/services/promptManager.types.ts` (`"operational" | "institutional" | "chitchat"`) — reaproveitado, não redefinido.

## Conteúdo confirmado por `node_type` (fonte: ticket EDI-50)

### operational

| token | obrigatório |
|---|---|
| `{guardrails}` | sim |
| `{tenant_id}` | sim |
| `{contexto_formatado}` | sim |
| `{tabela_calendario_str}` | sim |
| `{hora_atual_str}` | sim |
| `{data_hoje_iso}` | sim |

### institutional

| token | obrigatório |
|---|---|
| `{guardrails}` | sim |
| `{historico_texto}` | sim |
| `{contexto_formatado}` | sim |
| `{pergunta_usuario}` | sim |

Exemplo (posicionamento igual ao fallback local `prompts/institutional_prompt.md`):

```text
--- CONVERSATION HISTORY ---
{historico_texto}

--- CONTEXT FROM KNOWLEDGE BASE ---
{contexto_formatado}

User Question: {pergunta_usuario}
```

### chitchat

| token | obrigatório |
|---|---|
| `{guardrails}` | sim |

Nenhum outro placeholder é listado — `{contexto_formatado}` e `{historico_texto}` não se aplicam a este nó (não confundir o admin, FR-004).

## `PromptPlaceholderHelp` (componente)

| Prop | Tipo | Descrição |
|---|---|---|
| `nodeType` | `NodeType` | Tipo selecionado no momento no formulário (`watch("node_type")` de `PromptFormModal.tsx`) |

Puramente derivado: `promptPlaceholderHelp[nodeType]` → renderiza lista de `placeholders` + bloco `example`. Sem estado interno, sem efeitos colaterais.
