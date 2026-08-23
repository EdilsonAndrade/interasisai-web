# Data Model: Guia de onboarding para cadastro de tenant

Nenhuma entidade de backend é introduzida. O único "dado" desta feature é estado local do navegador (localStorage), descrito abaixo como contrato interno consumido por `useOnboardingGuide.ts` / `onboardingGuideStorage.ts`.

## OnboardingStepId

Enum fixo com os 8 passos do checklist, na ordem definida em `spec.md` (FR-003):

```ts
type OnboardingStepId =
  | "operational_prompt"
  | "institutional_prompt"
  | "chitchat_prompt"
  | "identity_guardrail"
  | "adjust_guardrails"
  | "link_tenant_prompts"
  | "knowledge_base"
  | "client_site_test";
```

## GuideDisabledFlag

| Campo | Tipo | Descrição |
|---|---|---|
| `localStorage` key | `"onboarding_guide_disabled"` | Chave única, string `"true"`/ausente |

- Global ao navegador (não por tenant, não por usuário autenticado) — decisão confirmada com o usuário.
- Ausência da chave (ou qualquer valor ≠ `"true"`) equivale a guia ativo (comportamento padrão para quem nunca interagiu).
- Setada para `"true"` quando o usuário escolhe "desativar o guia" na primeira exibição (FR-006/FR-007).
- Removida (ou setada de volta) quando o usuário reativa manualmente (FR-010).

## OnboardingGuideProgress (por tenant)

| Campo | Tipo | Descrição |
|---|---|---|
| `localStorage` key | `` `onboarding_guide_progress:${tenantId}` `` | Uma chave por tenant cujo cadastro foi acompanhado pelo guia |
| valor serializado | `OnboardingStepId[]` | Lista dos passos já marcados como concluídos para aquele tenant |

- Criada/atualizada a cada marcação de item no painel (FR-004).
- Lida ao reabrir o guia para o mesmo tenant no mesmo navegador (Edge Case "fechar a aba com checklist parcial").
- Nenhuma validação contra o backend — a lista reflete apenas o que o usuário marcou manualmente (Assumption em `spec.md`).
- Não há expiração/limpeza automática nesta versão; um tenant "concluído" simplesmente não é mais reaberto pelo fluxo normal (o guia só é disparado por um novo cadastro).

## Estado exposto pelo Context (`OnboardingGuideContext`)

| Campo | Tipo | Descrição |
|---|---|---|
| `isEnabled` | `boolean` | Espelha o inverso de `GuideDisabledFlag` |
| `activeTenantId` | `string \| null` | Tenant cujo checklist está sendo exibido no momento (`null` = painel fechado) |
| `completedSteps` | `OnboardingStepId[]` | Progresso do `activeTenantId` atual |
| `openGuide(tenantId: string)` | função | Abre o painel para um tenant recém-criado, carregando progresso salvo (se houver) |
| `closeGuide()` | função | Fecha/minimiza o painel sem apagar o progresso salvo |
| `markStepComplete(stepId: OnboardingStepId)` | função | Marca um item, persiste via `onboardingGuideStorage.ts` |
| `disableGuide()` | função | Seta `GuideDisabledFlag`, fecha o painel |
| `reEnableGuide()` | função | Remove `GuideDisabledFlag` (Edge Case de reativação, FR-010) |

Toda leitura/escrita passa por `onboardingGuideStorage.ts`, que nunca lança (fallback em memória — ver `research.md` item 4), garantindo que o Context nunca fica em estado inconsistente por falha de storage.
