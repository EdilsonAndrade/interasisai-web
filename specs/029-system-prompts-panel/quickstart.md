# Quickstart: Painel Admin — Prompts do Sistema

## Pré-requisitos

- Backend Python já com a migration do EDI-71 aplicada (`system_prompts` populada com `current_version`/`last_version` a partir do conteúdo hardcoded).
- `NEXT_PUBLIC_PYTHON_BACKEND_URL` configurada no `.env` local apontando para o backend.
- Sessão administrativa válida (cookie `ADMIN_SESSION_COOKIE`), obtida via login em `/admin`.

## Rodando localmente

```bash
npm run dev
```

Acessar `http://localhost:3000/admin`, autenticar, abrir o menu "Painel" → "Prompts do Sistema" (`/admin/system-prompts`).

## Fluxo manual de verificação

1. Acessar `/admin/system-prompts` — a listagem deve mostrar 4 prompts: `routing_agent`, `GROUNDEDNESS_RULE`, `CHITCHAT_NO_KNOWLEDGE_RULE`, `BOOKING_INTEGRITY_RULE`.
2. Selecionar um prompt — o textarea deve carregar o `current_version` vigente.
3. Editar o conteúdo e salvar — deve aparecer toast de sucesso e o novo conteúdo deve permanecer exibido.
4. Tentar salvar conteúdo vazio — deve ser bloqueado com mensagem de validação, sem chamada à API.
5. Acionar "Reverter para versão anterior" — deve pedir confirmação; ao confirmar, o conteúdo anterior ao passo 3 deve voltar a ser exibido.
6. Reverter novamente — deve voltar ao conteúdo salvo no passo 3 (prova de reversibilidade).
7. Clicar em "Ingestão Tenant" no menu "Painel" — deve abrir `/admin` exatamente como antes, sem nenhuma mudança.

## Testes automatizados

```bash
npm test -- useSystemPrompts
npm test -- system-prompts
```

## Rodando os testes do backend (referência do ticket, fora do escopo deste frontend)

```bash
python -m alembic upgrade head
pytest tests/unit/test_system_prompt_loader_fallback.py tests/unit/test_system_prompts_service.py -v
pytest tests/integration/test_system_prompts_api.py -v
```
