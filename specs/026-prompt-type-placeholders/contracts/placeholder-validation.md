# Contracts: Validação de placeholders obrigatórios (026)

Feature frontend-only. Sem mudança de API REST. Os contratos abaixo são os contratos de UI/componente e de função pura que as telas e os testes devem seguir.

## 1. Contrato da função de validação (`src/lib/promptPlaceholders.ts`)

```ts
requiredPlaceholdersFor(nodeType: NodeType): string[]
missingRequiredPlaceholders(content: string, nodeType: NodeType): string[]
```

- Pura, síncrona, sem efeitos colaterais.
- Verificação literal: `content.includes(token)`; sensível a maiúsculas, espaços e chaves.
- `nodeType` inválido/imprevisto: comportamento defensivo — retornar lista vazia (nunca lançar), para não bloquear salvamento.
- Fonte única: `PromptPlaceholderHelpMap` no mesmo módulo (mesmos tokens usados na exibição e na validação).

## 2. Contrato do componente `MissingPlaceholdersAlert`

```ts
interface MissingPlaceholdersAlertProps {
  missingTokens: string[];
  onFix: () => void;
  onSaveAnyway: () => void;
}
```

- Papel/estado a11y: overlay interno do dialog com `role="alertdialog"` e `aria-label` descritivo (ex.: "Placeholders obrigatórios ausentes").
- Conteúdo obrigatório: mensagem indicando o tipo de prompt/nó afetado e a lista exata dos tokens ausentes (um por linha, em `code`).
- Ações (sempre ambas, nesta ordem): "Corrigir" (fecha o alerta) e "Salvar mesmo assim" (executa o submit pendente).
- Foco inicial no botão primário da ação segura ("Corrigir"), seguindo o padrão do `AdminDialog`.
- Não fecha o dialog pai; não altera nenhum campo do formulário.
- Estilo: Tailwind apenas, tokens existentes (`rounded-card`, `bg-surface-base`, `border-brand-primary/30`, etc.), conforme Constitution VI/VII.

## 3. Contrato da tela "Prompts Base" (`PromptFormModal`)

- Ajuda de placeholders: exibe somente `placeholders.filter(p => p.required)` do tipo selecionado (FR-001..004).
- Troca de "Nó de Destino": (a) ajuda atualiza lista e exemplo imediatamente; (b) seção de guardrails re-renderiza mantendo a seleção de `guardrail_ids` e sempre listando todos os guardrails disponíveis, com os globais (`is_global`) visíveis (FR-011/012).
- Salvar: roda `missingRequiredPlaceholders(conteudo, node_type)` com os valores atuais; se vazio → submit; senão → `MissingPlaceholdersAlert` (FR-005..010).
- Modos create e edit com comportamento idêntico (FR-013).

## 4. Contrato da tela "Vincular Tenant" (`TenantLinkSection`)

- Ao salvar vínculo com `custom_content_override` preenchido (após `trim()`): roda `missingRequiredPlaceholders(override, selectedNode)`; se ausente algo → `MissingPlaceholdersAlert`; senão → link normal (FR-015).
- Override vazio: nenhuma validação (FR-016).
- "Corrigir" preserva tenant_id, prompt_id, override e aba selecionada; "Salvar mesmo assim" prossegue o link (US4-2/3).

## 5. Comportamentos fora de contrato (não fazer)

- Não bloquear o submit além do alerta (sem erro de zod adicional para placeholders).
- Não adicionar botões de inserir/copiar exemplo (seção continua somente-leitura).
- Não alterar payloads de `createPrompt`/`updatePrompt`/`linkTenantToPrompt`.
