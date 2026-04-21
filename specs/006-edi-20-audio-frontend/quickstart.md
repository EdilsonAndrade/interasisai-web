# Quickstart: Gravação de Áudio no Frontend (EDI-20 Parte A)

**Feature**: 006-edi-20-audio-frontend  
**Date**: 2026-04-21

---

## Pré-requisitos

- Node.js 20+, dependências instaladas: `npm install`
- Projeto já configurado com Next.js 15, Tailwind CSS 4, Framer Motion, Jest
- Microfone disponível (físico ou virtual) para teste manual

---

## Fluxo de Desenvolvimento

### 1. Atualizar o hook `useChatAssistant`

**Arquivo**: `src/hooks/useChatAssistant.ts`

Substituir a lógica de `SpeechRecognition` pela `MediaRecorder API`:

```ts
// Detectar MIME type suportado
function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return "";
}
```

Estados novos a adicionar ao hook:
- `recordingTime: number` (segundos) — controlado por `setInterval`
- `audioBlob: Blob | null` — resultado da gravação

Ações atualizadas:
- `startRecording()`: chama `getUserMedia`, cria `MediaRecorder`, inicia timer
- `stopRecording()`: para recorder + stream, para timer, reseta `recordingTime`

### 2. Atualizar `ChatWidget`

**Arquivo**: `src/components/chat/ChatWidget.tsx`

Mudanças:
- Remover desestruturação de `transcript` (não existe mais no hook)
- Adicionar `recordingTime` e `audioBlob` na desestruturação
- Remover `useEffect` de sincronização de transcript com textarea
- Adicionar `useEffect` para chamar `stopRecording()` quando `isOpen` fecha
- Adicionar display do timer `M:SS` ao lado do botão de microfone

```tsx
// Effect de cleanup ao fechar painel
useEffect(() => {
  if (!isOpen && isRecording) {
    stopRecording();
  }
}, [isOpen, isRecording, stopRecording]);

// Formatação do timer
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
```

### 3. Atualizar testes do hook

**Arquivo**: `src/hooks/useChatAssistant.test.ts`

O mock de `MediaRecorder` já existe no arquivo mas o hook voltou a usar `SpeechRecognition`. Restaurar o mock de `MediaRecorder` e adicionar testes para:
- `recordingTime` incrementa após `startRecording()` + `jest.advanceTimersByTime(3000)`
- `audioBlob` tem `size > 0` após `stopRecording()`
- `audioError` é setado quando `getUserMedia` lança
- `isRecording` vai de `false → true → false`

---

## Como Testar Manualmente

```bash
npm run dev
```

1. Abrir `http://localhost:3000`
2. Clicar no ícone de chat (canto inferior direito)
3. Clicar no ícone de microfone
4. Aceitar a permissão de microfone no navegador
5. Observar: ícone muda para `MicOff`, timer começa (`0:01`, `0:02`...)
6. Falar qualquer coisa
7. Clicar novamente no microfone para parar
8. Abrir DevTools → Console → verificar log `[Audio Blob] size: X bytes`
9. Verificar que o timer volta a `0` e o ícone volta para `Mic`

### Teste de permissão negada

1. Em Chrome: `Configurações → Privacidade → Microfone → Bloquear para localhost`
2. Clicar no microfone no chat
3. Verificar que a mensagem "Permissão de microfone necessária" aparece no chat

---

## Como Rodar os Testes

```bash
# Todos os testes
npm test

# Apenas o hook
npm test -- useChatAssistant

# Com watch mode
npm test -- --watch useChatAssistant
```

**Resultado esperado**: 6+ testes passando (4 existentes + novos de áudio).

---

## Build de Verificação

```bash
npm run build
```

Deve completar sem erros TypeScript. Qualquer `any` implícito causará erro de build (strictmode ativo).
