# UI Route Contract

## `/admin`

- Without a valid session: renders the login form.
- With a valid session: renders the existing ingestion dashboard plus navigation to WhatsApp instances.
- Login submits to the admin session endpoint and refreshes the server-rendered session state after success.

## `/admin/whatsapp`

- Requires a valid admin session.
- Renders `Tenant ID`, `Nome da instância`, `Cadastrar e gerar QR Code`, and `Reconectar / Ver QR Code`.
- Create requires both fields; reconnect requires only instance name.
- Both operations expose immediate loading, disable concurrent actions, preserve fields on error, and announce feedback accessibly.
- Successful create navigates to the encoded QR route while retaining the returned QR in memory.

## `/admin/whatsapp/{instanceName}/qrcode`

- Requires a valid admin session.
- Displays a stable QR frame, operation state and the decoded instance name.
- Uses the in-memory QR only when it belongs to the route instance.
- If no matching QR exists after direct access or refresh, requests a current QR through the official Python API.
- Invalid/missing PNG data renders an error state, never a broken image.
- Provides retry and return-to-module actions.
- Shows numbered instructions: open WhatsApp on the client's phone; navigate to **Aparelhos Conectados** > **Conectar um aparelho**; point the camera at the screen.
- Provides a **Concluído / Fechar** button that clears the in-memory QR and returns to `/admin/whatsapp`.

## Accessibility and Layout

- Inputs have visible labels and associated errors.
- Loading/error/success changes use `aria-live` without moving focus unexpectedly.
- QR image has meaningful alternative text and fixed intrinsic dimensions.
- Buttons are keyboard reachable and include text plus Lucide icons where useful.
- Mobile and desktop layouts keep the instance identity, QR and actions non-overlapping.
