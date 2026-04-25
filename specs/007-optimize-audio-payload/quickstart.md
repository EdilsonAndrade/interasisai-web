# Quickstart: Otimização de Payload de Áudio e Integração BFF (EDI-25)

**Feature**: 007-optimize-audio-payload  
**Date**: 2026-04-25

---

## Pré-requisitos

- Node.js 20+
- Dependências instaladas (`npm install`)
- Microfone disponível para testes manuais
- Variáveis de ambiente do endpoint BFF configuradas para ambiente local/homolog

---

## Escopo de implementação previsto

1. Evoluir o hook `useChatAssistant` para:
- Aplicar otimização de áudio antes do envio.
- Diferenciar fluxo de envio de voz e texto.
- Centralizar estados de erro/retry.

2. Introduzir camada de integração HTTP dedicada (serviço) para:
- Envio de texto ao BFF.
- Envio de áudio otimizado ao BFF com metadados.

3. Garantir cobertura de testes para:
- Sucesso de envio de texto.
- Sucesso de envio de áudio otimizado com duração reduzida.
- Erros de otimização e de integração.

---

## Fluxo local sugerido

```bash
npm test -- --runInBand src/hooks/useChatAssistant.test.ts src/hooks/audioOptimization.test.ts src/services/chatGateway.test.ts src/components/chat/ChatWidget.test.tsx
npm run build
npm run dev
```

1. Abrir o chat na aplicação local.
2. Gravar áudio de 3 a 5 segundos.
3. Validar que o envio ocorre com duração otimizada menor que a original.
4. Enviar mensagem textual e validar continuidade normal do chat.
5. Simular indisponibilidade do BFF e validar feedback de erro com possibilidade de nova tentativa.

---

## Critérios de validação manual

1. Voz: duração otimizada menor que duração capturada.
2. Voz: mensagem segue compreensível no processamento conversacional.
3. Texto: não há regressão no envio padrão.
4. Falhas: feedback exibido em até 2 segundos.
5. Estabilidade: UI não trava após erro de otimização/envio.

---

## Testes automatizados mínimos

1. Hook: caminho feliz de otimização + envio de voz.
2. Hook: envio textual no canal BFF.
3. Hook: falha de otimização não dispara payload inválido.
4. Hook/serviço: falha HTTP retorna erro amigável e marca retry.
5. Componente: renderiza estado de erro sem quebrar interação do usuário.

---

## Evidências de aceite (2026-04-25)

1. Suítes focadas executadas com sucesso:
- `src/hooks/useChatAssistant.test.ts`
- `src/hooks/audioOptimization.test.ts`
- `src/services/chatGateway.test.ts`
- `src/components/chat/ChatWidget.test.tsx`

2. Build de produção executado com sucesso (`next build`) sem erros de TypeScript.

3. Evidência funcional adicionada no hook de chat com log estruturado de otimização:
- `originalDurationMs`
- `optimizedDurationMs`
- `optimizationFactor`

4. Retry de falhas de integração implementado para payload textual e de voz com último payload válido.
