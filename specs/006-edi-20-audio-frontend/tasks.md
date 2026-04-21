# Tasks: Gravação de Áudio no Frontend (EDI-20 Parte A)

**Input**: Design documents from `specs/006-edi-20-audio-frontend/`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contract**: [contracts/audio-recording-verification.md](./contracts/audio-recording-verification.md)  
**Linear Task**: [EDI-20 — Parte A](https://linear.app/edilsonandrade/issue/EDI-20/implementar-gravacao-de-audio-e-setup-do-backend-orquestrador)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- Exact file paths included in every description

---

## Phase 1: Setup (Verificação do estado atual)

**Purpose**: Confirmar o estado dos arquivos existentes antes de modificar qualquer coisa.  
Estes arquivos já existem — não criar, apenas auditar para garantir que as modificações nas próximas fases sejam corretas.

- [X] T001 Ler `src/hooks/useChatAssistant.ts` e confirmar que usa `SpeechRecognition` (lógica a ser substituída)
- [X] T002 [P] Ler `src/hooks/useChatAssistant.test.ts` e anotar os 4 testes existentes que devem ser preservados
- [X] T003 [P] Ler `src/components/chat/ChatWidget.tsx` e localizar: desestruturação de `transcript`, `useEffect` de transcript sync, e a seção do botão de microfone

**Checkpoint**: Estado atual confirmado — prontos para implementar as fases seguintes

---

## Phase 2: Foundational (Atualizar o hook — base para US1, US2, US3)

**Purpose**: Toda a lógica de `MediaRecorder`, timer e `audioBlob` vive no hook. Esta fase é pré-requisito para US1, US2 e US3.

⚠️ CRÍTICO: As fases US1/US2/US3 dependem desta fase estar completa primeiro.

- [X] T004 Substituir o tipo `UseChatAssistantReturn` em `src/hooks/useChatAssistant.ts`:
  - Remover: `transcript: string`
  - Adicionar: `recordingTime: number`, `audioBlob: Blob | null`
  - Manter: `messages`, `isLoading`, `isRecording`, `audioError`, `sendMessage`, `startRecording`, `stopRecording`

- [X] T005 Remover de `src/hooks/useChatAssistant.ts` toda a lógica de `SpeechRecognition`:
  - Apagar: tipo `SpeechRecognitionCtor`, função `getSpeechRecognitionClass()`
  - Apagar: `const [transcript, setTranscript]` e `const recognitionRef`
  - Apagar: conteúdo interno de `startRecording` e `stopRecording` relacionado a `recognition`

- [X] T006 Adicionar em `src/hooks/useChatAssistant.ts` a função helper `getSupportedMimeType()` (antes do componente do hook):

- [X] T007 Adicionar em `src/hooks/useChatAssistant.ts` os novos estados e refs dentro de `useChatAssistant()`:

- [X] T008 Implementar `startRecording()` em `src/hooks/useChatAssistant.ts`:

- [X] T009 Implementar `stopRecording()` em `src/hooks/useChatAssistant.ts`:

- [X] T010 Atualizar o `return` de `useChatAssistant()` em `src/hooks/useChatAssistant.ts` para incluir os novos campos:

**Checkpoint**: Hook compila sem erros TypeScript — `npm run build` sem erros nesta camada

---

## Phase 3: User Story 1 — Gravar e gerar audioBlob (Priority: P1) 🎯 MVP

**Goal**: O usuário clica no microfone, grava áudio, para e um `Blob` com `size > 0` é logado no console.

**Independent Test**: `npm run dev` → abrir chat → clicar microfone → falar → parar → verificar log `[Audio Blob] size: X bytes` no console.

- [X] T011 [P] [US1] Escrever testes do contrato de gravação em `src/hooks/useChatAssistant.test.ts`:
  - Atualizar `MockMediaRecorder.start()` para simular `ondataavailable` via `setTimeout(100ms)` com `new Blob(["fake-audio"], { type: "audio/webm" })` e depois acionar `onstop` ao chamar `stop()`
  - Adicionar mock de `mediaDevices.getUserMedia` que retorna `{ getTracks: () => [{ stop: jest.fn() }] }` (já existe, verificar se está correto para `MediaRecorder`)
  - Teste T-A1: `startRecording()` → `isRecording` deve ser `true`
  - Teste T-A2: após `jest.advanceTimersByTime(3000)`, `recordingTime` deve ser `3`
  - Teste T-A3: `stopRecording()` após gravação com chunk fake → `audioBlob` tem `size > 0`
  - Teste T-A4: `stopRecording()` → `isRecording` volta a `false` e `recordingTime` volta a `0`

- [X] T012 [US1] Rodar `npm test -- useChatAssistant` e corrigir qualquer falha nos testes T-A1 a T-A4 em `src/hooks/useChatAssistant.test.ts` + confirmar que os 4 testes originais de mensagens ainda passam

---

## Phase 4: User Story 2 — Permissão negada e erros (Priority: P2)

**Goal**: O usuário sem permissão de microfone vê uma mensagem de erro clara; o estado de gravação permanece `false`.

**Independent Test**: Bloquear microfone nas configurações do browser → clicar no ícone → ver mensagem `"Permissão de microfone necessária"` no chat.

- [X] T013 [P] [US2] Escrever testes de erro em `src/hooks/useChatAssistant.test.ts`:
  - Teste T-A5: `mockGetUserMedia.mockRejectedValueOnce(new Error("NotAllowedError"))` → após `startRecording()`, `audioError` deve ser `"Permissão de microfone necessária"` e `isRecording` deve ser `false`
  - Teste T-A6: simular `typeof MediaRecorder === "undefined"` (temporariamente `global.MediaRecorder = undefined`) → `startRecording()` → `audioError` deve conter `"não suportada"` e `isRecording` deve ser `false`

- [X] T014 [US2] Rodar `npm test -- useChatAssistant` e confirmar que T-A5 e T-A6 passam; total de testes no arquivo deve ser 10+

---

## Phase 5: User Story 3 — Feedback visual no ChatWidget (Priority: P3)

**Goal**: Enquanto `isRecording` é `true`, o UI exibe ícone `MicOff`, timer `M:SS`, animação de pulso e `aria-label` dinâmico.

**Independent Test**: Verificar visualmente no browser — após clicar no microfone o timer aparece (`0:01`, `0:02`...) e o ícone muda para `MicOff`.

- [X] T015 [US3] Atualizar a desestruturação do hook em `src/components/chat/ChatWidget.tsx`:
  - Remover: `transcript`
  - Adicionar: `recordingTime`, `audioBlob` (sem remover os outros campos existentes)

- [X] T016 [US3] Remover de `src/components/chat/ChatWidget.tsx` o `useEffect` de sincronização de transcript com o textarea:
  ```ts
  // Remover este bloco inteiro:
  useEffect(() => {
    if (!transcript) return;
    setDraft(transcript);
    ...
  }, [transcript]);
  ```

- [X] T017 [US3] Adicionar em `src/components/chat/ChatWidget.tsx` o `useEffect` de cleanup de gravação ao fechar painel (logo após os outros useEffects existentes):
  ```ts
  useEffect(() => {
    if (!isOpen && isRecording) {
      stopRecording();
    }
  }, [isOpen, isRecording, stopRecording]);
  ```

- [X] T018 [US3] Adicionar em `src/components/chat/ChatWidget.tsx` a função `formatTime` (antes do `return`, depois dos callbacks):
  ```ts
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  ```

- [X] T019 [P] [US3] Atualizar a seção do botão de microfone em `src/components/chat/ChatWidget.tsx` para:
  1. `aria-label` dinâmico: `isRecording ? "Parar gravação" : "Gravar mensagem de voz"` (já deve existir — confirmar)
  2. Adicionar timer display ao lado do botão, visível apenas quando `isRecording`:
     ```tsx
     {isRecording && (
       <span
         aria-label="Tempo de gravação"
         className="min-w-[2.5rem] text-center text-xs font-mono text-brand-primary"
       >
         {formatTime(recordingTime)}
       </span>
     )}
     ```
  3. Confirmar que o botão tem `animate-pulse motion-reduce:animate-none` quando `isRecording` (já deve existir — confirmar)
  4. Confirmar ícone `Mic` / `MicOff` correto (já deve existir — confirmar)

---

## Phase 6: Polish & Validação Final

**Purpose**: Confirmar que tudo integra, testes passam e build está limpo.

- [X] T020 [P] Rodar `npm test` (suite completa) e confirmar exit code 0 — todos os testes passando incluindo os 6 suites existentes + novos testes de áudio em `useChatAssistant.test.ts`

- [X] T021 [P] Rodar `npm run build` e confirmar que não há erros TypeScript — especialmente:
  - `UseChatAssistantReturn` sem `transcript`
  - `ChatWidget` sem referência a `transcript`
  - `startRecording: () => void` (síncrono no tipo, mesmo que internamente use async)

- [ ] T022 Testar manualmente no browser (`npm run dev`):
  1. Abrir chat em `http://localhost:3000`
  2. Clicar microfone → aceitar permissão → verificar que ícone muda para `MicOff` e timer inicia (`0:01`, `0:02`...)
  3. Falar por ~3 segundos → parar → verificar log `[Audio Blob] size: X bytes` no console (size > 0)
  4. Fechar painel durante gravação → verificar que o indicador de microfone do OS se desliga

- [X] T023 [P] Verificar acessibilidade do botão de microfone em `src/components/chat/ChatWidget.tsx`:
  - `aria-label` dinâmico alterna entre "Gravar mensagem de voz" e "Parar gravação"
  - Timer tem `aria-label="Tempo de gravação"`
  - Erro de microfone tem `aria-live="assertive"` (já existia — confirmar)

---

## Dependencies (ordem de execução por User Story)

```
Phase 1 (T001-T003) — setup/auditoria
    │
    ▼
Phase 2 (T004-T010) — hook base ← BLOQUEANTE para tudo abaixo
    │
    ├── Phase 3 US1 (T011-T012) — testes do fluxo principal
    │
    ├── Phase 4 US2 (T013-T014) — testes de erros [paralelo com US1]
    │
    └── Phase 5 US3 (T015-T019) — UI do ChatWidget [paralelo com US1/US2]
            │
            ▼
        Phase 6 (T020-T023) — validação final
```

## Parallel Execution Examples

**Phase 2**: T004 → T005 → T006 → T007 (sequenciais, mesmo arquivo)  
**Phases 3+4+5**: T011-T012 (US1) || T013-T014 (US2) || T015-T019 (US3) — paralelos após Phase 2  
**Phase 6**: T020 || T021 || T023 — paralelos entre si; T022 após T020+T021

## Implementation Strategy

**MVP**: Phase 1 + Phase 2 + Phase 3 (T001-T012) — hook funcional com gravação real e testes. O botão de microfone captura áudio e loga o Blob. Sem timer visual ainda — apenas o fluxo core.

**Incremento 2**: Phase 4 (T013-T014) — cobertura de erros e permissão negada.

**Incremento 3**: Phase 5 (T015-T019) — feedback visual completo (timer, ícone correto, pulse).

**Done**: Phase 6 (T020-T023) — validação final com build limpo e testes completos.

---

## Summary

| Métrica | Valor |
|---------|-------|
| Total de tarefas | 23 |
| US1 (fluxo principal) | 2 tarefas (T011-T012) |
| US2 (erros/permissão) | 2 tarefas (T013-T014) |
| US3 (feedback visual) | 5 tarefas (T015-T019) |
| Foundational (hook) | 7 tarefas (T004-T010) |
| Setup/Polish | 7 tarefas (T001-T003, T020-T023) |
| Tarefas paralelas [P] | 10 |
| Arquivos modificados | 2 (`useChatAssistant.ts`, `ChatWidget.tsx`) + 1 teste |
| MVP mínimo | T001-T012 (Phases 1-3) |
