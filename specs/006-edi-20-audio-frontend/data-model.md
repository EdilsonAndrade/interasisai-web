# Data Model: Gravação de Áudio no Frontend (EDI-20 Parte A)

**Feature**: 006-edi-20-audio-frontend  
**Date**: 2026-04-21

---

## Hook State Shape

### `useChatAssistant` — Return Type

```ts
type UseChatAssistantReturn = {
  // ── Mensagens do chat (inalterado) ──
  messages: ChatMessage[];
  isLoading: boolean;

  // ── Estado de gravação ──
  isRecording: boolean;       // true enquanto MediaRecorder.state === 'recording'
  recordingTime: number;      // segundos decorridos, 0 quando idle
  audioBlob: Blob | null;     // null antes da primeira gravação ou se size === 0
  audioError: string | null;  // null quando sem erro

  // ── Ações ──
  sendMessage: (text: string) => void;
  startRecording: () => void;  // síncrono — getUserMedia é assíncrono internamente
  stopRecording: () => void;
};
```

### `ChatMessage` (inalterado)

```ts
// Em src/context/ChatContext.tsx — nenhuma mudança
export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
};
```

---

## Entidades Transitórias (apenas em runtime, não persistidas)

### `RecordingSession` (interno ao hook)

Não é um tipo exportado — representa o estado interno durante uma gravação ativa:

```ts
// Refs internas — não fazem parte do retorno público do hook
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const streamRef = useRef<MediaStream | null>(null);
const chunksRef = useRef<Blob[]>([]);           // acumulador de chunks de áudio
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

### `AudioBlob` (contrato de saída)

```ts
// O Blob exposto satisfaz este contrato implícito:
// - blob.type: "audio/webm" | "audio/mp4" (detectado via isTypeSupported)
// - blob.size: > 0 (garantido antes de setar estado)
```

---

## Diagrama de Estado (isRecording)

```
idle (isRecording: false, recordingTime: 0, audioBlob: null)
  │
  ├─[startRecording()]──────────────────────────────────────────►
  │                                                              │
  │                  recording (isRecording: true, timer ++/s)  │
  │                                                              │
  │  [stopRecording() ou painel fechado]◄────────────────────────
  │
  ▼
done (isRecording: false, recordingTime: 0, audioBlob: Blob | null)
       └─ audioBlob !== null se size > 0
       └─ audioBlob === null se size === 0 (descartado)

error (isRecording: false, audioError: string)
       └─ dispara quando getUserMedia lança ou MediaRecorder.onerror
```

---

## Formato do Timer no UI

| `recordingTime` (segundos) | Exibição no `ChatWidget` |
|---------------------------|--------------------------|
| `0` | (oculto — `isRecording` é false) |
| `5` | `0:05` |
| `65` | `1:05` |
| `600` | `10:00` |

**Função de formatação** (no componente, puro, sem efeitos):

```ts
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
```
