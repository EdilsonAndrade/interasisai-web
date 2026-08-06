# Quickstart: Integração com Backend Python de Agendamento IA

**Date**: 2026-08-06
**Feature**: specs/010-integrate-python-backend

## Pré-requisitos

1. **Backend Python em execução** na URL configurada (default: `http://localhost:8000`)
2. **Node.js** (já instalado no projeto)
3. **Variáveis de ambiente** configuradas no `.env`

## Configuração Rápida

### 1. Configurar `.env`

Adicione ao arquivo `.env` na raiz do projeto:

```bash
# Backend Python de Agendamento IA
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_TENANT_ID=987654

# Feature flags
NEXT_PUBLIC_ENABLE_AUDIO=false
```

### 2. Instalar dependências (sem novas dependências)

Nenhuma nova dependência é necessária — `crypto.randomUUID()` é nativo do navegador.

```bash
npm install  # apenas para garantir que está atualizado
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

### 4. Verificar integração

1. Acesse `http://localhost:3000` — o widget de chat deve aparecer no canto inferior direito.
2. Abra o chat e digite "Olá, gostaria de agendar um corte de cabelo".
3. Verifique no console do navegador que a requisição foi enviada para `http://localhost:8000/api/v1/chat` com header `X-Tenant-ID: 987654`.
4. A resposta da IA deve aparecer como mensagem no chat.
5. O botão de microfone NÃO deve estar visível (áudio desabilitado).

### 5. Testar painel admin

1. Acesse `http://localhost:3000/admin`.
2. Preencha Tenant ID (ex: `987654`) e o texto institucional.
3. Clique em "Salvar e Vetorizar Base de Conhecimento".
4. Verifique que o backend retorna `201 Created` e a mensagem de sucesso aparece.

## Estrutura de Arquivos Afetados

### Novos arquivos
| Arquivo | Descrição |
|---------|-----------|
| `src/app/admin/page.tsx` | Página do painel administrador |
| `src/components/admin/IngestForm.tsx` | Formulário de ingestão de conhecimento |
| `src/services/pythonBackend.ts` | Cliente HTTP para backend Python |
| `src/services/pythonBackend.types.ts` | Tipos do contrato Python |
| `src/services/sessionManager.ts` | Gerenciamento de thread_id |
| `src/hooks/useAdminIngest.ts` | Hook de lógica do painel admin |

### Arquivos alterados
| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useChatAssistant.ts` | Novo contrato Python, feature flag de áudio |
| `src/components/chat/ChatInput.tsx` | Esconder botão de microfone via flag |
| `src/components/chat/ChatWidget.tsx` | Sem alteração visual (flag propagada) |
| `src/services/chatGateway.types.ts` | Adicionar tipos Python |
| `src/services/index.ts` | Exportar novos módulos |
| `.env` | Novas variáveis (`NEXT_PUBLIC_PYTHON_BACKEND_URL`, `NEXT_PUBLIC_TENANT_ID`, `NEXT_PUBLIC_ENABLE_AUDIO`) |

### Arquivos preservados (sem alterações)
- `src/services/audioOptimization.ts`
- `src/services/audioFromBase64.ts`
- `src/services/chatResponseCache.ts`
- `src/context/ChatContext.tsx`
- `src/components/chat/ChatMessages.tsx`
- `src/components/chat/ChatStatus.tsx`
- `src/app/layout.tsx`

## Executar Testes

```bash
# Todos os testes
npm test

# Apenas testes do novo módulo Python
npx jest src/services/pythonBackend.test.ts

# Apenas testes de sessão
npx jest src/services/sessionManager.test.ts

# Apenas testes do hook de chat (atualizados)
npx jest src/hooks/useChatAssistant.test.ts

# Apenas testes do hook admin
npx jest src/hooks/useAdminIngest.test.ts
```

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| Chat não envia mensagens | Backend Python offline | Verifique `http://localhost:8000/api/v1/chat` no navegador |
| Erro "Tenant ID não configurado" | `.env` sem `NEXT_PUBLIC_TENANT_ID` | Adicione a variável e reinicie `npm run dev` |
| Botão de microfone ainda visível | `.env` com `NEXT_PUBLIC_ENABLE_AUDIO=true` | Altere para `false` e reinicie |
| thread_id diferente a cada recarga | localStorage bloqueado (modo anônimo) | Comportamento esperado — chat funciona, mas sem persistência |
| Admin page 404 | Arquivo `app/admin/page.tsx` não criado | Execute o plano de tasks |
| Testes quebrados após alteração | Mocks desatualizados | Atualize mocks conforme novo contrato (ver `python-chat-api.md`) |
