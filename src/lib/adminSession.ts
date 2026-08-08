import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 4;

export type AdminSessionPayload = {
  subject: "admin";
  issuedAt: number;
  expiresAt: number;
};

function encodePayload(payload: AdminSessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminSessionToken(
  secret: string,
  issuedAt = Math.floor(Date.now() / 1000),
  maxAge = ADMIN_SESSION_MAX_AGE,
): string {
  const encoded = encodePayload({
    subject: "admin",
    issuedAt,
    expiresAt: issuedAt + maxAge,
  });

  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): AdminSessionPayload | null {
  if (!token || !secret) return null;

  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;

  const expected = sign(encoded, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<AdminSessionPayload>;

    if (
      payload.subject !== "admin" ||
      !Number.isInteger(payload.issuedAt) ||
      !Number.isInteger(payload.expiresAt) ||
      (payload.expiresAt as number) <= (payload.issuedAt as number) ||
      (payload.expiresAt as number) < now
    ) {
      return null;
    }

    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function hasValidAdminSession(token: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(secret && verifyAdminSessionToken(token, secret));
}