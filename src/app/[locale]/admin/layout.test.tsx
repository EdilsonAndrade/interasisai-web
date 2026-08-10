import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { hasValidAdminSession } from "@/lib/adminSession";
import AdminLayout from "./layout";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@/lib/adminSession", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  hasValidAdminSession: jest.fn(),
}));
jest.mock("@/components/admin/AdminNavigation", () => ({
  AdminNavigation: () => <nav aria-label="Administração" />,
}));

const cookiesMock = jest.mocked(cookies);
const validSessionMock = jest.mocked(hasValidAdminSession);

describe("AdminLayout", () => {
  beforeEach(() => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "session" }),
    } as Awaited<ReturnType<typeof cookies>>);
  });

  it("shows navigation only for an authenticated administrator", async () => {
    validSessionMock.mockReturnValue(true);
    const { rerender } = render(await AdminLayout({ children: <main>Content</main> }));
    expect(screen.getByRole("navigation", { name: "Administração" })).toBeInTheDocument();

    validSessionMock.mockReturnValue(false);
    rerender(await AdminLayout({ children: <main>Content</main> }));
    expect(screen.queryByRole("navigation", { name: "Administração" })).not.toBeInTheDocument();
  });
});