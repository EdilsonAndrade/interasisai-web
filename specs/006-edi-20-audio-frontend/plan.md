# Implementation Plan: Gravação de Áudio no Frontend (EDI-20 Parte A)

**Branch**: `006-edi-20-audio-frontend` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Linear Task**: [EDI-20 — Parte A](https://linear.app/edilsonandrade/issue/EDI-20/implementar-gravacao-de-audio-e-setup-do-backend-orquestrador)

## Summary

Tornar o botão de microfone do `ChatWidget` funcional usando a **`MediaRecorder API`** nativa do browser. O usuário clica no microfone, o navegador solicita permissão, o áudio é capturado em chunks e consolidado em um `Blob` ao parar. Um timer visual (`M:SS`) dá feedback durante a gravação. O `Blob` fica exposto via hook para consumo futuro pelo backend NestJS (EDI-20 Parte B).

**Abordagem técnica**: substituir a lógica de `SpeechRecognition` atual (que transcrevia para texto) por `MediaRecorder` (que gera arquivo de áudio binário). Dois arquivos modificados (`useChatAssistant.ts`, `ChatWidget.tsx`) + atualização dos testes.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15 (App Router) / React 19  
**Primary Dependencies**: `MediaRecorder API` (nativa), `lucide-react` (ícones), `framer-motion` (animações existentes)  
**Storage**: N/A — o `Blob` existe apenas em memória; persistência é responsabilidade do backend  
**Testing**: Jest 29 + React Testing Library + `jest.useFakeTimers()` para timer; `MediaRecorder` mockado globalmente  
**Target Platform**: Browser (Chrome 88+, Firefox 86+, Edge 88+, Safari 14.1+)  
**Project Type**: Web application frontend (Next.js SPA dentro de App Router)  
**Performance Goals**: Captura de áudio sem jank de UI; timer com precisão de ±100ms por segundo  
**Constraints**: Nenhuma dependência nova de npm; nenhuma mudança no `ChatContext`; nenhuma mudança no `ChatStatus`  
**Scale/Scope**: 2 arquivos de produção modificados + 1 arquivo de teste atualizado

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Observação |
|-----------|--------|-----------|
| **I** — Hooks/UI separation | ✅ PASS | Toda lógica de `MediaRecorder`, timer e estado vive em `useChatAssistant.ts`; componente só renderiza |
| **II** — Context API | ✅ PASS | `ChatContext` inalterado; nenhum estado global novo necessário |
| **III** — DRY | ✅ PASS | `formatTime` como função pura no componente; `getSupportedMimeType` no hook; sem duplicação |
| **IV** — Testes obrigatórios | ✅ PASS | Hook terá 7+ testes cobrindo todos os paths; `MediaRecorder` e `getUserMedia` mockados |
| **V** — TypeScript strict, sem `any` | ✅ PASS | `MediaRecorder`, `MediaStream`, `Blob` são tipos nativos do DOM; `ReturnType<typeof setInterval>` para o timer ref |
| **VI** — Tailwind-only + Framer Motion | ✅ PASS | Timer exibido com classes Tailwind existentes; `animate-pulse motion-reduce:animate-none` no botão |
| **VII** — Semântica + Acessibilidade | ✅ PASS | `aria-label` dinâmico no botão; `aria-live="assertive"` no erro; timer com `aria-label="Tempo de gravação"` |
| **VIII** — Segurança | ✅ PASS | Nenhum input do usuário renderizado como HTML; stream liberado ao fechar painel (prevenção de vazamento de recurso) |

**Result: ALL GATES PASS — proceed to implementation.**

---

## Project Structure

### Documentation (this feature)

```text
specs/006-edi-20-audio-frontend/
├── plan.md              ← este arquivo
├── spec.md
├── research.md          ← decisões de tecnologia e padrões
├── data-model.md        ← shape do hook, estado, diagrama de transições
├── quickstart.md        ← guia de desenvolvimento e testes manuais
├── contracts/
│   └── audio-recording-verification.md  ← contrato hook↔componente e futuro backend
├── checklists/
│   └── requirements.md
└── tasks.md             ← gerado por /speckit.tasks (próximo passo)
```

### Source Code — arquivos afetados

```text
src/
├── hooks/
│   ├── useChatAssistant.ts          ← MODIFICAR: trocar SpeechRecognition por MediaRecorder
│   └── useChatAssistant.test.ts     ← MODIFICAR: atualizar mocks e adicionar testes de áudio
└── components/
    └── chat/
        └── ChatWidget.tsx           ← MODIFICAR: remover transcript, adicionar timer + cleanup effect
```

**Arquivos NÃO alterados**:
- `src/context/ChatContext.tsx`
- `src/components/chat/ChatStatus.tsx`
- `src/components/chat/ChatWidgetLoader.tsx`
- `src/app/layout.tsx`

---

## Implementation Design

### Hook: `useChatAssistant.ts` — Design completo

```ts
// Refs internas (não expostas)
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const streamRef        = useRef<MediaStream | null>(null);
const chunksRef        = useRef<Blob[]>([]);
const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);

// Estado público novo
const [recordingTime, setRecordingTime] = useState(0);
const [audioBlob, setAudioBlob]         = useState<Blob | null>(null);

// Remover: transcript, recognitionRef, getSpeechRecognitionClass

// startRecording():
//   1. setAudioError(null), setAudioBlob(null), chunksRef.current = []
//   2. if typeof MediaRecorder === 'undefined' → setAudioError(...), return
//   3. stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//   4. mimeType = getSupportedMimeType()
//   5. recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
//   6. recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
//   7. recorder.onstop = () => {
//        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" })
//        if (blob.size > 0) { setAudioBlob(blob); console.log(`[Audio Blob] size: ${blob.size} bytes`) }
//        setIsRecording(false)
//        setRecordingTime(0)
//        clearInterval(timerRef.current!)
//      }
//   8. recorder.onerror = () => { setAudioError("Erro na gravação"); setIsRecording(false) }
//   9. recorder.start()
//  10. setIsRecording(true), setRecordingTime(0)
//  11. timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
//  12. catch → setAudioError("Permissão de microfone necessária")

// stopRecording():
//   1. if timerRef.current → clearInterval, timerRef.current = null
//   2. mediaRecorderRef.current?.stop()
//   3. streamRef.current?.getTracks().forEach(t => t.stop())
//   4. setIsRecording(false) — onstop fará setRecordingTime(0)
```

### Componente: `ChatWidget.tsx` — Mudanças

```ts
// REMOVER da desestruturação:
// transcript

// ADICIONAR:
// recordingTime, audioBlob (audioBlob apenas para uso futuro — por ora não renderizado)

// REMOVER effect de sincronização de transcript:
// useEffect(() => { if (!transcript) return; setDraft(transcript); ... }, [transcript]);

// ADICIONAR effect de cleanup ao fechar painel:
useEffect(() => {
  if (!isOpen && isRecording) {
    stopRecording();
  }
}, [isOpen, isRecording, stopRecording]);

// ADICIONAR função pura de formatação (antes do return):
function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ATUALIZAR botão de microfone para incluir timer display:
// - Quando isRecording: mostrar `<span>{formatTime(recordingTime)}</span>` ao lado
// - aria-label dinâmico: isRecording ? "Parar gravação" : "Gravar mensagem de voz"
```

### Testes: `useChatAssistant.test.ts` — Novos testes

```ts
// Manter: mock de MockMediaRecorder (já existia) + mockGetUserMedia
// Atualizar: MockMediaRecorder.start() para simular ondataavailable com Blob fake

// Novos testes de áudio (além dos 4 existentes de mensagens):
// T-A1: startRecording → isRecording true
// T-A2: recordingTime incrementa após 3 segundos (jest.advanceTimersByTime(3000))
// T-A3: stopRecording → audioBlob com size > 0
// T-A4: stopRecording → isRecording false, recordingTime 0
// T-A5: getUserMedia rejected → audioError setado, isRecording false
// T-A6: MediaRecorder não suportado → audioError setado
```

---

## Implementation Phases

### Fase 1 — Atualizar o hook (US1 + US2)

**Arquivos**: `src/hooks/useChatAssistant.ts`

1. Remover toda a lógica de `SpeechRecognition` (função `getSpeechRecognitionClass`, refs, estados de transcript)
2. Adicionar `getSupportedMimeType()` (helper puro)
3. Adicionar estados `recordingTime` e `audioBlob`
4. Adicionar refs `mediaRecorderRef`, `streamRef`, `chunksRef`, `timerRef`
5. Reescrever `startRecording()` — async, com `getUserMedia`, `MediaRecorder`, timer
6. Reescrever `stopRecording()` — limpa timer, para recorder + stream
7. Atualizar o tipo `UseChatAssistantReturn` para remover `transcript` e adicionar `recordingTime`, `audioBlob`

**Critério de conclusão**: sem erros TypeScript; hook exporta interface correta.

---

### Fase 2 — Atualizar os testes (Princípio IV)

**Arquivos**: `src/hooks/useChatAssistant.test.ts`

1. Atualizar `MockMediaRecorder.start()` para simular `ondataavailable` com chunk fake
2. Remover mock de `mediaDevices.getUserMedia` do estilo de teste de SpeechRecognition e restaurar para MediaRecorder
3. Adicionar 6 novos testes (T-A1 a T-A6 listados acima)
4. Manter os 4 testes existentes de mensagens (inalterados)
5. Rodar `npm test` — deve passar 10+ testes

**Critério de conclusão**: `npm test` exit code 0; todos os testes passando.

---

### Fase 3 — Atualizar o componente (US3)

**Arquivos**: `src/components/chat/ChatWidget.tsx`

1. Atualizar desestruturação do hook (remover `transcript`, adicionar `recordingTime`)
2. Remover `useEffect` de sincronização de transcript
3. Adicionar `useEffect` de cleanup ao fechar painel (`isOpen` = false)
4. Adicionar função `formatTime` (antes do JSX)
5. Atualizar seção do botão de microfone para exibir timer quando `isRecording`
6. Verificar que `aria-label` do botão muda dinamicamente
7. Verificar que `motion-reduce:animate-none` está no botão (já estava)

**Critério de conclusão**: sem erros TypeScript no componente; visual correto no browser.

---

### Fase 4 — Validação Final

1. `npm test` — 10+ testes passando, exit code 0
2. `npm run build` — build de produção sem erros TypeScript
3. Teste manual: gravar 3 segundos de áudio e verificar log no console
4. Teste manual: fechar painel durante gravação e verificar que o microfone do OS desliga
5. Teste manual: bloquear permissão de microfone e verificar mensagem de erro

---

## Complexity Tracking

Nenhuma violação da constituição identificada. Sem entradas necessárias.

---

## Post-Plan Constitution Re-Check

| Princípio | Verificação pós-design | Status |
|-----------|----------------------|--------|
| **I** — Hooks/UI | `MediaRecorder`, timer, `audioBlob` 100% no hook; ChatWidget apenas renderiza | ✅ |
| **II** — Context | ChatContext sem alterações | ✅ |
| **III** — DRY | `getSupportedMimeType` encapsula lógica de MIME; `formatTime` é pura; sem repetição | ✅ |
| **IV** — Testes | 6 novos testes de áudio + 4 existentes = 10+ testes; mock de `MediaRecorder` determinístico | ✅ |
| **V** — TypeScript | Tipos DOM nativos; `ReturnType<typeof setInterval>` correto; nenhum `any` | ✅ |
| **VI** — Tailwind + Framer | `animate-pulse motion-reduce:animate-none` no botão; timer em span com classes Tailwind | ✅ |
| **VII** — Semântica | `aria-label` dinâmico no botão; `aria-live="assertive"` no erro; `aria-label` no timer | ✅ |
| **VIII** — Segurança | Stream liberado em `stopRecording` + cleanup ao fechar painel; sem dangerouslySetInnerHTML | ✅ |

**ALL GATES PASS — pronto para `/speckit.tasks`.**

