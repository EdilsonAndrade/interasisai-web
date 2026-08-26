# Quickstart: Limite de mensagens por tenant — UI Admin (EDI-63)

**Date**: 2026-08-25 | **Feature Branch**: `edilsonaandrade/edi-63-limite-de-mensagens-por-tenant-mensal-flag-byok-com-chave-de`

## Overview

Este guia acelera a implementação da UI admin do EDI-63. Assume que você já tem:
- Backend (repo `agendamento-ia`, branch `edilsonaandrade/edi-63-...`) rodando localmente ou em staging
- Node.js 18+ e `npm` instalados
- Repo `interasisai-web` clonado e na branch `edilsonaandrade/edi-63-...`

## Environment Setup

### 1. Backend URL Configuration

Certifique-se de que `src/services/pythonBackend.ts` aponta para o backend correto:

```typescript
// src/services/pythonBackend.ts
const BASE_URL = process.env.REACT_APP_PYTHON_BACKEND_URL || "http://localhost:8000/api/v1";
```

No `.env.local`:

```bash
REACT_APP_PYTHON_BACKEND_URL=http://localhost:8000/api/v1
```

### 2. Install Dependencies

```bash
npm install
```

Nenhuma nova dependência é necessária (React Hook Form, Zod, Axios, Tailwind já estão presentes).

### 3. Start Dev Server

```bash
npm run dev
```

Acesse `http://localhost:3000/[locale]/admin/tenants` (substitua `[locale]` por `pt-BR` ou outro suportado).

## Phase 2: Tasks Execution

Use `specs/024-tenant-message-limit-admin-ui/tasks.md` (gerado via `/speckit-tasks` ou manualmente) para rastrear o progresso. Ordem sugerida:

### Layer 1: Types & Schemas (não-bloqued)

- [ ] Estender `pythonBackend.types.ts` com tipos de `TenantUsage`, `TenantMessageLimitConfig`, `GlobalRecipient[Create|Update]`
- [ ] Criar `tenantUsageSchemas.ts` com Zod schemas para validação
- [ ] Criar `globalRecipientsSchemas.ts` com Zod schemas
- [ ] Estender `tenantSchemas.ts` com campos novos (`monthly_message_limit`, `notification_emails`)

### Layer 2: Custom Hooks (bloqueia UI)

- [ ] Implementar `useGetTenantUsage.ts` + testes
- [ ] Implementar `useGetMessageLimitConfig.ts` + testes
- [ ] Implementar `useGlobalRecipientsManager.ts` + testes
- [ ] Estender `pythonBackend.ts` com métodos para novos endpoints

### Layer 3: Reusable Components (US1 parcial)

- [ ] Implementar `<EmailListEditor />` (add/remove e-mails) + testes
- [ ] Implementar `<TenantUsageIndicator />` (display com cores) + testes

### Layer 4: Feature Components (US1 + US2 + US3)

- [ ] Estender `TenantForm.tsx` (add fields + EmailListEditor) + estender testes
- [ ] Estender `TenantDetails.tsx` (add TenantUsageIndicator) + estender testes
- [ ] Criar `GlobalNotificationRecipients.tsx` (CRUD UI) + testes (US2)
- [ ] Criar página `app/[locale]/admin/global-settings/page.tsx` com GlobalNotificationRecipients + calculadora (US2 + US3)

### Layer 5: Polish & Navigation

- [ ] Estender `AdminNavigation.tsx` com link para "Configurações Globais"
- [ ] Adicionar metadata de SEO na página de global-settings
- [ ] End-to-end test: criar tenant com limite, editar, visualizar consumo, gerenciar destinatários globais

## Manual Testing Checklist

### US1: Configuração de Tenant + Indicador de Consumo

**Setup**: Tenant `test-tenant` já existe no backend com algum uso registrado.

1. **Editar tenant**:
   - [ ] Abrir `GET /admin/tenants` → procurar `test-tenant` → clique "Editar"
   - [ ] No formulário, rolar até "Limite de mensagens por tenant"
   - [ ] Preencher `monthly_message_limit = 500`
   - [ ] Adicionar 2 e-mails em `notification_emails`: `manager@buffet.com`, `support@buffet.com`
   - [ ] Clicar "Salvar"
   - [ ] Verificar `PUT /tenants/{id}` é chamado com campos corretos
   - [ ] Página atualiza; abrir novamente e confirmar valores persistiram

2. **Visualizar consumo**:
   - [ ] Na tela de detalhes do tenant, rolar até indicador de consumo
   - [ ] Verificar: `GET /tenants/{id}/usage` é chamado
   - [ ] Se consumo < 50%: verde
   - [ ] Se consumo 50-80%: amarelo
   - [ ] Se consumo ≥ 80%: vermelho
   - [ ] Se sem limite: estado neutro ("Sem limite configurado")
   - [ ] Formato: "156 / 500 (31%)" ou "0 / 500 (0%)" ou "sem limite"

3. **Falha de rede no indicador**:
   - [ ] Mock `GET /tenants/{id}/usage` para retornar erro
   - [ ] Reabrir página de detalhes
   - [ ] Indicador mostra estado de erro ("Indisponível"), sem quebrar resto da página

### US2: Configurações Globais

**Setup**: Página de admin acessível.

1. **Listar destinatários globais**:
   - [ ] Navegar para "Configurações Globais" (novo link em AdminNavigation)
   - [ ] Verificar `GET /global-notification-recipients/` é chamado
   - [ ] Lista apareça (ou mensagem "Vazio; usando fallback contato@interasisai.com.br")

2. **Criar novo destinatário**:
   - [ ] Preencher e-mail: `alerts@interasisai.com.br`
   - [ ] Clicar "Adicionar"
   - [ ] Verificar `POST /global-notification-recipients/` com email correto
   - [ ] Novo item aparece na lista com `active = true`

3. **Testar erro 409 (duplicado)**:
   - [ ] Tentar adicionar e-mail já existente (ou mock 409)
   - [ ] Verificar mensagem de erro específica: "E-mail 'alerts@interasisai.com.br' já está cadastrado."
   - [ ] Item não é duplicado na lista

4. **Desativar destinatário**:
   - [ ] Clicar botão "Desativar" (ou toggle) em um item
   - [ ] Verificar `PUT /global-notification-recipients/{id}` com `active: false`
   - [ ] Item permanece na lista com indicação visual de inativo

5. **Remover destinatário**:
   - [ ] Clicar botão "Remover"
   - [ ] Confirmar em dialog
   - [ ] Verificar `DELETE /global-notification-recipients/{id}`
   - [ ] Item desaparece da lista

### US3: Calculadora de Plano

**Setup**: Página de global-settings carregada.

1. **Calculadora básica**:
   - [ ] Verificar `GET /tenants/message-limit-config` é chamado (valores: worst_case=3, average=3)
   - [ ] No cenário "Pior caso", informar 1000 chamadas
   - [ ] Calcular mostra: "≈ 333 mensagens reais" (ou similar, dependendo do arredondamento)

2. **Trocar cenário**:
   - [ ] Mudar para "Médio"
   - [ ] Valor recalcula instantaneamente (sem chamada de rede)
   - [ ] Resultado final é o mesmo (average ≈ worst_case hoje)

3. **Entradas inválidas**:
   - [ ] Deixar campo vazio: calculadora mostra estado neutro (sem estimativa)
   - [ ] Informar número negativo: campo rejeita ou calculadora mostra estado neutro
   - [ ] Informar 0: calculadora mostra estado neutro

4. **Campo de dica no formulário de tenant**:
   - [ ] Ao editar tenant, preencher `monthly_message_limit = 1000`
   - [ ] Ao lado do campo, dica apareça: "Estimativa: ≈ 333 mensagens reais de clientes finais (pior caso)"
   - [ ] Ajustar o valor: dica recalcula instantaneamente

## Running Tests

### Unit Tests (Hooks + Schemas)

```bash
npm test -- src/hooks/useTenantUsage.test.ts
npm test -- src/hooks/useMessageLimitConfig.test.ts
npm test -- src/hooks/useGlobalRecipientsManager.test.ts
```

### Component Tests (UI)

```bash
npm test -- src/components/admin/tenants/TenantForm.test.tsx
npm test -- src/components/admin/tenants/TenantDetails.test.tsx
npm test -- src/components/admin/tenants/TenantUsageIndicator.test.tsx
npm test -- src/components/admin/tenants/EmailListEditor.test.tsx
npm test -- src/components/admin/tenants/GlobalNotificationRecipients.test.tsx
```

### Run All Tests

```bash
npm test
```

## Troubleshooting

### Backend Não Respondendo

- [ ] Verificar se backend está rodando: `curl http://localhost:8000/api/v1/tenants`
- [ ] Confirmar `REACT_APP_PYTHON_BACKEND_URL` está correto em `.env.local`
- [ ] Revisar console do navegador (DevTools) para erros de CORS ou rede

### Validação de E-mail Falhando

- [ ] Zod `email()` é mais restritivo que RFC 5322 completo
- [ ] Se teste falha, revisar erro: `z.string().email().parse(...)`
- [ ] Ajustar validação se backend aceita um formato que Zod rejeita

### Cores Não Aparecem (Tailwind)

- [ ] Verificar `design-tokens.ts` para nomes exatos de cores
- [ ] Garantir Tailwind está compilando (rodar `npm run build` se necessário)
- [ ] DevTools → Inspect element → verificar classe de Tailwind é aplicada

### Testes Falhando (Mocks)

- [ ] Verificar se mock de `pythonBackend.ts` está correto em `setupTests.ts`
- [ ] Se novo endpoint foi adicionado, estender mock para cobri-lo
- [ ] Usar `jest.mock(...)` ou MSW se necessário para interceptar chamadas HTTP

## Deployment Checklist

- [ ] Todos os testes passam: `npm test -- --coverage`
- [ ] Nenhum console error/warning: `npm run build` e inspeccionar saída
- [ ] Validação TypeScript limpa: `npx tsc --noEmit`
- [ ] Formulário salva sem erros (E2E test ou manual no browser)
- [ ] Configurações Globais CRUD funciona
- [ ] Calculadora recalcula sem erros
- [ ] Fallback a defaults do `message-limit-config` funciona (mock erro de rede)
- [ ] Responsividade em mobile (calculadora, lista de e-mails, indicador)

## Links & References

- **Backend Spec**: `../agendamento-ia/specs/010-tenant-message-limit/spec.md`
- **Backend Endpoints**: `../agendamento-ia/app/api/v1/endpoints/tenant.py` + `global_notification_recipients.py`
- **Frontend Data Model**: `specs/024-tenant-message-limit-admin-ui/data-model.md`
- **Hook Contracts**: `specs/024-tenant-message-limit-admin-ui/contracts/custom-hooks.md`
- **Constitution (Frontend)**: `.specify/memory/constitution.md`

---

**Status**: Quickstart complete. Ready for Phase 2 (tasks) and Phase 3 (implementation).
