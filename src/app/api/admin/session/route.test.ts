/** @jest-environment node */

import { DELETE, POST } from "./route";

const ORIGINAL_ENV = process.env;

describe("admin session route", () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      ADM_USER: "admin",
      ADM_PWD: "secret",
      ADMIN_SESSION_SECRET: "test-secret-with-enough-entropy",
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("sets a protected cookie for valid credentials", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ user: "admin", password: "secret" }),
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toMatch(/admin_session=.*HttpOnly/i);
    expect(response.headers.get("set-cookie")).toMatch(/SameSite=strict/i);
  });

  it("rejects invalid and malformed credentials", async () => {
    const invalid = await POST(
      new Request("http://localhost/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ user: "admin", password: "wrong" }),
      }),
    );
    const malformed = await POST(
      new Request("http://localhost/api/admin/session", {
        method: "POST",
        body: "not-json",
      }),
    );

    expect(invalid.status).toBe(401);
    expect(malformed.status).toBe(400);
  });

  it("returns 503 when server configuration is absent", async () => {
    delete process.env.ADMIN_SESSION_SECRET;

    const response = await POST(
      new Request("http://localhost/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ user: "admin", password: "secret" }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("expires the cookie on logout", async () => {
    const response = await DELETE();

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });
});