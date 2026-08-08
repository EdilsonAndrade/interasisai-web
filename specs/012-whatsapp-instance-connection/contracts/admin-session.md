# Admin Session Contract

## Environment

- `ADM_USER`: server-only configured username.
- `ADM_PWD`: server-only configured password.
- `ADMIN_SESSION_SECRET`: server-only high-entropy HMAC key.
- Existing `NEXT_PUBLIC_ADM_USER` and `NEXT_PUBLIC_ADM_PWD` are deprecated and must not be read by client code.

## `POST /api/admin/session`

Request body:

```json
{
  "user": "admin",
  "password": "configured-secret"
}
```

Success (`204 No Content`): sets `admin_session` with `HttpOnly`, `SameSite=Strict`, `Path=/admin`, bounded `Max-Age`, and `Secure` in production.

Failure:

- `400`: malformed or missing fields.
- `401`: credentials do not match; response uses the same generic message for user/password mismatch.
- `503`: required server configuration is absent.

The response and logs never echo credentials.

## `DELETE /api/admin/session`

Success (`204 No Content`): expires `admin_session` immediately with the same cookie path/flags.

## Protected Page Check

Server wrappers for `/admin/whatsapp` and `/admin/whatsapp/{instanceName}/qrcode` validate signature and expiration before rendering. Missing, expired, or modified sessions redirect to `/admin`; the login screen does not receive a QR Code or protected page content.

## Token Rules

- Payload contains only subject, issue time, and expiry.
- HMAC-SHA256 signature uses `ADMIN_SESSION_SECRET`.
- Verification compares signatures with a timing-safe method.
- Default lifetime is short and bounded; implementation documents the chosen duration.
