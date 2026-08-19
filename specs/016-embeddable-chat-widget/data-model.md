# Data Model: Widget de Chat Embutível para Clientes

## Tenant (existente, backend Python externo — não modificado por esta feature em seu núcleo)

Fonte: `src/services/pythonBackend.types.ts` (`Tenant`), `specs/013-admin-tenant-management`.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `string` | Já usado como `X-Tenant-ID`; passa a ser também o identificador embutido na URL do snippet (`/widget/{id}`) |
| `name` | `string` | Nome do cliente/empresa |
| `google_calendar_id` | `string` | Não relacionado a esta feature |
| `allowed_domains` | `string[]` | Já usado pela API externa para validar a origem das chamadas — nenhuma mudança necessária aqui |
| `created_at` / `updated_at` / `deleted_at` | `string \| null` | Quando `deleted_at` estiver preenchido, o widget correspondente deve parar de funcionar (FR-009) — comportamento já esperado da API ao rejeitar `chat/init` de um tenant excluído |

## WidgetConfig (NOVO — depende de contrato futuro do backend, ver `contracts/tenant-widget-config-api.md`)

Representa a aparência básica configurável por tenant (FR-007, User Story 5 — P3). Não bloqueia o MVP.

| Campo | Tipo | Default quando ausente |
|---|---|---|
| `primary_color` | `string` (hex) | Cor de marca padrão do produto |
| `logo_url` | `string \| null` | Ícone padrão do produto |
| `greeting_message` | `string` | Mensagem de saudação padrão |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` |

## InstallationSnippet (computado, não persistido)

Não é uma entidade de banco — é uma string derivada, calculada no frontend admin a partir de `tenant.id` e de uma constante de ambiente (`WIDGET_BASE_URL`). Representada apenas em memória/UI (`TenantSnippet.tsx`).

```
<script src="{WIDGET_BASE_URL}/widget/{tenant.id}" async></script>
```

## WidgetSession (conceito já existente, reaproveitado sem alteração de contrato)

Reaproveita exatamente o fluxo de `specs/010-integrate-python-backend`:

| Campo | Tipo | Escopo |
|---|---|---|
| `accessToken` | `string` | Mantido apenas em memória dentro do módulo `state.ts` do widget — nunca persistido em `localStorage`/cookie |
| `thread_id` | `string` (UUID v4) | Persistido em `localStorage` **da origem do site do cliente** — isola conversas por site automaticamente, sem trabalho adicional |

## Relacionamentos

```
Tenant (1) ──── (0..1) WidgetConfig       # futuro — aparência opcional por tenant
Tenant (1) ──── (1) InstallationSnippet   # sempre computável a partir de tenant.id, não requer estado próprio
Tenant (1) ──── (N) WidgetSession         # uma sessão por navegador/visitante, efêmera
```
