# Contract (FUTURO — dependência externa BLOQUEANTE): CORS no Backend Python

> **Status**: NÃO IMPLEMENTADO / CONFIRMADO QUEBRADO. Descoberto durante teste manual em
> 2026-08-19: uma página de teste em `http://localhost:52556` tentando chamar
> `GET /api/v1/chat/init` foi bloqueada pelo navegador com
> `Access-Control-Allow-Origin` ausente na resposta do preflight `OPTIONS`.
>
> **Diferente do contrato de `tenant-widget-config-api.md` (que bloqueia só a US5),
> este bloqueia TODA a feature — sem CORS correto, nenhum site externo consegue
> chamar o backend, mesmo estando corretamente listado em `allowed_domains`.**

## O problema

CORS é decidido pelo **servidor**, checado pelo **navegador**, antes de qualquer lógica
de negócio rodar. O navegador dispara um preflight `OPTIONS` para
`GET /api/v1/chat/init` (por causa do header customizado `X-Tenant-ID`) e exige que a
resposta contenha `Access-Control-Allow-Origin` compatível com a origem que fez a
chamada. Se o backend não responder esse header, a chamada é bloqueada **antes** de
chegar ao código que valida `allowed_domains` — ou seja, o domínio pode estar
perfeitamente cadastrado e autorizado, e mesmo assim a chamada falha.

## Por que uma lista estática de origens no CORS não resolve

O preflight `OPTIONS` **não carrega o header `X-Tenant-ID`** (ele só declara, via
`Access-Control-Request-Headers`, que a requisição real vai enviá-lo). Isso significa
que o backend não sabe **qual tenant** está sendo chamado no momento em que precisa
decidir o CORS. Como `allowed_domains` é por tenant, uma configuração estática de CORS
(uma lista fixa de origens no `CORSMiddleware`, por exemplo) não é capaz de refletir
isso corretamente.

## Padrão recomendado (usado por Intercom, Stripe.js, Crisp, etc. em endpoints públicos de widget)

1. **CORS permissivo no nível de transporte**, apenas para os endpoints públicos do
   widget (`GET /api/v1/chat/init`, `POST /api/v1/chat`): responder o preflight
   `OPTIONS` refletindo a origem recebida (ou `Access-Control-Allow-Origin: *`, já que
   essas rotas não usam cookies — a autenticação é via `Authorization: Bearer`, não
   `credentials: include`).
2. **A validação de domínio de verdade acontece dentro do handler**, depois do CORS já
   ter deixado a requisição passar:
   - Ler `X-Tenant-ID`.
   - Buscar `allowed_domains` daquele tenant.
   - Comparar com o `Origin` (ou `Referer`, como fallback) real da requisição.
   - Se não bater, responder `403` — **mas ainda incluindo o header
     `Access-Control-Allow-Origin`** na resposta de erro, senão o navegador transforma
     esse `403` em um erro de CORS genérico e o JavaScript do cliente nunca consegue
     ler o status real.

Do ponto de vista do widget (`src/widget/`), o resultado final é o mesmo nos dois
casos (bloqueio total de CORS vs. `403` de negócio): `initializeChatSession` cai no
`catch`/`!response.ok` e retorna `ok: false`, e o widget corretamente não renderiza
nada (FR-004). A diferença é que, com o CORS mal configurado, **nenhum cliente
autorizado consegue usar o widget** — não é uma falha de segurança, é uma falha de
funcionamento total.

## Nota sobre porta em `allowed_domains`

`Origin` inclui esquema + host + porta (ex.: `http://localhost:52556`). Se
`allowed_domains` for cadastrado só com o host (ex.: `meusite.com`, sem porta), o
backend precisa decidir explicitamente a regra de comparação — normalmente
**ignorar a porta** (ou fixá-la em 443/HTTPS por padrão) faz sentido em produção, já
que sites reais raramente expõem portas customizadas. Isso deve ser resolvido pela
mesma pessoa/time que implementa a checagem do item acima, não é um problema deste
repositório.

## Ação necessária

Levar este documento para quem mantém o backend Python. Nenhuma tarefa deste
repositório (`interasisai-web`) pode contornar isso — é puramente do lado do
servidor da API.
