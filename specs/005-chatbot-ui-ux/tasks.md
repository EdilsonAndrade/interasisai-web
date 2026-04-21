# Tasks: Widget de Chat Multimodal com Feedback de Raciocínio da IA

**Input**: Design documents from `specs/005-chatbot-ui-ux/`
**Prerequisites**: spec.md ✅
**Linear Ticket**: EDI-18
**Branch**: `005-chatbot-ui-ux`

---

## Phase 1: Setup

**Purpose**: Create the folder structure and types needed by every subsequent phase.

- [X] T001 Create `src/context/` folder and empty `ChatContext.tsx` file
- [X] T002 Create `src/hooks/` folder and empty `useChatAssistant.ts` file
- [X] T003 Create `src/components/chat/` folder and empty `ChatWidget.tsx` file

---

## Phase 2: Foundational — Types and Context (blocks all stories)

**Purpose**: Define shared TypeScript types and the global `ChatContext`. Every other file depends on these.

**⚠️ CRITICAL**: Complete before starting any user story.

- [X] T004 Define `ChatMessage` type in `src/context/ChatContext.tsx`
  - Fields: `id: string`, `role: 'user' | 'ai'`, `content: string`, `timestamp: number`
- [X] T005 Create `ChatContext` in `src/context/ChatContext.tsx`
  - State: `isOpen: boolean`
  - Actions: `open()`, `close()`, `toggle()`
  - Export `ChatProvider` component and `useChat` hook
- [X] T006 Add `<ChatProvider>` to `src/app/layout.tsx` wrapping `{children}` — do not change anything else in the file
- [X] T007 Add `<ChatWidget>` (lazy-loaded via `next/dynamic`) at the bottom of `<body>` in `src/app/layout.tsx`

**Checkpoint**: `ChatContext` compiles, `ChatProvider` wraps the app, `ChatWidget` placeholder renders without error.

---

## Phase 3: User Story 1 — Widget de Texto (Desktop) (Priority: P1) 🎯 MVP

**Goal**: A floating chat button appears, the user can open the panel, type a message (Enter to send, Shift+Enter for new line), see it in the conversation area, and close the widget — all with smooth animations.

**Independent Test**: Open the page, click the floating button, type "Olá", press Enter, confirm the message appears on the right side with brand-primary background, then close the widget.

### Tests for User Story 1

- [X] T008 [P] [US1] Create `src/hooks/useChatAssistant.test.ts`
  - Test 1 — sending a message adds it to `messages` with `role: 'user'`
  - Test 2 — after sending, `isLoading` becomes `true` then `false` after mock resolves
  - Test 3 — after loading, a mock AI reply is added to `messages` with `role: 'ai'`
  - Test 4 — audio error sets `audioError` to a non-null string
  - Mock `MediaRecorder` globally in the test file

### Implementation for User Story 1

- [X] T009 [US1] Implement `useChatAssistant` hook in `src/hooks/useChatAssistant.ts`
  - State: `messages: ChatMessage[]`, `isLoading: boolean`, `audioError: string | null`
  - Action: `sendMessage(text: string)` — appends user message, sets `isLoading: true`, resolves with a hardcoded mock AI reply after 1.5 s delay, sets `isLoading: false`
  - No audio logic yet (add in US3)
- [X] T010 [US1] Build the floating trigger button in `src/components/chat/ChatWidget.tsx`
  - A fixed `button` at `bottom-6 right-6 z-50`
  - Icon: `MessageCircle` from `lucide-react`
  - Background: `bg-brand-primary`, hover: `hover:bg-brand-primary-hover`
  - Calls `toggle()` from `useChat()` on click
  - Hidden when `isOpen` is `true`
- [X] T011 [US1] Build the chat panel shell in `src/components/chat/ChatWidget.tsx`
  - Visible only when `isOpen` is `true`
  - Desktop classes (applied always, overridden in US2): `fixed bottom-6 right-6 w-96 h-[600px] rounded-card`
  - Background: `bg-surface-base/80 backdrop-blur-xl`
  - Border: `border border-brand-primary/20`
  - Shadow: `shadow-floating`
  - Wrap open/close with `framer-motion` `AnimatePresence` + `motion.div` (`opacity` 0→1, `y` 20→0)
- [X] T012 [US1] Build the panel header in `src/components/chat/ChatWidget.tsx`
  - Title "Interasis AI" in `font-space-grotesk font-bold text-text-strong`
  - Close button (`X` icon from `lucide-react`) calls `close()` on click
- [X] T013 [US1] Build the messages area in `src/components/chat/ChatWidget.tsx`
  - Scrollable `div` (`overflow-y-auto flex-1`)
  - Maps `messages` array from the hook
  - User messages: aligned right, `bg-brand-primary text-text-inverse rounded-card rounded-br-sm px-4 py-2`
  - AI messages: aligned left, `bg-surface-subtle text-text-strong rounded-card rounded-bl-sm px-4 py-2`
  - Auto-scroll to bottom when `messages` changes (use a `ref` + `scrollIntoView`)
- [X] T014 [US1] Build the text input area in `src/components/chat/ChatWidget.tsx`
  - `textarea` with `rows={1}` and `style={{ height: 'auto' }}`, grows on `onChange` via `scrollHeight`
  - Max height: `max-h-32 overflow-y-auto`
  - Placeholder: `"Digite sua mensagem..."`
  - Border: `border-border-subtle focus:border-brand-primary/50`
  - Enter (no Shift) calls `sendMessage`, then clears textarea and re-focuses it
  - Shift+Enter inserts a newline normally
  - Send icon button (`Send` from `lucide-react`) next to textarea, calls `sendMessage` on click

**Checkpoint**: `npm test` passes (T008). Floating button visible, panel opens/closes with animation, messages appear correctly, Enter sends, Shift+Enter adds line.

---

## Phase 4: User Story 2 — Responsividade Mobile (Priority: P1)

**Goal**: On screens narrower than 768px the chat panel expands to fill the screen (or slides up as a bottom sheet). Closing works the same as desktop.

**Independent Test**: Open DevTools, set viewport to 375px width, open the chat widget — confirm it fills the screen, type and send a message, then close it.

### Implementation for User Story 2

- [X] T015 [US2] Update `ChatWidget` panel classes to be responsive
  - Add `md:` prefixed classes for desktop dimensions (keep the `w-96 h-[600px]` behaviour only on `md+`)
  - Mobile: `inset-0 rounded-none` (full-screen) or `bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl` (bottom-sheet)
  - Use `fixed` positioning in both modes
- [X] T016 [US2] Update `framer-motion` animation variants for mobile vs desktop
  - Desktop: slide up from `y: 20`
  - Mobile (bottom-sheet): slide up from `y: '100%'`
  - Detect mode with a `useMediaQuery` inline check (or Tailwind `md:` classes only — no JS breakpoint needed if layout is handled purely with CSS)

**Checkpoint**: Resize browser to < 768px — chat fills the screen. Resize to > 768px — chat is the fixed panel. Both open/close correctly.

---

## Phase 5: User Story 3 — Entrada por Voz (Priority: P2)

**Goal**: A microphone button starts/stops audio recording. While recording, the mic icon pulses in brand-primary. When stopped, the captured audio Blob is logged to the console. If permission is denied, an error message appears in the UI.

**Independent Test**: Click the mic button, grant permission, observe pulsing icon, click again to stop, check browser console for the Blob object. Then deny permission and verify an error message appears inside the chat input area.

### Implementation for User Story 3

- [X] T017 [US3] Add audio state to `useChatAssistant` hook in `src/hooks/useChatAssistant.ts`
  - New state: `isRecording: boolean`, `audioError: string | null`
  - Action `startRecording()`: calls `navigator.mediaDevices.getUserMedia({ audio: true })`, creates `MediaRecorder`, stores chunks on `ondataavailable`, on `onstop` creates a `Blob` and logs it with `console.log('[Audio Blob]', blob)`
  - Action `stopRecording()`: calls `mediaRecorder.stop()` and `stream.getTracks().forEach(t => t.stop())`
  - If `getUserMedia` throws (permission denied or API unsupported), set `audioError` to `"Permissão de microfone necessária"`
- [X] T018 [P] [US3] Add mic button to the input area in `src/components/chat/ChatWidget.tsx`
  - Icon: `Mic` when not recording, `MicOff` when recording — both from `lucide-react`
  - While `isRecording`: add Tailwind `animate-pulse text-brand-primary` classes to the button
  - Calls `startRecording()` / `stopRecording()` on click (toggle)
- [X] T019 [P] [US3] Show `audioError` message in `src/components/chat/ChatWidget.tsx`
  - When `audioError` is not null, render a `<p>` with the error text below the textarea
  - Style: `text-sm text-red-400` (or nearest error token available)
  - Add an `aria-live="assertive"` attribute for accessibility

**Checkpoint**: `npm test` still passes (T008 now covers the audio error scenario). Mic button toggles, icon pulses during recording, Blob appears in console, error message shows when permission is denied.

---

## Phase 6: User Story 4 — Feedback de Raciocínio da IA (Priority: P3)

**Goal**: After sending a message, a `ChatStatus` component appears in the conversation area showing rotating progress messages with a subtle pulse animation. It disappears when the AI reply arrives.

**Independent Test**: Send any message and observe "Analisando sua empresa...", then "Consultando especialistas...", then "Preparando sua resposta..." cycling with a pulsing dot before the mock reply appears and `ChatStatus` disappears.

### Implementation for User Story 4

- [X] T020 [US4] Create `src/components/chat/ChatStatus.tsx`
  - Props: none (self-contained)
  - Internal state: cycles through `["Analisando sua empresa...", "Consultando especialistas...", "Preparando sua resposta..."]` every 1.5 s using `setInterval` in a `useEffect`
  - Layout: a small `div` aligned left (same side as AI messages)
  - A `span` with classes `inline-block w-2 h-2 rounded-full bg-brand-primary animate-pulse mr-2`
  - Message text in `text-text-body text-sm`
- [X] T021 [US4] Render `<ChatStatus />` conditionally in `src/components/chat/ChatWidget.tsx`
  - Show it inside the messages area when `isLoading` is `true`
  - Remove it (conditionally not rendered) when `isLoading` becomes `false`
  - Wrap with `framer-motion` `AnimatePresence` so it fades in/out smoothly

**Checkpoint**: Send a message, confirm `ChatStatus` cycles through all three messages with pulse animation, then disappears when the mock AI reply arrives.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, accessibility, and validation.

- [X] T022 [P] Add `prefers-reduced-motion` guard: verify `framer-motion` suppresses animations automatically (it does by default); confirm `animate-pulse` on the mic button and ChatStatus dot stop when the OS setting is active — add `motion-reduce:animate-none` Tailwind class to both animated elements
- [X] T023 [P] Run `npm test` and confirm all tests pass with exit code 0
- [X] T024 [P] Run `npm run build` and confirm no TypeScript or build errors
- [X] T025 Verify `src/app/layout.tsx` changes are minimal: only `ChatProvider` wrapping and `ChatWidget` addition — no other modifications

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — core text chat (MVP)
- **Phase 4 (US2)**: Depends on Phase 3 — responsive layout extension
- **Phase 5 (US3)**: Depends on Phase 3 — voice addition (parallel with Phase 4 if needed)
- **Phase 6 (US4)**: Depends on Phase 3 — ChatStatus (parallel with Phases 4–5 if needed)
- **Phase 7 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Must be done first — all others build on it
- **US2 (P1)**: Extends US1 UI — start after T014
- **US3 (P2)**: Extends the hook and input area — start after T014
- **US4 (P3)**: Adds ChatStatus component — start after T014

### Parallel Opportunities per Story

```
Phase 2 (Foundational)
└── T004, T005 → T006 → T007 (sequential)

Phase 3 (US1)
├── T008 [P] — write tests (independent)
└── T009 → T010 → T011 → T012 → T013 → T014 (sequential build-up)

Phase 4 (US2) — after T014
└── T015 → T016 (sequential, small)

Phase 5 (US3) — after T014, can overlap with Phase 4
├── T017 — hook audio logic
└── T018 [P], T019 [P] — UI additions (parallel after T017)

Phase 6 (US4) — after T014
└── T020 → T021 (sequential, small)

Phase 7 (Polish) — all parallel
├── T022 [P]
├── T023 [P]
├── T024 [P]
└── T025
```

---

## Implementation Strategy

**MVP** = Phase 1 + Phase 2 + Phase 3 (US1 only)

After MVP: the floating button works, the chat panel opens/closes with animation, text messages are sent and displayed, and all tests pass. This is independently shippable.

**Full delivery order**: US1 → US2 → US3 → US4 → Polish

**Total tasks**: 25  
**Parallelizable tasks**: T003, T008, T018, T019, T022, T023, T024 (7 tasks)  
**Test tasks**: T008 (covers all 4 mandatory test scenarios from FR-035)
