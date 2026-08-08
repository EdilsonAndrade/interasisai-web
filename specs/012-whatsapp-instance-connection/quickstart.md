# Quickstart: Conexão de Instâncias WhatsApp

## Prerequisites

- Node.js/npm compatible with the existing Next.js 16 project.
- Python API reachable through `NEXT_PUBLIC_PYTHON_BACKEND_URL`.
- An existing tenant and an unused instance name for the create scenario.

## Configuration

Configure server-only admin values in the local environment without the `NEXT_PUBLIC_` prefix:

```dotenv
ADM_USER=<admin-user>
ADM_PWD=<admin-password>
ADMIN_SESSION_SECRET=<high-entropy-random-secret>
```

Keep the existing public backend origin:

```dotenv
NEXT_PUBLIC_PYTHON_BACKEND_URL=https://api.interasisai.com.br
```

Do not place real secret values in committed files or logs.

## Dependencies

During implementation, add the constitution-required form dependencies:

```bash
npm install zod react-hook-form @hookform/resolvers
```

## Validation Flow

1. Start the application with `npm run dev` and open `/admin`.
2. Verify invalid credentials show a generic error and do not create a session cookie.
3. Sign in with configured credentials and open `/admin/whatsapp`.
4. Submit blank fields and verify accessible inline validation without a network call.
5. Create an instance with a valid tenant/name; verify loading appears, duplicate actions are disabled, and the QR route opens with the returned PNG.
6. Return to the module and use `Reconectar / Ver QR Code`; verify it calls the GET contract and replaces the matching QR only after a valid response.
7. Refresh the QR route; verify the page retrieves a new QR rather than creating another instance.
8. Mock malformed `qrcode_base64`, 404, 409, 500 and network failure; verify no broken image and retry/return remain available.
9. Start two requests in reverse completion order; verify the older response cannot replace the newest state.
10. Delete/expire the admin cookie and access each WhatsApp route directly; verify redirect to `/admin`.
11. Check desktop and mobile widths and scan a returned QR from each layout.

## Automated Checks

```bash
npm test -- --runInBand
npm run lint
npm run build
```

Focused suites should cover the Python backend service/types, admin session helper/route, WhatsApp hook/context, form, QR view and route access behavior.

## Implementation Validation (2026-08-08)

- `npm test -- --runInBand`: PASS, 167 tests.
- Focused ESLint for all feature files: PASS.
- `npm run build`: PASS; `/admin`, `/admin/whatsapp`, `/admin/whatsapp/[instanceName]/qrcode`, and `/api/admin/session` generated successfully.
- Browser validation: PASS for login, protected navigation, required fields, mocked QR recovery, scan instructions, **Concluído / Fechar**, and mobile overflow.
- Global `npm run lint`: blocked by a pre-existing `no-explicit-any` error in `src/hooks/useChatAssistant.ts:305`, outside this feature.
- Live Python API create/reconnect was not executed to avoid creating or changing a real customer instance; service behavior is covered with deterministic mocked contracts.
- `npm audit --omit=dev` reports existing high-severity advisories in the Next.js/PostCSS/Sharp dependency chain. The suggested forced fix upgrades Next.js outside the declared range and was intentionally not applied as part of this feature.
