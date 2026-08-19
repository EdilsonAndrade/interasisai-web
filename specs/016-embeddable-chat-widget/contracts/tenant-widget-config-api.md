# Contract (FUTURO — dependência externa): Configuração de Aparência do Widget

> **Status**: NÃO IMPLEMENTADO. Este contrato descreve uma extensão necessária no backend Python
> (fora deste repositório) para viabilizar a User Story 5 (P3 — customização de aparência) da
> especificação. O MVP desta feature (User Stories P1/P2) **não depende** deste contrato e usa
> aparência padrão fixa. Documentado aqui para alinhar o time de backend antes da fase de tasks.

## Extensão proposta ao tipo `Tenant`

Novos campos opcionais, editáveis pelo mesmo fluxo administrativo já existente (`PUT /api/v1/tenants/{tenant_id}`):

```json
{
  "widget_primary_color": "#7C3AED",
  "widget_logo_url": "https://cliente.com/logo.png",
  "widget_greeting_message": "Olá! Como posso ajudar?",
  "widget_position": "bottom-right"
}
```

- `widget_position` restrito a `"bottom-right" | "bottom-left"`.
- Todos os campos opcionais — ausência implica nos valores padrão do produto.

## Novo endpoint público (sem autenticação)

```
GET /api/v1/tenants/{tenant_id}/widget-config
```

Necessário porque o script embutido roda **antes** de qualquer sessão autenticada existir, em um site de terceiros — não pode chamar o mesmo endpoint autenticado usado pelo admin. Deve expor **apenas** os campos de aparência acima (nunca `google_calendar_id`, `allowed_domains` ou qualquer dado interno).

**Response 200**:
```json
{
  "widget_primary_color": "#7C3AED",
  "widget_logo_url": "https://cliente.com/logo.png",
  "widget_greeting_message": "Olá! Como posso ajudar?",
  "widget_position": "bottom-right"
}
```

**Response 404**: tenant inexistente ou excluído — o Route Handler deste repositório trata como "não renderizar nada" (mesmo comportamento de FR-004/FR-009).

## Consumo neste repositório

O Route Handler `src/app/widget/[tenantId]/route.ts` chamaria este endpoint no momento da requisição do script (server-side, dentro do próprio Next.js), injetando o resultado no bundle retornado — o visitante final nunca faz uma chamada de rede extra para buscar aparência.
