# Contract: Audio Recording — Hook Interface

**Feature**: 006-edi-20-audio-frontend  
**Contract type**: Internal Hook API (Frontend ↔ Component boundary)  
**Date**: 2026-04-21

---

## Hook Public Interface

O hook `useChatAssistant` é o único ponto de acesso a toda a lógica de gravação. O componente `ChatWidget` consome exclusivamente este contrato — nenhuma chamada direta à `MediaRecorder API` é permitida em componentes.

### Input (Actions)

| Ação | Assinatura | Efeitos |
|------|-----------|---------|
| `startRecording` | `() => void` | Solicita `getUserMedia`, cria `MediaRecorder`, inicia timer, seta `isRecording: true` |
| `stopRecording` | `() => void` | Para `MediaRecorder`, para timer, zera `recordingTime`, libera stream de microfone |
| `sendMessage` | `(text: string) => void` | Inalterado — adiciona mensagem de texto ao chat |

### Output (State)

| Estado | Tipo | Valor inicial | Transições |
|--------|------|--------------|-----------|
| `isRecording` | `boolean` | `false` | `false → true` em `startRecording` / `true → false` em `stopRecording` ou erro |
| `recordingTime` | `number` | `0` | Incrementa +1/segundo enquanto `isRecording: true`; resetado para `0` em `stopRecording` |
| `audioBlob` | `Blob \| null` | `null` | Seta para `Blob` válido (`size > 0`) ao parar gravação; mantém `null` se blob inválido |
| `audioError` | `string \| null` | `null` | Seta para string descritiva em caso de `NotAllowedError`, `NotSupportedError`, `onerror` |
| `messages` | `ChatMessage[]` | `[]` | Inalterado |
| `isLoading` | `boolean` | `false` | Inalterado |

### Invariants

1. `isRecording` e `audioBlob !== null` NUNCA são verdadeiros ao mesmo tempo — o blob só é gerado após o stop.
2. `recordingTime` é sempre `0` quando `isRecording` é `false`.
3. `audioError !== null` implica `isRecording === false`.
4. `startRecording()` enquanto `isRecording === true` é no-op (proteção contra double-click).

---

## Contract: Backend Integration (Futuro)

Este contrato define o ponto de extensão para envio do áudio ao backend. **Não implementado nesta feature** — será preenchido quando o backend NestJS estiver disponível.

### Assinatura esperada

```ts
// src/services/audioService.ts (a ser criado na feature de integração)
export async function sendAudioToBackend(blob: Blob): Promise<void> {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");
  // POST /api/chat/audio  (endpoint definido na Parte B — EDI-20)
}
```

### Ponto de chamada no hook (placeholder atual)

```ts
// Linha atual (temporária — apenas log):
console.log(`[Audio Blob] size: ${blob.size} bytes`);

// Substituir por (quando backend estiver pronto):
// void sendAudioToBackend(blob);
```

### Formato do payload esperado (rascunho)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `audio` | `File / Blob` | Arquivo de áudio em `audio/webm` ou `audio/mp4` |
| Content-Type | `multipart/form-data` | Necessário para envio de arquivo binário |

---

## Contract: Component ↔ Hook (ChatWidget)

```ts
// O ChatWidget desestrutura SOMENTE estes campos do hook:
const {
  messages,
  isLoading,
  isRecording,
  recordingTime,  // ← novo
  audioBlob,      // ← novo (para estado futuro — por ora apenas loga)
  audioError,
  sendMessage,
  startRecording,
  stopRecording,
} = useChatAssistant();
```

O `ChatWidget` NUNCA acessa `chunksRef`, `mediaRecorderRef`, `streamRef`, ou `timerRef` — esses são detalhes de implementação internos ao hook.

---

## Verification Checklist

- [ ] `startRecording()` seta `isRecording: true` após `getUserMedia` resolver
- [ ] Timer incrementa exatamente +1 por segundo enquanto `isRecording: true`
- [ ] `stopRecording()` produz `audioBlob` com `size > 0` após gravação de ≥1 segundo
- [ ] `stopRecording()` zera `recordingTime` e seta `isRecording: false`
- [ ] `audioError` é setado quando `getUserMedia` lança `NotAllowedError`
- [ ] `audioError` é setado quando `MediaRecorder` não é suportado
- [ ] Fechar painel enquanto `isRecording: true` chama `stopRecording()` automaticamente
- [ ] Log no console: `[Audio Blob] size: X bytes` após gravação válida
- [ ] Blob com `size === 0` não seta `audioBlob` (permanece `null`)
