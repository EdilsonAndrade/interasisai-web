# Research: Integração com Backend Python de Agendamento IA

**Date**: 2026-08-06
**Feature**: specs/010-integrate-python-backend

## R1: Geração de UUID v4 sem dependências externas

### Decision
Usar `crypto.randomUUID()`, API nativa do navegador (Web Crypto API).

### Rationale
- Disponível em todos os navegadores modernos: Chrome 92+, Firefox 95+, Safari 15.4+, Edge 92+.
- Não requer instalação de pacotes adicionais (zero bytes adicionados ao bundle).
- Geração síncrona, sem necessidade de `await`.
- API estável (W3C Recommendation desde 2017).

### Alternatives Considered
| Alternativa | Motivo da Rejeição |
|---|---|
| `uuid` (npm package v9+) | Adiciona ~3KB ao bundle; funcionalidade disponível nativamente |
| `crypto.randomUUID()` (Node.js 19+) via `next/script` | Overhead desnecessário; execução é client-side |
| `nanoid` | Excesso para o caso de uso; UUID v4 é suficiente para identificação de sessão |
| Math.random() + timestamp | Não criptograficamente aleatório; colisões possíveis em alta concorrência |

### Implementation Note
```typescript
function generateThreadId(): string {
  return crypto.randomUUID(); // ex: "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## R2: Estrutura do Cliente HTTP para Backend Python

### Decision
Criar novo módulo `src/services/pythonBackend.ts` com funções dedicadas (`sendChatMessage`, `ingestKnowledge`), usando `fetch` nativo (padrão consistente com o `chatGateway.ts` existente).

### Rationale
- Consistência com o padrão existente no projeto (`chatGateway.ts` usa `fetch` nativo).
- Separação clara entre backend antigo (BFF) e novo (Python) facilita remoção futura do BFF.
- Funções dedicadas permitem mocks pontuais nos testes.
- Sem dependências externas (axios, ky, etc.).

### Alternatives Considered
| Alternativa | Motivo da Rejeição |
|---|---|
| Modificar `chatGateway.ts` existente com conditional dispatch | Viola SRP; dificulta remoção futura do BFF; aumenta complexidade do código existente |
| Usar `axios` | Adiciona dependência; `fetch` nativo é suficiente para POST simples |
| Usar Server Actions (Next.js) | Backend Python requer chamadas client-side (chat é interativo); Server Actions adicionam complexidade de serialização desnecessária |

### Error Handling Strategy
- Network errors (`fetch` throws) → `{ ok: false, errorStatus: "local", retryable: true }`
- HTTP 4xx → `{ ok: false, errorStatus: "rejected"/"blocked", retryable: false }`
- HTTP 5xx → `{ ok: false, errorStatus: "failed", retryable: true }`
- HTTP 504 → `{ ok: false, errorStatus: "failed", retryable: true }` (tratamento específico com mensagem amigável)

---

## R3: Detecção de Disponibilidade do localStorage e Fallback

### Decision
Usar pattern try/catch com `setItem`/`getItem` para detectar indisponibilidade. Fallback para `Map<string, string>` em memória quando indisponível.

### Rationale
- localStorage pode estar indisponível em: modo anônimo/privado (Safari ITP), storage cheio (QuotaExceededError), ou desabilitado pelo usuário.
- Fallback em memória garante funcionamento contínuo do chat (sessão única, sem persistência entre recargas).
- Padrão testável e previsível.

### Alternatives Considered
| Alternativa | Motivo da Rejeição |
|---|---|
| `sessionStorage` como fallback | Também indisponível nos mesmos cenários; não adiciona valor |
| Cookies (`document.cookie`) | Limite de 4KB; complexidade de parsing; não é o propósito |
| IndexedDB | Overkill para armazenar um único UUID; API assíncrona adiciona complexidade desnecessária |

### Implementation Note
```typescript
function isLocalStorageAvailable(): boolean {
  try {
    const key = "__test__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
```

---

## R4: Estratégia de Desabilitação de Áudio

### Decision
Usar feature flag via variável de ambiente `NEXT_PUBLIC_ENABLE_AUDIO` (default `false`). O código de áudio permanece importado, mas a UI é condicionalmente ocultada. Nenhum `import` é removido.

### Rationale
- Ideal constitucional: não remove código existente (DRY — o código permanece como fonte de verdade).
- Feature flag é padrão Next.js; `NEXT_PUBLIC_` expõe ao client-side.
- Reativação futura requer apenas mudar a variável para `true` — sem alterações de código.
- Componentes que consomem áudio (`ChatInput`, `ChatWidget`) verificam a flag e ocultam botões condicionalmente.

### Alternatives Considered
| Alternativa | Motivo da Rejeição |
|---|---|
| Comentar código literalmente (`/* ... */`) | Sujo; pode quebrar syntax highlighting; risco de acidentalmente descomentar parcialmente |
| Deletar código de áudio e recriar depois | Viola princípio de preservação; perda de histórico Git útil |
| Manter áudio ativo com o BFF antigo | Duas integrações simultâneas = complexidade desnecessária; backend Python não suporta áudio |

### Implementation Note
```typescript
// No componente:
const enableAudio = process.env.NEXT_PUBLIC_ENABLE_AUDIO === "true";
{enableAudio && <MicrophoneButton onClick={startRecording} />}
```

---

## R5: Estrutura da Página Admin (`/admin`)

### Decision
Usar App Router: `src/app/admin/page.tsx` como Client Component (`"use client"`). Formulário usa `useState` local (sem necessidade de Context ou hook externo complexo). Validação simples inline (sem `react-hook-form` + Zod nesta v1, dado que são apenas 2 campos).

### Rationale
- App Router é o padrão do projeto (Next.js 16).
- Client Component necessário para interatividade de formulário.
- `useState` local suficiente para 2 campos + estado de loading/erro/sucesso.
- Consistente com Constitutional Principle II (Context apenas quando estado é compartilhado globalmente).

### Alternatives Considered
| Alternativa | Motivo da Rejeição |
|---|---|
| Server Component + Server Action | Backend Python é externo (não é Server Action); formulário precisa de feedback interativo |
| `react-hook-form` + Zod | Overkill para 2 campos; será considerado quando autenticação for adicionada em fase futura |
| Página dentro de `/api/admin` | Não é uma API route; é uma página visual |

---

## R6: Contrato de Resposta — Mapeamento Python → ChatMessage

### Decision
Mapeamento direto no `pythonBackend.ts`:
- Sucesso: `{ status: "success", response: string }` → extrair `response` como conteúdo da mensagem
- Erro HTTP 504: mensagem fixa amigável
- Erro HTTP 500: `{ detail: string }` → extrair `detail` como mensagem de erro
- Campo `response` ausente → fallback `"Recebemos sua mensagem e já estamos processando."`

### Rationale
- Contrato documentado no EDI-30 é simples e estável.
- Fallback para campo ausente garante que o chat nunca "quebra" silenciosamente.
- Mensagens de erro amigáveis (não técnicas) melhoram UX.

### Alternatives Considered
| Alternativa | Motivo da Rejeição |
|---|---|
| Usar o mesmo `normalizeBffResponse` do chatGateway antigo | Contratos diferentes (campos `response` vs `response_text`, sem `audio`) |
| Criar adapter layer separado | Adiciona indireção desnecessária para 2 campos |

---

## R7: Estratégia de Testes

### Decision
- Testes do `pythonBackend.ts`: mockar `fetch` global (padrão já usado em `chatGateway.test.ts`)
- Testes do `sessionManager.ts`: mockar `localStorage` via `jest.spyOn(Storage.prototype, ...)`
- Testes do `useAdminIngest.ts`: `renderHook` + mock do `pythonBackend`
- Testes do `useChatAssistant.test.ts`: atualizar mocks para refletir novo contrato (remover referências a áudio nos cenários de texto)
- Testes existentes do `chatGateway.test.ts`: preservar (BFF antigo ainda existe como fallback); adicionar testes para `pythonBackend.test.ts` separado

### Rationale
- Consistente com padrões de teste existentes no projeto.
- Separação de preocupações: cada módulo testado isoladamente com mocks apropriados.
- `jest.useFakeTimers()` já usado para controle de async; compatível.

---

## Summary

| Research Item | Decision | Impact |
|---|---|---|
| R1: UUID v4 | `crypto.randomUUID()` nativo | Zero dependências |
| R2: HTTP Client | Novo `pythonBackend.ts` com `fetch` | Separação limpa do BFF antigo |
| R3: localStorage fallback | try/catch + `Map` em memória | Chat funciona em modo anônimo |
| R4: Áudio disable | Feature flag `NEXT_PUBLIC_ENABLE_AUDIO` | Reativação trivial |
| R5: Admin page | `app/admin/page.tsx` Client Component | Simples, 2 campos |
| R6: Response mapping | Direto no `pythonBackend.ts` | Sem indireção desnecessária |
| R7: Test strategy | Mock `fetch` + `renderHook` | Consistente com padrão existente |
