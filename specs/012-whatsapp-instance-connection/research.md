# Research: Conexão de Instâncias WhatsApp

## 1. Cliente da API Python

**Decision**: Estender `src/services/pythonBackend.ts` e `pythonBackend.types.ts` com `createWhatsAppInstance` e `getWhatsAppQrCode`, retornando uniões discriminadas. Extrair uma leitura de `baseUrl` que não exija `NEXT_PUBLIC_TENANT_ID`; o tenant padrão continua obrigatório apenas no fluxo de chat.

**Rationale**: O projeto já centraliza nesse serviço configuração, `fetch`, parsing seguro, mensagens de rede e tipos. A operação de criação recebe `tenant_id` no corpo e a recuperação recebe apenas `instance_name`, portanto acoplá-las ao tenant público padrão produziria uma pré-condição falsa.

**Alternatives considered**:
- Criar um segundo cliente HTTP: rejeitado por duplicar configuração, parsing e tratamento de rede.
- Reusar `getPythonBackendConfig()` sem alteração: rejeitado porque exige tenant de chat para operações administrativas que não usam esse valor.

## 2. Contrato de QR Code

**Decision**: Consumir exatamente `POST /api/v1/whatsapp/instances` e `GET /api/v1/whatsapp/instances/{instance_name}/qrcode`. Aceitar somente `qrcode_base64` no formato `data:image/png;base64,<payload>` com payload não vazio e caracteres Base64 válidos.

**Rationale**: O backend já entrega JSON com data URL completa. A validação evita imagem quebrada, conteúdo inesperado e esquemas de URL não confiáveis antes da renderização.

**Alternatives considered**:
- Converter `Blob` no cliente: rejeitado porque contradiz o contrato JSON fornecido.
- Aceitar qualquer `data:image/*`: rejeitado porque a especificação limita a PNG e uma allowlist estrita reduz risco.

## 3. Formulário e validação

**Decision**: Adicionar `zod`, `react-hook-form` e `@hookform/resolvers`. Um schema compartilhado aplica `trim()` e exige `tenant_id` e `instance_name` não vazios; o hook coordena submissão e serviço.

**Rationale**: É exigência explícita da constituição e fornece erros associados aos campos sem duplicar estado manual.

**Alternatives considered**:
- Validação manual com `useState`: rejeitada por violar a constituição e repetir o padrão que já precisa ser modernizado no login.
- Validar apenas no backend: rejeitada porque não fornece feedback imediato nem cumpre FR-003.

## 4. Estado efêmero e navegação

**Decision**: Montar `WhatsAppConnectionProvider` no layout de `/admin/whatsapp`. O provider mantém QR, instância, operação, erro e `AbortController` em memória. Após criação, a navegação usa `/admin/whatsapp/{instanceName}/qrcode`; se essa página carregar sem QR correspondente, executa o GET automaticamente.

**Rationale**: O contexto sobrevive à navegação cliente entre as duas páginas sem persistir material temporário. A rota contém somente o nome codificado da instância, necessário para recuperar um novo QR após refresh ou acesso direto.

**Alternatives considered**:
- Passar `qrcode_base64` na URL: rejeitado por exposição em histórico, logs e limites de URL.
- Guardar QR em localStorage/sessionStorage: rejeitado por aumentar a vida útil e exposição de um dado operacional temporário.
- Sempre descartar a resposta do POST e fazer GET: rejeitado por adicionar latência e ignorar o QR retornado na criação.

## 5. Concorrência e respostas obsoletas

**Decision**: Cada operação cancela a anterior com `AbortController` e recebe um identificador monotônico; somente a operação ativa pode atualizar o estado. Botões permanecem desabilitados enquanto a operação está em andamento.

**Rationale**: Cancelamento reduz trabalho, e o identificador protege mesmo quando o mock, runtime ou backend não respeita aborto imediatamente.

**Alternatives considered**:
- Apenas desabilitar botões: rejeitado porque navegação, retry e efeitos de montagem ainda podem iniciar operações concorrentes.

## 6. Renderização do QR Code

**Decision**: Usar `next/image` com largura/altura fixas, `unoptimized`, `priority`, texto alternativo específico e quadro responsivo estável. A CSP atual já permite `img-src data:` e não precisa mudar.

**Rationale**: Cumpre a constituição, evita tentativa inútil de otimização de data URL e mantém dimensões previsíveis para leitura e layout.

**Alternatives considered**:
- `<img>` nativa: tecnicamente simples, mas rejeitada porque a constituição exige `next/image` para todas as imagens.
- Persistir arquivo PNG em `public/`: rejeitado por tratar como permanente um código temporário e específico de tenant.

## 7. Sessão administrativa

**Decision**: Migrar o login para `POST /api/admin/session`, validando `ADM_USER` e `ADM_PWD` somente no servidor e emitindo cookie `admin_session` curto, `httpOnly`, `sameSite=strict`, `secure` em produção e assinado por HMAC-SHA256 com `ADMIN_SESSION_SECRET`. Um helper server-side verifica cookie/expiração nas páginas protegidas; `DELETE` encerra a sessão.

**Rationale**: O login atual compara `NEXT_PUBLIC_ADM_USER/PWD` no browser, expondo credenciais e não protegendo rotas dedicadas. A migração é necessária para FR-017 e para o gate de segurança da constituição.

**Alternatives considered**:
- Persistir um booleano em sessionStorage: rejeitado porque pode ser forjado e não protege renderização de rota.
- Middleware/proxy global: rejeitado nesta entrega porque verificações nos wrappers de servidor cobrem apenas as páginas admin afetadas com menor superfície; o endpoint continua responsável por emitir/invalidar sessão.
- Biblioteca de autenticação completa: rejeitada por excesso de complexidade para uma única conta administrativa já configurada por ambiente.

## 8. Páginas, metadata e testes

**Decision**: Manter `page.tsx` como componente servidor com metadata e verificação de sessão, delegando interação para componentes cliente. Testar serviço, sessão, hook/context e componentes com Jest/RTL, mocks de rede, router e cookies.

**Rationale**: Separa fronteiras servidor/cliente, atende SEO/acessibilidade da constituição e mantém testes determinísticos.

**Alternatives considered**:
- Páginas inteiramente `"use client"`: rejeitadas porque impedem metadata estática no mesmo arquivo e misturam controle de acesso com apresentação.
