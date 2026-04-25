# Contract: BFF Payload para Voz e Texto (EDI-25)

**Feature**: 007-optimize-audio-payload  
**Tipo**: Contrato de integração frontend -> BFF  
**Date**: 2026-04-25

---

## Objetivo

Padronizar o canal de envio para mensagens de voz e texto, mantendo consistência funcional e observabilidade de otimização.

---

## Endpoint lógico

`POST /chat/messages` (nome lógico; URL concreta definida por ambiente)

---

## Contrato de envio: texto

### Request

- `Content-Type`: `application/json`
- `credentials`: `include`

```json
{
  "kind": "text",
  "text": "Mensagem digitada pelo usuário"
}
```

### Response esperada (exemplo)

```json
{
  "ok": true,
  "reply": "Resposta do assistente"
}
```

---

## Contrato de envio: voz otimizada

### Request

- `Content-Type`: `multipart/form-data`
- `credentials`: `include`

Campos obrigatórios no `FormData`:
- `kind`: `audio`
- `audio`: arquivo otimizado (`Blob/File`)
- `originalDurationMs`: duração original em ms
- `optimizedDurationMs`: duração otimizada em ms

### Regras

1. `optimizedDurationMs` deve ser menor que `originalDurationMs`.
2. `audio` deve possuir tamanho maior que zero.
3. Payload inválido não deve ser enviado.

### Response esperada (exemplo)

```json
{
  "ok": true,
  "reply": "Resposta do assistente"
}
```

---

## Tratamento de erro

Resposta de erro (exemplo):

```json
{
  "ok": false,
  "error": "Mensagem de erro compreensível"
}
```

Regras de UX:
1. Mostrar erro claro ao usuário em até 2s.
2. Permitir nova tentativa sem perder estabilidade do chat.
3. Não degradar fluxo textual existente.

---

## Checklist de verificação

- [x] Texto continua enviando com sucesso no canal BFF.
- [x] Voz é enviada apenas após otimização válida.
- [x] Metadados de duração são enviados para observabilidade.
- [x] Falhas de otimização bloqueiam envio inválido e exibem erro claro.
- [x] Falhas de integração (voz/texto) exibem erro claro e permitem retry.
