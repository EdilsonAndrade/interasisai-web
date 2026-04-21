# Research: Gravação de Áudio no Frontend (EDI-20 Parte A)

**Feature**: 006-edi-20-audio-frontend  
**Date**: 2026-04-21  
**Status**: Complete — all unknowns resolved

---

## Decisions

### 1. API de Captura de Áudio: MediaRecorder API

**Decision**: Usar a `MediaRecorder API` nativa do browser (não `SpeechRecognition`).

**Rationale**: A `SpeechRecognition` API produz apenas texto transcrito — não gera arquivo de áudio para envio ao backend. O objetivo da feature é capturar bytes reais de áudio em um `Blob` para que o backend (NestJS) faça a transcrição via serviço externo (ex: Whisper/OpenAI). A `MediaRecorder` é a única API padrão que atende esse contrato.

**Alternatives considered**:
- `SpeechRecognition` (webkit/native) — descartada: não produz arquivo de áudio, apenas texto (foi a abordagem anterior, removida)
- Web Audio API diretamente — descartada: baixo nível demais; `MediaRecorder` encapsula a conversão de stream

**Browser support**: Chrome 47+, Firefox 25+, Edge 79+, Safari 14.1+ — cobertura adequada para o perfil de usuário da plataforma.

---

### 2. MIME Type: `audio/webm` com fallback `audio/mp4`

**Decision**: Detectar suporte em runtime com `MediaRecorder.isTypeSupported()`.

```ts
function getSupportedMimeType(): string {
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return ""; // deixar o browser escolher o padrão
}
```

**Rationale**: `audio/webm` é o padrão em Chrome/Firefox/Edge. Safari requer `audio/mp4`. Detectar em runtime garante compatibilidade sem agrupamento condicional de build.

**Alternatives considered**:
- `audio/ogg` — suporte zero em Safari e Edge legacy; descartada.
- Fixar `audio/webm` — quebraria em Safari iOS; descartada.

---

### 3. Timer de Gravação: `setInterval` no hook

**Decision**: Gerenciar o timer de gravação (`recordingTime: number`) exclusivamente dentro de `useChatAssistant`, usando `setInterval` de 1 segundo.

**Rationale**: Mantém o Princípio I da constituição (hooks gerenciam estado/lógica, componentes apenas renderizam). O componente só lê `recordingTime` e formata como `M:SS`.

**Implementation pattern**:
```ts
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

// Em startRecording():
setRecordingTime(0);
timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);

// Em stopRecording() e cleanup:
if (timerRef.current) clearInterval(timerRef.current);
```

**Alternatives considered**:
- `requestAnimationFrame` — precisão de sub-milissegundo desnecessária para um timer de segundos; mais complexo de mockear em Jest.
- Timer no componente — violaria Princípio I; descartado.

---

### 4. Exposição do `audioBlob` via Hook

**Decision**: O hook expõe `audioBlob: Blob | null` diretamente no seu retorno.

**Rationale**: A separação de responsabilidades requer que o componente não processe o blob. A camada de serviço futura (`sendAudioToBackend`) consumirá `audioBlob` diretamente do hook. Enquanto o backend não estiver pronto, o hook loga o blob no console.

**Contract (temporário)**:
```ts
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: mimeType });
  if (blob.size > 0) {
    setAudioBlob(blob);
    console.log(`[Audio Blob] size: ${blob.size} bytes`);
  }
};
```

**Contract (futuro — quando backend estiver pronto)**:
```ts
// Substituir o console.log por:
await sendAudioToBackend(blob); // função externa, não no hook
```

---

### 5. Liberar Stream ao Fechar Painel

**Decision**: `ChatWidget` usa um `useEffect` que observa `isOpen` e chama `stopRecording()` quando transiciona para `false`.

**Rationale**: O `ChatWidget` é o dono do lifecycle do painel — é a melhor camada para reagir ao fechamento. Não polui o `ChatContext` com lógica de áudio.

**Pattern**:
```ts
useEffect(() => {
  if (!isOpen && isRecording) {
    stopRecording();
  }
}, [isOpen, isRecording, stopRecording]);
```

---

### 6. Mocking de `MediaRecorder` em Jest/jsdom

**Decision**: Mock class global + `getUserMedia` no arquivo de teste.

**Rationale**: jsdom não implementa `MediaRecorder` nem `navigator.mediaDevices.getUserMedia`. O mock deve simular o ciclo: `start()` → `ondataavailable` → `stop()` → `onstop`. O timer deve ser mockado com `jest.useFakeTimers()` para testar `recordingTime`.

**Mock pattern**:
```ts
class MockMediaRecorder {
  static isTypeSupported = (type: string) => ["audio/webm", "audio/mp4"].includes(type);
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  chunks: Blob[] = [];

  start() {
    // simula ondataavailable com um chunk fake
    setTimeout(() => {
      this.ondataavailable?.({ data: new Blob(["fake-audio"], { type: "audio/webm" }) });
    }, 100);
  }
  stop() {
    this.onstop?.();
  }
}
```

---

## Estado Atual do Codebase

| Arquivo | Estado atual | Mudanças necessárias |
|---------|-------------|---------------------|
| `src/hooks/useChatAssistant.ts` | Usa `SpeechRecognition` — lógica incorreta para esta feature | **Reescrever** lógica de áudio com `MediaRecorder`, adicionar `audioBlob`, `recordingTime` |
| `src/hooks/useChatAssistant.test.ts` | Testa `getUserMedia` (MediaRecorder mock presente mas hook usa SpeechRecognition) | **Atualizar** mocks e adicionar testes para `recordingTime`, `audioBlob`, `stopRecording` |
| `src/components/chat/ChatWidget.tsx` | Tem botão de microfone, `handleMicToggle`, `audioError`, `transcript` | **Atualizar**: remover `transcript`, adicionar `audioBlob`, `recordingTime`, timer display, effect de `isOpen` |
| `src/context/ChatContext.tsx` | Completo, inalterado | Nenhuma mudança |
| `src/components/chat/ChatStatus.tsx` | Completo, inalterado | Nenhuma mudança |

---

## Compatibilidade de Tipos TypeScript

`MediaRecorder` e `SpeechRecognition` são tipos definidos na `lib.dom.d.ts` do TypeScript. Nenhum pacote `@types` adicional é necessário.

Para o retorno do hook, o tipo `Blob` é nativo — nenhum import adicional.

O `ReturnType<typeof setInterval>` é usado em vez de `number` para compatibilidade cross-runtime (Node.js vs browser).
