# Phase 0 Research: Ajustes de Usabilidade no Painel Administrativo (Fase 1)

## 1. Modal não fecha com ESC / sem backdrop

**Decision**: Corrigir `AdminDialog` para abrir via `dialogRef.current.showModal()` (imperativo, em `useEffect`) em vez de renderizar o atributo `open` diretamente no JSX.

**Rationale**: O elemento nativo `<dialog>` só dispara o evento `cancel` (acionado pela tecla ESC), renderiza o pseudo-elemento `::backdrop` e aplica *focus containment* quando aberto via `showModal()`. Definir apenas o atributo `open` deixa o dialog visível porém **não-modal**: sem ESC, sem backdrop, sem bloqueio de interação com o conteúdo atrás — exatamente os três sintomas relatados. É uma correção de uma linha com efeito em ~8 pontos de uso (`PromptFormModal`, `GuardrailFormModal`, `TenantForm` (via `TenantManagement`), `TenantDeleteDialog`, `KnowledgeBaseDeleteDialog`, confirmações inline de `PromptList`/`GuardrailList`).

**Alternatives considered**:
- Listener manual de `keydown` para `"Escape"` + overlay customizado — rejeitado: duplica o que o elemento nativo já oferece de graça quando usado corretamente, e diverge da Principle VII (semântica nativa preferível a reimplementação).
- Biblioteca headless de dialog (ex. Radix) — rejeitado: nenhuma dependência nova é necessária; a Constitution não favorece deps adicionais sem justificativa.

## 2. O teste atual de `AdminDialog` dá falsa confiança

**Decision**: Reescrever `AdminDialog.test.tsx` para dar `showModal()`/ESC real (via `userEvent.keyboard("{Escape}")` após o dialog estar de fato aberto), em vez de disparar manualmente um `Event("cancel")` sintético.

**Rationale**: O teste hoje faz `fireEvent(dialog, new Event("cancel", { cancelable: true }))`, o que aciona o handler `onCancel` diretamente — independente de o dialog ter sido aberto via `showModal()` ou não. Por isso o teste passa mesmo com o bug em produção: ele nunca exercitou o caminho real do navegador. O teste corrigido deve falhar contra o código atual (prova de regressão) e passar após a correção do item 1.

## 3. Onde implementar a confirmação de "alterações não salvas"

**Decision**: Adicionar prop opcional `hasUnsavedChanges?: boolean` ao `AdminDialog`. Quando `true`, fechar via ESC, clique no backdrop ou botão "X" primeiro abre uma confirmação inline ("Descartar alterações?") dentro do próprio `AdminDialog`, em vez de chamar `onClose` direto. Quando `false`/omitido (caso dos modais de confirmação de exclusão, que não têm formulário), o fechamento continua imediato.

**Rationale**: Centraliza o padrão uma única vez (Principle III — DRY/Componentização) em vez de reimplementá-lo em cada modal de formulário.

**Origem do valor de `hasUnsavedChanges` por modal**:
- `PromptFormModal` / `GuardrailFormModal`: já possuem `useForm` próprio envolvendo o `AdminDialog` — basta repassar `formState.isDirty` direto, sem novo estado.
- `TenantForm`: é renderizado como filho do `AdminDialog` dentro de `TenantManagement.tsx` (o `AdminDialog` não sabe do form interno). `TenantForm` ganha um prop `onDirtyChange?: (dirty: boolean) => void`, chamado via `useEffect` observando `formState.isDirty`; `TenantManagement` guarda esse valor em `useState` e repassa como `hasUnsavedChanges` ao `AdminDialog`.
- Modais somente de confirmação (`TenantDeleteDialog`, `KnowledgeBaseDeleteDialog`, confirmações inline de `PromptList`/`GuardrailList`): não passam a prop — sem campo editável, não há "alteração não salva" a proteger.

**Alternatives considered**: lógica de confirmação duplicada em cada modal de formulário — rejeitado por duplicação (Principle III).

## 4. Componentização do botão "Excluir" discreto

**Decision**: Extrair um componente `DeleteAction` (botão estilo link/texto, ícone opcional, mesmo padrão visual em todo o admin) e substituir as 4 implementações ad-hoc atuais: `PromptList`, `GuardrailList`, `TenantDetails`, `KnowledgeBaseEditor`.

**Rationale**: Principle III exige componentização de padrões visuais repetidos; hoje existem 4 variações levemente diferentes do mesmo botão. Consolidar resolve o requisito (FR-006) e remove duplicação ao mesmo tempo — sem tocar no fluxo de confirmação já existente em cada tela (que é preservado).

## 5. Componentização da badge "Global"

**Decision**: Extrair um componente `GuardrailScopeBadge` (rótulo único "Global" + tooltip acessível) e substituir as 4 renderizações atuais divergentes: `"(G)"` em `PromptList`, `"Global"/"Específico"` em `GuardrailList`, `"Global"` no seletor de `PromptFormModal`, `"Global"` em `TenantLinkSection`.

**Rationale**: Resolve FR-010 (rótulo consistente) e FR-011 (tooltip explicativo) numa única implementação testável, em vez de 4 pontos divergentes. Não existe componente de tooltip reutilizável no projeto hoje — será criado como parte deste componente (Tailwind-only, sem lib nova, acessível via `title`/`aria-describedby` + exibição no `:focus-visible` para suportar teclado, não apenas `:hover`).

**Alternatives considered**: usar apenas o atributo HTML `title` nativo — rejeitado como única solução porque não é acessível via teclado/leitor de tela de forma consistente entre navegadores; um pequeno wrapper com `aria-describedby` resolve isso sem dependência nova.

## 6. Busca/filtro em Prompts Base

**Decision**: Filtro 100% client-side — `useState<string>` local em `PromptList` + `.filter()` sobre o array `prompts` já carregado por `usePrompts` (comparação normalizada: minúsculas, sem acentos).

**Rationale**: Principle II permite `useState` local para "comportamento de UI exclusivo do componente"; `usePrompts` já carrega a lista inteira, então não há round-trip de rede a otimizar. Escala atual do catálogo (dezenas de prompts) não justifica debounce nem busca no servidor.

**Alternatives considered**: parâmetro de busca no backend — rejeitado, fora de escopo (exigiria mudança de contrato de API) e desnecessário para o volume atual.

## 7. Diferenciar prompts com título duplicado

**Decision**: Reaproveitar a badge de nó (`NODE_LABELS[p.node_type]`) já renderizada em `PromptList` como diferenciador primário. Para o caso de desempate (mesmo título **e** mesmo nó), anexar um fragmento curto do `id` do prompt (já disponível, sem mudança de schema) como identificador complementar.

**Rationale**: `Prompt`/`Guardrail` (`src/services/promptManager.types.ts`) não têm campo `updated_at`/`created_at` para usar como diferenciador; `id` é o único campo estável já disponível para desempate sem mudança de contrato de API.

## 8. Campo "Atualizado em" vazio

**Decision**: Alterar apenas a mensagem usada especificamente para `tenant.updated_at` quando nulo (de "Não informado" para "Nunca atualizado"), sem alterar o helper genérico `formatDate` usado por `created_at`/`deleted_at`.

**Rationale**: `created_at` e `deleted_at` não devem, na prática, ficar nulos (são preenchidos pelo backend no momento do evento correspondente); mudar a mensagem genérica poderia introduzir um texto enganoso caso esses campos apareçam vazios por outro motivo. Escopo do FR-012 é especificamente "Atualizado em".

## Resumo de dependências

Nenhuma dependência nova. Todas as decisões usam apenas o que já está no `package.json` (`react-hook-form`, `zod`, `lucide-react`, `sonner`, `tailwindcss`, `jest`, `@testing-library/react`).
