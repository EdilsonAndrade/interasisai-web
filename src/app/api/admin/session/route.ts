import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/adminSession";
import { adminLoginSchema } from "@/lib/whatsappSchemas";

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
};

export async function POST(request: Request): Promise<NextResponse> {
  const expectedUser = process.env.ADM_USER?.trim();
  const expectedPassword = process.env.ADM_PWD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedUser || !expectedPassword || !sessionSecret) {
    return NextResponse.json(
      { message: "Autenticação administrativa indisponível." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  if (
    parsed.data.user !== expectedUser ||
    parsed.data.password !== expectedPassword
  ) {
    return NextResponse.json(
      { message: "Usuário ou senha inválidos." },
      { status: 401 },
    );
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    createAdminSessionToken(sessionSecret),
    { ...cookieOptions, maxAge: ADMIN_SESSION_MAX_AGE },
  );
  return response;
}

export async function DELETE(): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}