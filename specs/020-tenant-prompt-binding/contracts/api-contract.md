# API Contract — Vínculo obrigatório de prompt no tenant

**Feature**: `specs/020-tenant-prompt-binding/` | **Date**: 2026-08-22
**Fonte**: comentário de contrato no EDI-44 + decisões de refinamento do EDI-43
**Base URL**: `NEXT_PUBLIC_PYTHON_BACKEND_URL`
**Status**: acordado com o backend; **pendente de validação contra o serviço rodando** (ver `quickstart.md`)

Este documento descreve o contrato **do ponto de vista do frontend** — o que consumimos e como reagimos. O backend é o dono da definição; divergências encontradas na validação local mandam mais que este arquivo.

---

## 0. Envelope de erro

Erros de **regra de negócio** trazem `detail` como objeto:

```json
{
  "detail": {
    "code": "PROMPT_IN_USE_BY_TENANTS",
    "message": "Texto pronto para exibição ao admin.",
    "blockers": []
  }
}
```

**Regra inegociável**: o frontend decide o fluxo pelo `code`. O `message` é texto de UI e pode mudar a qualquer momento; o `code` é contrato.

O normalizador (`src/lib/apiError.ts`) precisa aceitar **três** formatos de `detail`:

| Formato | Quando | Tratamento |
|---|---|---|
| Objeto `{code, message, blockers}` | regra de negócio (400/404/409) | `code` dirige o comportamento; `blockers` vira lista na UI |
| Lista `[{loc, msg}, …]` | 422 de validação Pydantic | vira `fieldErrors`; `code` fica `undefined` |
| String | 500 legado (`DefaultPromptNotConfiguredError`) | vira `message`; `code` fica `undefined` |

`blockers` pode vir ausente ou `[]` — normalizar sempre para array.

### Tabela de códigos

| `code` | HTTP | Onde aparece |
|---|---|---|
| `PROMPT_NOT_FOUND` | 404 | criação de tenant, vínculo em massa |
| `PROMPT_NODE_TYPE_INVALID` | 400 | criação de tenant |
| `PROMPT_IN_USE_BY_TENANTS` | 409 | exclusão de prompt |
| `GUARDRAIL_IS_GLOBAL` | 409 | exclusão de guardrail |
| `GUARDRAIL_IN_USE_BY_TENANTS` | 409 | exclusão de guardrail |
| `TENANT_NOT_FOUND` | 404 | vínculo em massa |

---

## 1. `POST /api/v1/tenants/` — criação com prompt obrigatório *(alterado)*

Ganha `prompt_id`, referente ao prompt do nó **operacional**. Os nós `institutional` e `chitchat` não entram no cadastro.

**Request**

```json
{
  "tenant_id": "acme",
  "name": "Acme Ltda",
  "google_calendar_id": "acme@group.calendar.google.com",
  "allowed_domains": ["acme.com"],
  "prompt_id": "3f2a0000-0000-4000-8000-000000000001"
}
```

**Response 201** — objeto `Tenant`, como hoje.

**Erros**

| Situação | HTTP | `code` | Reação da UI |
|---|---|---|---|
| `prompt_id` ausente/vazio | 422 | *(lista Pydantic)* | Erro no campo de prompt. Zod já bloqueia antes; este é rede de segurança |
| `prompt_id` não existe | 404 | `PROMPT_NOT_FOUND` | Mensagem + recarregar a lista de prompts (sumiu entre a abertura e o envio) |
| `prompt_id` não é `operational` | 400 | `PROMPT_NODE_TYPE_INVALID` | Erro no campo: tipo de nó incompatível |

**Semântica**: transacional. Se o vínculo falhar, o tenant **não** é criado — a UI não precisa tratar tenant órfão.

**Nota**: `PUT /api/v1/tenants/{id}` (edição) **não** aceita `prompt_id`. Inalterado.

---

## 2. `GET /api/v1/prompt-manager/prompts?node_type=operational` *(filtro novo)*

Popula o combo do cadastro. A semeadura do EDI-43 garante que **nunca volta vazio**.

**Response 200** — array de `Prompt`, como hoje, restrito ao nó pedido. O campo `is_default` continua vindo, mas agora é **rótulo informativo**: identifica o padrão da plataforma na lista sem selecioná-lo (FR-004/FR-005).

---

## 3. `GET /api/v1/prompt-manager/prompts/{id}/tenants` *(novo)*

Tenants com vínculo ativo naquele prompt. Serve dois consumidores: o preview da associação em massa e a confirmação de exclusão de prompt.

**Response 200**

```json
{
  "prompt_id": "3f2a0000-0000-4000-8000-000000000001",
  "node_type": "operational",
  "tenants": [
    { "id": "acme", "name": "Acme Ltda" },
    { "id": "beta", "name": "Beta S.A." }
  ]
}
```

O formato de `tenants` é **idêntico** ao dos `blockers` do tipo tenant — de propósito, para o mesmo componente (`BlockerList`) servir aos dois casos, e para a lista que o admin vê ao aplicar em massa ser literalmente a mesma que veria ao tentar excluir.

| Situação | HTTP | `code` |
|---|---|---|
| Sucesso (inclusive lista vazia) | 200 | — |
| Prompt não existe | 404 | `PROMPT_NOT_FOUND` |

---

## 4. `POST /api/v1/prompt-manager/link-tenants` *(novo)*

Um prompt para N tenants em uma operação. O `POST /link-tenant` (singular) continua existindo, inalterado.

**Request**

```json
{
  "prompt_id": "3f2a0000-0000-4000-8000-000000000001",
  "tenant_ids": ["acme", "beta", "gama"],
  "custom_content_override": null
}
```

**Response 200**

```json
{
  "prompt_id": "3f2a0000-0000-4000-8000-000000000001",
  "node_type": "operational",
  "linked_count": 3,
  "tenant_ids": ["acme", "beta", "gama"]
}
```

**Semântica que a UI precisa comunicar antes da confirmação** (FR-026/FR-027):
- **All-or-nothing**: transacional. Um tenant inválido invalida a operação inteira.
- **Substitui** o vínculo anterior daquele `node_type` em cada tenant.
- Vínculos de **outros** `node_type` não são tocados.

**Erros**

| Situação | HTTP | `code` | Reação da UI |
|---|---|---|---|
| `tenant_ids` vazio | 422 | *(lista Pydantic)* | Zod bloqueia antes |
| Prompt não existe | 404 | `PROMPT_NOT_FOUND` | Mensagem + recarregar prompts |
| Um ou mais tenants não existem | 404 | `TENANT_NOT_FOUND` | `BlockerList` dos inexistentes + aviso explícito de que **nenhum** vínculo foi aplicado |

Exemplo de `TENANT_NOT_FOUND`:

```json
{
  "detail": {
    "code": "TENANT_NOT_FOUND",
    "message": "2 tenants informados não existem. Nenhum vínculo foi aplicado.",
    "blockers": [
      { "type": "tenant", "id": "inexistente-1" },
      { "type": "tenant", "id": "inexistente-2" }
    ]
  }
}
```

Note que `name` pode faltar aqui — o `BlockerList` cai no `id` quando não há nome.

---

## 5. `GET /api/v1/prompt-manager/tenant/{tenant_id}?node_type=operational` *(inalterado)*

Response model **não muda**. O que muda é o conteúdo: passa a refletir o que o agente recebe em runtime.

**Comportamento sem vínculo próprio** — o ponto que dirige o FR-013:

> HTTP **200 OK**, com `is_default_prompt: true` e os campos de prompt preenchidos com o **prompt padrão**, não com o do tenant.

Consequências para a UI:

| Campo | No estado sem vínculo | Uso |
|---|---|---|
| `is_default_prompt` | `true` | **Sinal de detecção** (via `isPromptBindingMissing`) — anomalia, não informação |
| `prompt_conteudo` | conteúdo do padrão | **NÃO exibir** como configuração vigente (FR-015) — o agente não vai carregá-lo |
| `prompt_titulo` / `prompt_id` | do padrão | idem — não apresentar como vínculo do tenant |
| `guardrails_associados` | corretos | **Exibir** (FR-016) — a proteção global continua valendo |

**Ponto cego conhecido**: no nó `institutional`, o overview recursa para o operacional e devolve `is_default_prompt` da resolução do operacional — herança fica indistinguível de vínculo próprio. Por isso a visão do tenant se restringe ao nó `operational` nesta entrega (FR-019).

**Não existe `binding_status`.** Foi discutido e descartado — sem ticket. A detecção fica isolada em `src/lib/promptBinding.ts` para que a troca do sinal, se um dia vier, seja uma edição só.

---

## 6. `DELETE /api/v1/prompt-manager/prompts/{id}` — bloqueio por uso *(alterado)*

| Situação | HTTP | `code` |
|---|---|---|
| Sucesso | 204 | — |
| Prompt não existe | 404 | — |
| Vínculo ativo com tenant | 409 | `PROMPT_IN_USE_BY_TENANTS` |

```json
{
  "detail": {
    "code": "PROMPT_IN_USE_BY_TENANTS",
    "message": "Este prompt está em uso por 3 tenants e não pode ser excluído. Vincule outro prompt a esses tenants antes de excluir.",
    "blockers": [
      { "type": "tenant", "id": "acme", "name": "Acme Ltda" },
      { "type": "tenant", "id": "beta", "name": "Beta S.A." }
    ]
  }
}
```

**UI**: listar os bloqueadores no modal, cada um com caminho para o fluxo de vínculo daquele tenant (FR-035) — o admin resolve na origem em vez de só ver "não pode".

**Nota sobre prompt órfão**: prompt sem vínculo ativo apaga com 204, sem atrito. É o que torna aceitável a decisão do FR-010 de deixar o órfão existir.

---

## 7. `DELETE /api/v1/prompt-manager/guardrails/{id}` — bloqueio duplo *(alterado)*

| Situação | HTTP | `code` |
|---|---|---|
| Sucesso | 204 | — |
| Guardrail não existe | 404 | — |
| `is_global = TRUE` | 409 | `GUARDRAIL_IS_GLOBAL` |
| Associado a prompt com tenant ativo | 409 | `GUARDRAIL_IN_USE_BY_TENANTS` |

**Precedência**: se ambas as condições valerem, o backend devolve `GUARDRAIL_IS_GLOBAL` (bloqueio mais forte).

São dois códigos distintos porque a ação de saída é diferente:

**`GUARDRAIL_IS_GLOBAL`** — desmarcar o global primeiro. A UI oferece a ação combinada "Desmarcar global e excluir": `PUT /guardrails/{id}` com `is_global: false`, seguido do `DELETE` (FR-036). Dois passos, um clique.

**`GUARDRAIL_IN_USE_BY_TENANTS`** — desassociar dos prompts. Bloqueadores do tipo prompt trazem `tenant_count`:

```json
{
  "detail": {
    "code": "GUARDRAIL_IN_USE_BY_TENANTS",
    "message": "Este guardrail está associado a 2 prompts em uso por tenants. Remova a associação antes de excluir.",
    "blockers": [
      { "type": "prompt", "id": "3f2a...", "name": "Atendimento Clínica", "tenant_count": 4 },
      { "type": "prompt", "id": "9b1c...", "name": "Atendimento Padrão", "tenant_count": 1 }
    ]
  }
}
```

Cuidado na ação combinada: se o `DELETE` posterior falhar (ex.: o guardrail também estava em uso), o `is_global` **já foi desmarcado**. A UI precisa informar isso — o estado mudou mesmo com a exclusão recusada.

---

## 8. O que **não** muda

- `POST /api/v1/prompt-manager/link-tenant` (singular) — inalterado; segue sendo o caminho da correção in-place e da tela de vínculo.
- `GET /api/v1/prompt-manager/guardrails` — inalterado.
- `GET /api/v1/tenants?q=&limit=` — inalterado; é a fonte do multi-select da associação em massa.
- `PUT /api/v1/tenants/{id}` — inalterado, sem `prompt_id`.
- Guardrail **não** vira obrigatório em lugar nenhum. O global semeado cobre todo tenant automaticamente.

---

## 9. Pendências conhecidas do contrato

1. **500 legado fora do envelope**: `DefaultPromptNotConfiguredError` ainda devolve `detail` como string. Caminho quase inalcançável depois da semeadura, mas é o motivo de o normalizador precisar suportar o terceiro formato.
2. **Sem `binding_status` nem `is_inherited`**: registrado como fora de escopo. Se a visão do tenant um dia precisar de precisão nos nós institucional/chitchat, `is_inherited` é o aditivo mais barato — não `binding_status`.
3. **Sem modo de simulação na massa**: o preview mostra quem já usa o prompt, não qual prompt cada destino perde. Compensado pelo aviso de substituição.
