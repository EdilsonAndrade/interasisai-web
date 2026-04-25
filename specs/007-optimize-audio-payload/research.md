# Research: Otimização de Payload de Áudio e Integração BFF (EDI-25)

**Feature**: 007-optimize-audio-payload  
**Date**: 2026-04-25  
**Status**: Complete

---

## Decisions

### 1. Estratégia de otimização de áudio (time-stretch)

**Decision**: Aplicar time-stretch no cliente via `Web Audio API` usando `AudioContext`/`OfflineAudioContext` com fator moderado (>1), gerando novo `Blob` antes do envio.

**Rationale**: A EDI-25 exige reduzir duração do payload sem quebrar inteligibilidade. A abordagem com APIs nativas evita dependências pesadas (como ffmpeg.wasm), mantém bundle menor e permite controle do fator de aceleração para preservar compreensão.

**Alternatives considered**:
- `ffmpeg.wasm`: descartada por custo alto de bundle, inicialização e CPU em dispositivos mais fracos.
- Enviar áudio bruto e otimizar no backend: descartada porque não atende o objetivo de reduzir payload já na borda (frontend).
- Aceleração agressiva (fator alto): descartada por risco direto de perda de inteligibilidade (FR-002).

---

### 2. Contrato de integração com BFF para voz e texto

**Decision**: Manter um canal único de integração BFF com payload condicionado por tipo:
- Voz: `multipart/form-data` com arquivo otimizado e metadados.
- Texto: `application/json` com mensagem textual.

**Rationale**: A especificação pede consistência de experiência em um mesmo canal para voz e texto (US2, FR-004, FR-006, FR-010). O padrão reduz divergência de fluxo e facilita observabilidade unificada.

**Alternatives considered**:
- Endpoints separados para voz e texto: descartada por aumentar superfície de manutenção e risco de regressão de comportamento.
- Sempre usar `multipart/form-data` (inclusive texto): descartada por complexidade desnecessária para texto puro.

---

### 3. Evidência de redução de duração para observabilidade

**Decision**: Registrar e transportar metadados de duração original e otimizada:
- Log estruturado no frontend (debug/observabilidade local).
- Campos de metadado no envio de voz (`originalDurationMs`, `optimizedDurationMs`).

**Rationale**: FR-007 e SC-001 exigem comprovação auditável da redução de duração. Metadados simples permitem validar métricas sem acoplar ao formato binário do arquivo.

**Alternatives considered**:
- Logar apenas no console sem metadados enviados: descartada por baixa rastreabilidade em homologação.
- Medição apenas no backend: descartada por perder visibilidade da etapa de otimização no cliente.

---

### 4. Estratégia de falhas e recuperação

**Decision**: Tratar falhas em duas camadas:
- Falha de otimização: bloquear envio de payload inválido, exibir erro claro e permitir nova tentativa.
- Falha de envio BFF (voz/texto): preservar estado do chat e fornecer feedback acionável em até 2s.

**Rationale**: Atende FR-008, FR-009 e SC-004 sem quebrar o fluxo de conversa.

**Alternatives considered**:
- Fallback silencioso para áudio bruto: descartada por mascarar erro funcional e comprometer objetivo de custo/performance.
- Repetição automática cega de requisição: descartada por risco de duplicidade de mensagem.

---

### 5. Local de implementação no frontend

**Decision**: Concentrar orquestração de envio no hook `useChatAssistant` com extração da chamada HTTP para módulo de serviço dedicado (ex.: `src/services/chatGateway.ts`).

**Rationale**: Mantém separação entre apresentação e lógica (Constituição I), evita fetch em componentes e facilita testes isolados.

**Alternatives considered**:
- Chamada HTTP diretamente em `ChatWidget.tsx`: descartada por violar a constituição.
- Lógica distribuída entre componente e hook: descartada por aumentar acoplamento e dificultar TDD.
