# Research Phase: Follow-up Admin Panel

**Date**: 2026-08-26 | **Status**: Complete

## Decisions & Findings

### 1. Backend Endpoints Availability (EDI-53)

**Decision**: Feature depende de EDI-53 estar completo. Endpoints esperados:

- `GET /follow-up-queue?status=&outcome=&tenant_id=` — lista fila
- `PATCH /follow-up-queue/:queueId` — atualizar status (aprovado/descartado/opt_out)
- `GET /conversation-history/:tenantId/:baseThreadId` — histórico com paginação
- `GET /tenants/:tenantId` — obter config (oferta_vigente, retention_days)
- `PATCH /tenants/:tenantId` — atualizar config

**Rationale**: Backend implementa persistência em PostgreSQL (conversation_messages, follow_up_queue, tenants). Frontend consome via REST.

**Alternative Considered**: GraphQL — seria mais eficiente, mas projeto usa REST; mantém consistência.

---

### 2. Context API para Estado Global

**Decision**: Usar Context API nativa (React) para:
- `FollowUpContext` — fila, filtros aplicados, loading states
- `AdminAuthContext` — role/permissões do usuário

**Rationale**: 
- Constitution Principle II proíbe Redux/Zustand default
- Fila e histórico são dados isolados (não há interdependências complexas)
- Context granular evita re-renders desnecessários

**Alternative Considered**: Redux — overkill para este scope; Zustand — conflitaria com constitution.

---

### 3. Lazy-Load para Histórico

**Decision**: Implementar paginação cliente com "Load More" button para históricos > 100 mensagens.

**Rationale**:
- 500 mensagens com DOM-rendering travaria UI sem virtualization
- Next.js não tem virtualization built-in; implementar seria overhead
- Paginação simples: carrega 50 mensagens por vez, botão "Carregar Mais"

**Alternative Considered**: 
- Virtualization (react-window) — adiciona 50kb minified; overkill
- Infinite scroll — confunde UX (não sabe quando chegou fim)

---

### 4. Markdown Rendering no Histórico

**Decision**: Usar `marked` + `DOMPurify` para renderizar markdown seguro.

**Rationale**:
- Conversa pode conter links, bold, listas
- `dangerouslySetInnerHTML` proibido (Principle VIII)
- DOMPurify previne XSS de markdown mal-formado

**Alternative Considered**:
- Mostrar texto cru — piora UX; links ficam legíveis
- react-markdown — mais pesado (150kb); `marked` é 28kb

---

### 5. Validação Client-Side de Desconto

**Decision**: Usar Zod schema para validar que desconto/condição editado está em `oferta_vigente`.

```typescript
// Pseudo-code
const OfferSchema = z.object({
  text: z.string().refine(
    (text) => tenantConfig.oferta_vigente && 
              tenantConfig.oferta_vigente.includes(text),
    "Desconto não configurado para este tenant"
  )
})
```

**Rationale**: 
- Principle V (TypeScript & Erros): validação com Zod
- Previne submissão de offers inválidas ao backend
- Mensagem amigável no toast

**Alternative Considered**: Validação só server-side — mais lento, UX pior.

---

### 6. Componentes Reutilizáveis & Tailwind

**Decision**: Criar atomic components com `clsx` + `tailwind-merge`:

```typescript
// Exemplo
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  ...props 
}) => (
  <button
    className={clsx(
      "px-4 py-2 rounded-lg transition-transform hover:scale-105",
      {
        "bg-blue-600 text-white": variant === 'primary',
        "bg-gray-200 text-gray-800": variant === 'secondary',
        "bg-red-600 text-white": variant === 'danger',
      },
      className // permite override via props
    )}
    {...props}
  />
)
```

**Rationale**: Principle III (DRY) + VI (Tailwind-only, clsx+tailwind-merge)

---

### 7. Testing Strategy

**Decision**: 
- Hooks: `renderHook` com mock de API (`jest.mock`)
- Componentes: RTL com `getByRole`, `getByLabelText`
- E2E: flow completo (filtrar → editar → aprovar)

**Rationale**: Principle IV — "No feature is Done without automated test coverage"

---

## Unknowns Resolved

| Unknown | Resolution |
|---------|-----------|
| Endpoints prontos? | Assumir EDI-53 completo antes de iniciar; documentar em `contracts/` |
| Design system existente? | Reutilizar Tailwind + Framer Motion do projeto; criar novos components se necessário |
| Admin auth como funciona? | Usar sistema existing de roles/permissions; não criar novo |
| Histórico muito grande — como? | Paginação com "Load More" |

---

## Go-No-Go Gate

✅ **READY FOR PHASE 1** — Todas decisões técnicas resolvidas; nenhum blocker identificado. Proceder com design de data-model e contracts.
