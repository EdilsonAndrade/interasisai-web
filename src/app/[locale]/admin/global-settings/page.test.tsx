import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/adminSession";
import GlobalSettingsPage, { metadata } from "./page";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("@/lib/adminSession", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  hasValidAdminSession: jest.fn(),
}));
jest.mock("@/components/admin/tenants/GlobalNotificationRecipients", () => ({
  GlobalNotificationRecipients: () => <div>Recipients Section</div>,
}));
jest.mock("@/components/admin/tenants/PlanCalculator", () => ({
  PlanCalculator: () => <div>Calculator Section</div>,
}));

const cookiesMock = jest.mocked(cookies);
const validSessionMock = jest.mocked(hasValidAdminSession);
const redirectMock = jest.mocked(redirect);

describe("GlobalSettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "session" }),
    } as Awaited<ReturnType<typeof cookies>>);
  });

  it("renders the protected page for an administrator", async () => {
    validSessionMock.mockReturnValue(true);
    render(await GlobalSettingsPage());

    expect(screen.getByRole("heading", { name: "Configurações Globais" })).toBeInTheDocument();
    expect(screen.getByText("Recipients Section")).toBeInTheDocument();
    expect(screen.getByText("Calculator Section")).toBeInTheDocument();
    expect(metadata.title).toBe("Configurações Globais | Interasis AI");
  });

  it("redirects a user without an admin session", async () => {
    validSessionMock.mockReturnValue(false);
    redirectMock.mockImplementation(() => { throw new Error("redirect"); });

    await expect(GlobalSettingsPage()).rejects.toThrow("redirect");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });
});
