# Quickstart — Vínculo obrigatório de prompt no tenant

**Feature**: `specs/020-tenant-prompt-binding/` | **Date**: 2026-08-22
**Branch**: `edilsonaandrade/edi-44-frontend-vinculo-obrigatorio-de-prompt-no-cadastro-de-tenant`

Roteiro de verificação. A parte 1 fecha o principal risco do plano — o contrato foi acordado no ticket mas **não** validado contra o serviço rodando. Fazer isso **antes** de escrever código economiza retrabalho: qualquer divergência aqui muda os tipos e os mocks.

---

## Pré-requisitos

```bash
# Backend (repositório agendamento-ia) rodando localmente com o EDI-43 aplicado
# Frontend
npm install
```

O frontend precisa de `NEXT_PUBLIC_PYTHON_BACKEND_URL` apontando para o backend local (`.env.local`).

```bash
npm run dev     # http://localhost:3000
npm test        # suíte completa, --runInBand
npm run lint
```

Admin em `http://localhost:3000/pt-BR/admin`.

---

## Parte 1 — Validar o contrato antes de codar

Com `BASE` = URL do backend local. Cada passo confirma um item do `contracts/api-contract.md`.

### 1.1 Filtro por node_type e prompt semente

```bash
curl -s "$BASE/api/v1/prompt-manager/prompts?node_type=operational" | jq '.[] | {id, titulo, node_type, is_default}'
```

**Esperado**: lista não vazia, todos com `node_type: "operational"`, ao menos um com `is_default: true`.
**Se falhar**: se o filtro for ignorado e vierem os três nós, o combo precisa filtrar no cliente — anotar e ajustar o plano.

### 1.2 Tenants de um prompt (endpoint novo)

```bash
curl -s "$BASE/api/v1/prompt-manager/prompts/<PROMPT_ID>/tenants" | jq
```

**Esperado**: `{prompt_id, node_type, tenants: [{id, name}]}`.
**Verificar**: o formato de `tenants` bate com o dos `blockers` do 409? É a premissa do reuso do `BlockerList` (FR-038).

### 1.3 Criação de tenant sem `prompt_id`

```bash
curl -s -X POST "$BASE/api/v1/tenants/" -H 'Content-Type: application/json' \
  -d '{"tenant_id":"qa-sem-prompt","name":"QA","google_calendar_id":"x@g.com","allowed_domains":["qa.com"]}' | jq
```

**Esperado**: 422 com `detail` em **lista** (Pydantic). Confirma o formato 2 do normalizador.

### 1.4 Criação com `prompt_id` de nó errado

```bash
curl -s -X POST "$BASE/api/v1/tenants/" -H 'Content-Type: application/json' \
  -d '{"tenant_id":"qa-node","name":"QA","google_calendar_id":"x@g.com","allowed_domains":["qa.com"],"prompt_id":"<ID_DE_PROMPT_INSTITUCIONAL>"}' | jq
```

**Esperado**: 400 com `detail.code == "PROMPT_NODE_TYPE_INVALID"`. Confirma o formato 1.

### 1.5 Criação válida

```bash
curl -s -X POST "$BASE/api/v1/tenants/" -H 'Content-Type: application/json' \
  -d '{"tenant_id":"qa-ok","name":"QA OK","google_calendar_id":"x@g.com","allowed_domains":["qa.com"],"prompt_id":"<ID_OPERACIONAL>"}' | jq
```

**Esperado**: 201. Em seguida, o overview deve refletir o vínculo:

```bash
curl -s "$BASE/api/v1/prompt-manager/tenant/qa-ok?node_type=operational" | jq '{prompt_id, prompt_titulo, is_default_prompt}'
```

**Esperado**: `is_default_prompt: false` e `prompt_id` igual ao enviado.

### 1.6 ⚠️ O sinal de detecção — o passo mais importante

Com um tenant **sem vínculo operacional** (criado antes da mudança, ou com o vínculo removido no banco):

```bash
curl -s "$BASE/api/v1/prompt-manager/tenant/<TENANT_SEM_VINCULO>?node_type=operational" | jq
```

**Esperado**: HTTP **200**, `is_default_prompt: true`, campos de prompt preenchidos com o **padrão**, `guardrails_associados` populado com os globais.

**Se vier 404 ou erro**: o FR-013 muda de forma — `isPromptBindingMissing` passa a operar sobre o resultado da chamada, não sobre o payload. Ajustar `promptBinding.ts` e o plano antes de seguir. **Este é o cenário que mais impacta o design.**

### 1.7 Vínculo em massa

```bash
curl -s -X POST "$BASE/api/v1/prompt-manager/link-tenants" -H 'Content-Type: application/json' \
  -d '{"prompt_id":"<ID_OPERACIONAL>","tenant_ids":["qa-ok","inexistente-1"]}' | jq
```

**Esperado**: 404 com `detail.code == "TENANT_NOT_FOUND"` e `blockers` listando `inexistente-1`.
**Confirmar em seguida** que `qa-ok` **não** foi alterado — é a garantia all-or-nothing que a UI vai anunciar ao admin. Se houve aplicação parcial, o texto da confirmação está mentindo e precisa mudar.

Depois, o caminho feliz:

```bash
curl -s -X POST "$BASE/api/v1/prompt-manager/link-tenants" -H 'Content-Type: application/json' \
  -d '{"prompt_id":"<OUTRO_ID_OPERACIONAL>","tenant_ids":["qa-ok"]}' | jq
```

**Esperado**: 200 com `linked_count: 1`.

### 1.8 Bloqueios de exclusão

```bash
curl -s -X DELETE "$BASE/api/v1/prompt-manager/prompts/<PROMPT_EM_USO>" | jq       # 409 PROMPT_IN_USE_BY_TENANTS + blockers
curl -s -X DELETE "$BASE/api/v1/prompt-manager/guardrails/<GUARDRAIL_GLOBAL>" | jq # 409 GUARDRAIL_IS_GLOBAL
curl -s -X DELETE "$BASE/api/v1/prompt-manager/prompts/<PROMPT_ORFAO>"             # 204
```

O último confirma a premissa do FR-010: prompt órfão apaga sem atrito.

### Registro do resultado

Anotar as divergências no fim deste arquivo, na seção "Resultado da validação". Divergência encontrada aqui manda mais que o `api-contract.md`.

---

## Parte 2 — Verificação manual da UI

Após a implementação. Cada item mapeia um critério de aceite.

### Cadastro (US1)

- [ ] Abrir "Novo tenant": existe campo **Prompt**, obrigatório, **vazio**. Nada pré-selecionado — nem o padrão. *(FR-004)*
- [ ] Na lista, o prompt padrão tem rótulo visível identificando-o como padrão, **sem** estar marcado. *(FR-005)*
- [ ] Preencher tudo menos o prompt e salvar: bloqueado, com mensagem que **explica o porquê** (não só "campo obrigatório"). *(FR-002)*
- [ ] Escolher um prompt: dá para ver qual é e trocar sem sair do formulário. *(FR-006)*
- [ ] "Criar novo a partir de…": o editor abre com o conteúdo do modelo, editável. *(FR-007)*
- [ ] **O texto pré-preenchido contém `{guardrails}` literal**, não a lista de proteções expandida. *(FR-008 — o item de maior impacto silencioso)*
- [ ] Apagar o `{guardrails}` do editor: aparece aviso não bloqueante; ainda dá para salvar. *(R-004)*
- [ ] Salvar com prompt novo: tenant criado e o prompt aparece na aba Prompts.
- [ ] Forçar falha no tenant (ID duplicado) com prompt novo: erro exibido, prompt permanece na biblioteca, mensagem informa que ele está disponível para nova tentativa. *(FR-010)*
- [ ] Repetir o salvamento após esse erro: **não** cria um segundo prompt.
- [ ] Abrir "Editar tenant": **não** há campo de prompt. *(FR-011)*

### Estado de erro e correção (US2)

- [ ] Consultar tenant **com** vínculo: título do prompt exibido, sem alerta. *(FR-012)*
- [ ] Consultar tenant **sem** vínculo: alerta de erro de configuração, visualmente distinto de estado saudável. *(FR-013)*
- [ ] Nesse estado, o conteúdo do prompt padrão **não** aparece como configuração vigente. *(FR-015)*
- [ ] Nesse estado, os guardrails continuam listados. *(FR-016)*
- [ ] Acionar "Vincular prompt" no alerta: escolher e confirmar sem sair da tela; o alerta some. *(FR-017/FR-018)*
- [ ] Recarregar a página: o estado corrigido persiste (veio do servidor, não de suposição local).

### Associação em massa (US3)

- [ ] Na aba Prompts, um prompt oferece "Aplicar a estes tenants". *(FR-023)*
- [ ] Buscar e marcar vários tenants; os selecionados aparecem como chips removíveis. *(FR-024)*
- [ ] A confirmação separa "já usam" de "serão alterados". *(FR-025)*
- [ ] A confirmação diz explicitamente que **substitui** o vínculo anterior e é **tudo-ou-nada**, e que outros nós não são afetados. *(FR-026/FR-027)*
- [ ] Confirmar sem nenhum selecionado: bloqueado. *(FR-028)*
- [ ] Sucesso: mensagem com a quantidade vinculada. *(FR-029)*
- [ ] Incluir um tenant inexistente: erro lista os problemáticos e deixa claro que **nada** foi aplicado. *(FR-030)*
- [ ] A aba "Vincular Tenant" (individual) segue funcionando como antes. *(FR-031)*

### Guardrails globais (US4)

- [ ] Na visão do tenant, globais e do prompt estão visualmente separados. *(FR-020)*
- [ ] Os globais indicam que são automáticos e não removíveis dali. *(FR-021)*
- [ ] Tenant sem proteções do prompt: os globais continuam listados.
- [ ] O conjunto exibido bate com o `guardrails_associados` do overview — conferir com `curl`. *(FR-022/SC-007)*

### Recusas de exclusão (US5)

- [ ] Excluir prompt em uso: tenants bloqueadores listados nominalmente. *(FR-034)*
- [ ] Clicar num bloqueador leva ao fluxo de vínculo daquele tenant. *(FR-035)*
- [ ] Excluir guardrail global: oferece "Desmarcar global e excluir"; a ação funciona. *(FR-036)*
- [ ] Guardrail global **e** em uso: aparece o bloqueio de global, não o de uso.
- [ ] Se o DELETE falhar depois de desmarcar o global: a UI informa que o `is_global` já foi alterado.
- [ ] Excluir guardrail em uso: prompts bloqueadores listados com a contagem de tenants. *(FR-037)*
- [ ] Excluir prompt sem vínculo: conclui normalmente.

### Erros e a11y (transversal)

- [ ] Derrubar o backend e tentar cada operação: mensagem utilizável, nenhuma tela quebrada. *(FR-033)*
- [ ] Nenhum log de console contém conteúdo de prompt ou override. *(FR-039)*
- [ ] Navegar o cadastro e o multi-select só pelo teclado.
- [ ] Alertas de erro anunciados por leitor de tela (`role="alert"`).

---

## Parte 3 — Portões de qualidade

```bash
npm test && npm run lint && npm run build
```

Da constituição (todos obrigatórios para merge):

- [ ] Nenhum `fetch` em arquivo `.tsx`.
- [ ] Zero `any`.
- [ ] Todo hook novo com teste `renderHook`; todo componente interativo com RTL e queries acessíveis; AAA; API mockada.
- [ ] Sem `dangerouslySetInnerHTML`; entradas validadas com Zod.
- [ ] Estilos só com Tailwind; hover ≤ 1.05.

---

## Resultado da validação

> Preencher ao executar a Parte 1.

| Passo | Resultado | Divergência do contrato |
|---|---|---|
| 1.1 filtro node_type | ⬜ | |
| 1.2 prompts/{id}/tenants | ⬜ | |
| 1.3 422 lista | ⬜ | |
| 1.4 PROMPT_NODE_TYPE_INVALID | ⬜ | |
| 1.5 criação válida | ⬜ | |
| **1.6 sinal de detecção** | ⬜ | |
| 1.7 massa all-or-nothing | ⬜ | |
| 1.8 bloqueios de exclusão | ⬜ | |
