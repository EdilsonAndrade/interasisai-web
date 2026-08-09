# Quickstart: Gerenciamento Administrativo de Tenants

## Prerequisites

- Node.js/npm compatível com o projeto Next.js 16 existente.
- API Python acessível pela configuração pública de origem já usada pelo frontend.
- Credenciais e segredo da sessão administrativa configurados no servidor.

## Configuration

```dotenv
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000
ADM_USER=<admin-user>
ADM_PWD=<admin-password>
ADMIN_SESSION_SECRET=<high-entropy-random-secret>
```

Não versionar valores reais e não registrar nomes, IDs, Google Calendar IDs ou respostas de tenants.

## Validation Flow

1. Execute `npm run dev` e abra `/admin`.
2. Confirme que um usuário sem sessão não vê a navegação administrativa e é redirecionado ao acessar `/admin/tenants` diretamente.
3. Autentique-se e confirme o item "Tenants", seu ícone e estado ativo.
4. Abra "Novo tenant", confirme os campos ID do tenant, nome e ID do Google Calendar, envie-os vazios e valide os erros sem chamada de rede.
5. Cadastre um tenant válido e confirme loading, bloqueio de envio duplicado, fechamento do formulário e "Tenant cadastrado com sucesso".
6. Consulte o tenant pelo ID e confirme a exibição de identificação, nome, calendário e datas.
7. Edite nome e calendário e confirme "Tenant atualizado com sucesso".
8. Inicie a exclusão, confira o nome no diálogo, cancele e depois confirme; valide "Tenant excluído com sucesso".
9. Simule 404, 422, resposta inválida e falha de rede; confirme feedback acessível e preservação dos dados editáveis.
10. Valide teclado, Escape, retorno de foco e contenção em larguras mobile e desktop.

## Automated Checks

```bash
npm test -- --runInBand
npm run lint
npm run build
```

## Backend Dependencies

- Não existe `GET /api/v1/tenants/`. A interface não chama nem simula listagem; a região de consulta por ID poderá receber uma tabela quando um contrato oficial for criado.
- O backend precisa alinhar `TenantResponse` aos retornos de criação, consulta, atualização e exclusão. O frontend valida respostas de leitura e escrita e trata formas incompatíveis como falha.
- O backend precisa documentar se `DELETE /api/v1/tenants/{tenant_id}` retorna `204`, corpo de confirmação ou o tenant excluído. O frontend aceita qualquer resposta HTTP bem-sucedida sem depender do corpo.
- O schema `TenantCreate` exige `tenant_id`, `name` e `google_calendar_id`; os três campos são enviados no corpo do POST.

## Implementation Validation (2026-08-08)

- `npm test -- --runInBand`: PASS, 197 testes.
- ESLint focado em todos os arquivos da feature: PASS.
- `npm run build`: PASS; `/admin/tenants` foi gerada como rota dinâmica protegida.
- `npm run lint`: bloqueado por erro preexistente `no-explicit-any` em `src/hooks/useChatAssistant.ts:305`, fora desta feature.
- Navegador mobile: acesso sem sessão redirecionou para `/admin`, não exibiu a navegação administrativa e não apresentou overflow horizontal (`scrollWidth` igual ao viewport).
- Fluxos autenticados, foco, Escape, formulários e estados responsivos foram validados por RTL. A validação visual autenticada no navegador não foi executada para evitar leitura ou transporte das credenciais locais do `.env`.
- A API Python real não foi chamada para evitar criar, alterar ou excluir tenants reais; os quatro contratos foram validados com mocks determinísticos.