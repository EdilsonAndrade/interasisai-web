import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/adminSession";
import TenantsPage, { metadata } from "./page";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("@/lib/adminSession", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  hasValidAdminSession: jest.fn(),
}));
jest.mock("@/components/admin/tenants/TenantManagement", () => ({
  TenantManagement: () => <h1>Tenants</h1>,
}));

const cookiesMock = jest.mocked(cookies);
const validSessionMock = jest.mocked(hasValidAdminSession);
const redirectMock = jest.mocked(redirect);

describe("TenantsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "session" }),
    } as Awaited<ReturnType<typeof cookies>>);
  });

  it("renders the protected tenant experience for an administrator", async () => {
    validSessionMock.mockReturnValue(true);
    render(await TenantsPage());

    expect(screen.getByRole("heading", { name: "Tenants" })).toBeInTheDocument();
    expect(metadata.title).toBe("Tenants | Interasis AI");
  });

  it("redirects a user without an admin session", async () => {
    validSessionMock.mockReturnValue(false);
    redirectMock.mockImplementation(() => { throw new Error("redirect"); });

    await expect(TenantsPage()).rejects.toThrow("redirect");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });
});